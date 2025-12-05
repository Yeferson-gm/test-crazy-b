import { Elysia, t } from "elysia";
import { salesController } from "./sales.controller";
import { requireAuth } from "#shared/middleware/auth";
import {
	successResponse,
	errorResponse,
	paginatedResponse,
} from "#shared/utils/response";

export const salesRoutes = new Elysia({ prefix: "/sales" })
	.use(requireAuth())

	/**
	 * POST /sales
	 * Crea una nueva venta
	 */
	.post(
		"/",
		async ({ body, user, set }) => {
			try {
				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== body.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				const sale = await salesController.createSale({
					...body,
					userId: user.id,
				});

				set.status = 201;
				return successResponse(sale, "Venta creada exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				storeId: t.String(),
				customerId: t.Optional(t.String()),
				customerData: t.Optional(
					t.Object({
						documentType: t.String(),
						documentNumber: t.String(),
						name: t.String(),
						email: t.Optional(t.String()),
						phone: t.Optional(t.String()),
						address: t.Optional(t.String()),
					}),
				),
				items: t.Array(
					t.Object({
						productId: t.String(),
						quantity: t.Number({ minimum: 1 }),
						unitPrice: t.String(),
						discount: t.Optional(t.String()),
					}),
				),
				paymentMethod: t.Union([
					t.Literal("cash"),
					t.Literal("card"),
					t.Literal("yape"),
					t.Literal("plin"),
					t.Literal("transfer"),
				]),
				paymentReference: t.Optional(t.String()),
				discount: t.Optional(t.String()),
				notes: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Sales"],
				summary: "Crear venta",
				description: "Registra una nueva venta y actualiza el inventario",
			},
		},
	)

	/**
	 * GET /sales/store/:storeId
	 * Obtiene ventas de una tienda
	 */
	.get(
		"/store/:storeId",
		async ({ params, query, user, set }) => {
			try {
				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== params.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				const result = await salesController.getStoreSales({
					storeId: params.storeId,
					startDate: query.startDate ? new Date(query.startDate) : undefined,
					endDate: query.endDate ? new Date(query.endDate) : undefined,
					page: query.page ? parseInt(query.page) : undefined,
					limit: query.limit ? parseInt(query.limit) : undefined,
				});

				return paginatedResponse(
					result.sales,
					result.pagination.page,
					result.pagination.limit,
					result.pagination.total,
				);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				storeId: t.String(),
			}),
			query: t.Object({
				startDate: t.Optional(t.String()),
				endDate: t.Optional(t.String()),
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Sales"],
				summary: "Listar ventas",
				description: "Obtiene ventas de una tienda con filtros y paginación",
			},
		},
	)

	/**
	 * GET /sales/:id
	 * Obtiene una venta por ID
	 */
	.get(
		"/:id",
		async ({ params, user, set }) => {
			try {
				const sale = await salesController.getSaleById(params.id);

				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== sale.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta venta");
				}

				return successResponse(sale);
			} catch (error: any) {
				set.status = 404;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Sales"],
				summary: "Obtener venta",
				description: "Obtiene los detalles completos de una venta",
			},
		},
	)

	/**
	 * POST /sales/:id/cancel
	 * Cancela una venta (solo admin y manager)
	 */
	.use(requireAuth({ roles: ["admin", "manager"] }))
	.post(
		"/:id/cancel",
		async ({ params, body, user, set }) => {
			try {
				const sale = await salesController.getSaleById(params.id);

				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== sale.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta venta");
				}

				const cancelledSale = await salesController.cancelSale(
					params.id,
					user.id,
					body.reason,
				);

				return successResponse(cancelledSale, "Venta cancelada exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: t.Object({
				reason: t.String({ minLength: 5 }),
			}),
			detail: {
				tags: ["Sales"],
				summary: "Cancelar venta",
				description:
					"Cancela una venta y restaura el inventario (requiere permisos)",
			},
		},
	);
