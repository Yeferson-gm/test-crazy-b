import { Elysia, t } from "elysia";
import { notificationsController } from "./notifications.controller";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const notificationsRoutes = new Elysia({ prefix: "/notifications" })
	.use(requireAuth())

	/**
	 * GET /notifications
	 * Obtiene notificaciones del usuario
	 */
	.get(
		"/",
		async ({ user, query }) => {
			try {
				const notifications =
					await notificationsController.getUserNotifications(user.id, {
						unreadOnly: query.unreadOnly === "true",
						limit: query.limit ? parseInt(query.limit) : undefined,
					});

				return successResponse(notifications);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				unreadOnly: t.Optional(t.String()),
				limit: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Notifications"],
				summary: "Listar notificaciones",
			},
		},
	)

	/**
	 * GET /notifications/unread-count
	 * Cuenta notificaciones no leídas
	 */
	.get(
		"/unread-count",
		async ({ user }) => {
			try {
				const count = await notificationsController.getUnreadCount(user.id);
				return successResponse({ count });
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			detail: {
				tags: ["Notifications"],
				summary: "Contar no leídas",
			},
		},
	)

	/**
	 * PATCH /notifications/:id/read
	 * Marca notificación como leída
	 */
	.patch(
		"/:id/read",
		async ({ params, user }) => {
			try {
				const notification = await notificationsController.markAsRead(
					params.id,
					user.id,
				);
				return successResponse(notification, "Notificación marcada como leída");
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Notifications"],
				summary: "Marcar como leída",
			},
		},
	)

	/**
	 * PATCH /notifications/read-all
	 * Marca todas como leídas
	 */
	.patch(
		"/read-all",
		async ({ user }) => {
			try {
				await notificationsController.markAllAsRead(user.id);
				return successResponse(
					null,
					"Todas las notificaciones marcadas como leídas",
				);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			detail: {
				tags: ["Notifications"],
				summary: "Marcar todas como leídas",
			},
		},
	)

	/**
	 * DELETE /notifications/:id
	 * Elimina una notificación
	 */
	.delete(
		"/:id",
		async ({ params, user }) => {
			try {
				await notificationsController.deleteNotification(params.id, user.id);
				return successResponse(null, "Notificación eliminada");
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Notifications"],
				summary: "Eliminar notificación",
			},
		},
	);
