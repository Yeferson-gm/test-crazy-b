import { Elysia, t } from "elysia";
import { paymentsController } from "./payments.controller";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const paymentsRoutes = new Elysia({ prefix: "/payments" })
	.use(requireAuth())

	/**
	 * POST /payments
	 * Registra un pago
	 */
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const payment = await paymentsController.createPaymentRecord(body);
				set.status = 201;
				return successResponse(payment, "Pago registrado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				saleId: t.String(),
				amount: t.String(),
				paymentMethod: t.Union([
					t.Literal("cash"),
					t.Literal("card"),
					t.Literal("yape"),
					t.Literal("plin"),
					t.Literal("transfer"),
				]),
				reference: t.Optional(t.String()),
				notes: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Payments"],
				summary: "Registrar pago",
			},
		},
	)

	/**
	 * GET /payments/sale/:saleId
	 * Obtiene pagos de una venta
	 */
	.get(
		"/sale/:saleId",
		async ({ params }) => {
			try {
				const payments = await paymentsController.getSalePayments(
					params.saleId,
				);
				return successResponse(payments);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				saleId: t.String(),
			}),
			detail: {
				tags: ["Payments"],
				summary: "Pagos de venta",
			},
		},
	)

	/**
	 * POST /payments/cash-register/open
	 * Abre caja registradora
	 */
	.post(
		"/cash-register/open",
		async ({ body, user, set }) => {
			try {
				if (user.role !== "admin" && user.storeId !== body.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				const register = await paymentsController.openCashRegister({
					...body,
					userId: user.id,
				});

				set.status = 201;
				return successResponse(register, "Caja abierta exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				storeId: t.String(),
				openingAmount: t.String(),
				notes: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Payments"],
				summary: "Abrir caja",
			},
		},
	)

	/**
	 * POST /payments/cash-register/:id/close
	 * Cierra caja registradora
	 */
	.post(
		"/cash-register/:id/close",
		async ({ params, body, set }) => {
			try {
				const register = await paymentsController.closeCashRegister({
					registerId: params.id,
					...body,
				});

				return successResponse(register, "Caja cerrada exitosamente");
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
				closingAmount: t.String(),
				notes: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Payments"],
				summary: "Cerrar caja",
			},
		},
	)

	/**
	 * GET /payments/cash-register/current/:storeId
	 * Obtiene caja actual abierta
	 */
	.get(
		"/cash-register/current/:storeId",
		async ({ params, user, set }) => {
			try {
				if (user.role !== "admin" && user.storeId !== params.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				const register = await paymentsController.getCurrentCashRegister(
					params.storeId,
				);

				if (!register) {
					return successResponse(null, "No hay caja abierta");
				}

				return successResponse(register);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				storeId: t.String(),
			}),
			detail: {
				tags: ["Payments"],
				summary: "Caja actual",
			},
		},
	)

	/**
	 * GET /payments/cash-register/history/:storeId
	 * Historial de cajas
	 */
	.get(
		"/cash-register/history/:storeId",
		async ({ params, query, user, set }) => {
			try {
				if (user.role !== "admin" && user.storeId !== params.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				const history = await paymentsController.getCashRegisterHistory(
					params.storeId,
					query.limit ? parseInt(query.limit) : undefined,
				);

				return successResponse(history);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				storeId: t.String(),
			}),
			query: t.Object({
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Payments"],
				summary: "Historial de cajas",
			},
		},
	)

	/**
	 * GET /payments/cash-register/:id
	 * Detalles de caja
	 */
	.get(
		"/cash-register/:id",
		async ({ params }) => {
			try {
				const register = await paymentsController.getCashRegisterById(
					params.id,
				);
				return successResponse(register);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Payments"],
				summary: "Detalles de caja",
			},
		},
	);
