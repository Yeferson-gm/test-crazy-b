import { Elysia } from "elysia";
import { authController } from "#modules/auth/auth.controller";
import {
	registerSchema,
	updatePasswordSchema,
} from "#modules/auth/auth.schema";
import { authMiddleware } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const authRoutes = new Elysia({ prefix: "/auth" })

	.post(
		"/register",
		async ({ body, set }) => {
			try {
				const user = await authController.register(body);
				set.status = 201;
				return successResponse(user, "Usuario registrado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: registerSchema,
			detail: {
				tags: ["Auth"],
				summary: "Registrar nuevo usuario",
				description:
					"Crea un nuevo usuario en el sistema (requiere permisos de admin)",
			},
		},
	)

	.use(authMiddleware)
	.get(
		"/me",
		async (context: any) => {
			try {
				const userData = await authController.getProfile(context.user.id);
				return successResponse(userData);
			} catch (error: any) {
				context.set.status = 404;
				return errorResponse(error.message);
			}
		},
		{
			detail: {
				tags: ["Auth"],
				summary: "Obtener usuario actual",
				description: "Devuelve la información del usuario autenticado",
			},
		},
	)

	.put(
		"/password",
		async (context: any) => {
			try {
				const result = await authController.updatePassword(
					context.user.id,
					context.body.currentPassword,
					context.body.newPassword,
				);
				return successResponse(result);
			} catch (error: any) {
				context.set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: updatePasswordSchema,
			detail: {
				tags: ["Auth"],
				summary: "Actualizar contraseña",
				description: "Cambia la contraseña del usuario autenticado",
			},
		},
	);
