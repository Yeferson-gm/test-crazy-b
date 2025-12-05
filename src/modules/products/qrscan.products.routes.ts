import { Elysia, t } from "elysia";
import { qrScanProductsService } from "./qrscan.products.service";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const qrScanProductsRoutes = new Elysia({ prefix: "/product-scanner" })
	/**
	 * POST /product-scanner/session
	 * Crear sesión para dispositivo móvil
	 */
	.post(
		"/session",
		async ({ body, set }) => {
			try {
				const session = qrScanProductsService.createSession(body.sessionId);
				set.status = 201;
				return successResponse(session, "Sesión creada");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				sessionId: t.String(),
			}),
		},
	)

	/**
	 * POST /product-scanner/connect/:sessionId
	 * Dispositivo se conecta
	 */
	.post(
		"/connect/:sessionId",
		async ({ params, set }) => {
			try {
				const session = qrScanProductsService.connectDevice(params.sessionId);
				return successResponse(session, "Dispositivo conectado");
			} catch (error: any) {
				set.status = 404;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				sessionId: t.String(),
			}),
		},
	)

	/**
	 * GET /product-scanner/status/:sessionId
	 * Obtener estado de sesión (polling desde desktop)
	 */
	.get(
		"/status/:sessionId",
		async ({ params }) => {
			const status = qrScanProductsService.getSessionStatus(params.sessionId);
			return successResponse(status);
		},
		{
			params: t.Object({
				sessionId: t.String(),
			}),
		},
	)

	/**
	 * POST /product-scanner/notify/:sessionId
	 * Marcar como notificado
	 */
	.post(
		"/notify/:sessionId",
		async ({ params }) => {
			qrScanProductsService.markAsNotified(params.sessionId);
			return successResponse(null, "Marcado como notificado");
		},
		{
			params: t.Object({
				sessionId: t.String(),
			}),
		},
	)

	/**
	 * POST /product-scanner/scan/:sessionId
	 * Escanear código desde dispositivo móvil
	 */
	.post(
		"/scan/:sessionId",
		async ({ params, body, set }) => {
			try {
				const result = await qrScanProductsService.scanBarcode(
					params.sessionId,
					body.barcode,
				);
				return successResponse(result);
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				sessionId: t.String(),
			}),
			body: t.Object({
				barcode: t.String(),
			}),
		},
	)

	/**
	 * POST /product-scanner/increment-stock
	 * Incrementar stock de producto existente
	 */
	.use(requireAuth())
	.post(
		"/increment-stock",
		async ({ body, set }) => {
			try {
				const product = await qrScanProductsService.incrementStock(
					body.productId,
					body.quantity,
				);
				return successResponse(product, "Stock incrementado");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				productId: t.String(),
				quantity: t.Optional(t.Number({ minimum: 1 })),
			}),
		},
	)

	/**
	 * POST /product-scanner/clear/:sessionId
	 * Limpiar código escaneado
	 */
	.post(
		"/clear/:sessionId",
		async ({ params }) => {
			qrScanProductsService.clearScannedBarcode(params.sessionId);
			return successResponse(null, "Código limpiado");
		},
		{
			params: t.Object({
				sessionId: t.String(),
			}),
		},
	)

	/**
	 * DELETE /product-scanner/session/:sessionId
	 * Eliminar sesión
	 */
	.delete(
		"/session/:sessionId",
		async ({ params }) => {
			qrScanProductsService.deleteSession(params.sessionId);
			return successResponse(null, "Sesión eliminada");
		},
		{
			params: t.Object({
				sessionId: t.String(),
			}),
		},
	);
