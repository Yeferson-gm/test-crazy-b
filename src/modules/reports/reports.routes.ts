import { Elysia, t } from "elysia";
import { reportsController } from "./reports.controller";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const reportsRoutes = new Elysia({ prefix: "/reports" })
	.use(requireAuth())

	/**
	 * GET /reports/sales
	 * Reporte de ventas por período
	 */
	.get(
		"/sales",
		async ({ query, user, set }) => {
			try {
				const storeId = user.role === "admin" ? query.storeId : user.storeId;

				if (!query.startDate || !query.endDate) {
					set.status = 400;
					return errorResponse("Se requieren startDate y endDate");
				}

				const report = await reportsController.getSalesReport({
					storeId,
					startDate: new Date(query.startDate),
					endDate: new Date(query.endDate),
				});

				return successResponse(report);
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				storeId: t.Optional(t.String()),
				startDate: t.String(),
				endDate: t.String(),
			}),
			detail: {
				tags: ["Reports"],
				summary: "Reporte de ventas",
			},
		},
	)

	/**
	 * GET /reports/top-products
	 * Productos más vendidos
	 */
	.get(
		"/top-products",
		async ({ query, user }) => {
			try {
				const storeId = user.role === "admin" ? query.storeId : user.storeId;

				const report = await reportsController.getTopSellingProducts({
					storeId,
					startDate: query.startDate ? new Date(query.startDate) : undefined,
					endDate: query.endDate ? new Date(query.endDate) : undefined,
					limit: query.limit ? parseInt(query.limit) : undefined,
				});

				return successResponse(report);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				storeId: t.Optional(t.String()),
				startDate: t.Optional(t.String()),
				endDate: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Reports"],
				summary: "Productos más vendidos",
			},
		},
	)

	/**
	 * GET /reports/low-stock/:storeId
	 * Reporte de productos con bajo stock
	 */
	.get(
		"/low-stock/:storeId",
		async ({ params, user, set }) => {
			try {
				if (user.role !== "admin" && user.storeId !== params.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				const report = await reportsController.getLowStockReport(
					params.storeId,
				);
				return successResponse(report);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				storeId: t.String(),
			}),
			detail: {
				tags: ["Reports"],
				summary: "Reporte de stock bajo",
			},
		},
	)

	/**
	 * GET /reports/payment-methods
	 * Reporte de ventas por método de pago
	 */
	.get(
		"/payment-methods",
		async ({ query, user, set }) => {
			try {
				const storeId = user.role === "admin" ? query.storeId : user.storeId;

				if (!query.startDate || !query.endDate) {
					set.status = 400;
					return errorResponse("Se requieren startDate y endDate");
				}

				const report = await reportsController.getSalesByPaymentMethod({
					storeId,
					startDate: new Date(query.startDate),
					endDate: new Date(query.endDate),
				});

				return successResponse(report);
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				storeId: t.Optional(t.String()),
				startDate: t.String(),
				endDate: t.String(),
			}),
			detail: {
				tags: ["Reports"],
				summary: "Ventas por método de pago",
			},
		},
	)

	/**
	 * GET /reports/daily-sales
	 * Reporte de ventas diarias (últimos 30 días)
	 */
	.get(
		"/daily-sales",
		async ({ query, user }) => {
			try {
				const storeId = user.role === "admin" ? query.storeId : user.storeId;

				const report = await reportsController.getDailySalesReport(storeId);
				return successResponse(report);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				storeId: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Reports"],
				summary: "Ventas diarias (30 días)",
			},
		},
	)

	/**
	 * GET /reports/dashboard
	 * Estadísticas del dashboard
	 */
	.get(
		"/dashboard",
		async ({ query, user }) => {
			try {
				const storeId = user.role === "admin" ? query.storeId : user.storeId;

				const stats = await reportsController.getDashboardStats(storeId);
				return successResponse(stats);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				storeId: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Reports"],
				summary: "Dashboard general",
			},
		},
	);
