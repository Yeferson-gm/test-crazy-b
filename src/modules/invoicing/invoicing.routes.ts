import { Elysia, t } from "elysia";
import { invoicingController } from "./invoicing.controller";
import { requireAuth } from "#shared/middleware/auth";
import {
	successResponse,
	errorResponse,
	paginatedResponse,
} from "#shared/utils/response";

export const invoicingRoutes = new Elysia({ prefix: "/invoices" })
	.use(requireAuth())

	/**
	 * POST /invoices
	 * Genera un comprobante electrónico
	 */
	.post(
		"/",
		async ({ body, user, set }) => {
			try {
				const invoice = await invoicingController.createInvoice(body);

				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== invoice.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				set.status = 201;
				return successResponse(invoice, "Comprobante generado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				saleId: t.String(),
				invoiceType: t.Union([
					t.Literal("boleta"),
					t.Literal("factura"),
					t.Literal("nota_credito"),
					t.Literal("nota_debito"),
				]),
				serie: t.String(),
			}),
			detail: {
				tags: ["Invoicing"],
				summary: "Generar comprobante",
				description:
					"Genera un comprobante electrónico para una venta y lo envía a SUNAT",
			},
		},
	)

	/**
	 * GET /invoices/:id
	 * Obtiene un comprobante por ID
	 */
	.get(
		"/:id",
		async ({ params, user, set }) => {
			try {
				const invoice = await invoicingController.getInvoiceById(params.id);

				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== invoice.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a este comprobante");
				}

				return successResponse(invoice);
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
				tags: ["Invoicing"],
				summary: "Obtener comprobante",
				description: "Obtiene los detalles completos de un comprobante",
			},
		},
	)

	/**
	 * GET /invoices/store/:storeId
	 * Obtiene comprobantes de una tienda
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

				const result = await invoicingController.getStoreInvoices(
					params.storeId,
					{
						startDate: query.startDate ? new Date(query.startDate) : undefined,
						endDate: query.endDate ? new Date(query.endDate) : undefined,
						status: query.status,
						page: query.page ? parseInt(query.page) : undefined,
						limit: query.limit ? parseInt(query.limit) : undefined,
					},
				);

				return paginatedResponse(
					result.invoices,
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
				status: t.Optional(t.String()),
				page: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Invoicing"],
				summary: "Listar comprobantes",
				description: "Obtiene comprobantes de una tienda con filtros",
			},
		},
	)

	/**
	 * POST /invoices/:id/cancel
	 * Anula un comprobante (solo admin y manager)
	 */
	.use(requireAuth({ roles: ["admin", "manager"] }))
	.post(
		"/:id/cancel",
		async ({ params, body, user, set }) => {
			try {
				const invoice = await invoicingController.getInvoiceById(params.id);

				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== invoice.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a este comprobante");
				}

				const cancelledInvoice = await invoicingController.cancelInvoice(
					params.id,
					body.reason,
				);

				return successResponse(
					cancelledInvoice,
					"Comprobante anulado exitosamente",
				);
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
				reason: t.String({ minLength: 10 }),
			}),
			detail: {
				tags: ["Invoicing"],
				summary: "Anular comprobante",
				description: "Anula un comprobante electrónico (requiere permisos)",
			},
		},
	);
