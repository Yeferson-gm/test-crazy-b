import { Elysia, t } from "elysia";
import { usersController } from "./users.controller";
import { updateProfileSchema } from "./users.schema";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";
import prisma from "#database/prisma";

export const usersRoutes = new Elysia({ prefix: "/users" })
	.use(requireAuth())

	/**
	 * GET /users/profile
	 * Obtiene el perfil completo del usuario autenticado incluyendo imagen
	 */
	.get(
		"/profile",
		async ({ user, set }) => {
			try {
				if (!user?.id) {
					set.status = 401;
					return errorResponse("Usuario no autenticado");
				}

				const userWithImage = await prisma.user.findUnique({
					where: { id: user.id },
					include: {
						profileImage: true,
						store: {
							select: {
								id: true,
								name: true,
							},
						},
					},
				});

				if (!userWithImage) {
					set.status = 404;
					return errorResponse("Usuario no encontrado");
				}

				// Construir respuesta con la URL de la imagen de perfil
				const profileData = {
					id: userWithImage.id,
					email: userWithImage.email,
					firstName: userWithImage.firstName,
					lastName: userWithImage.lastName,
					dni: userWithImage.dni,
					phone: userWithImage.phone,
					role: userWithImage.role,
					image: userWithImage.image,
					profileImage: userWithImage.profileImage || null,
					storeId: userWithImage.storeId,
					storeName: userWithImage.store?.name || null,
				};

				return successResponse(profileData);
			} catch (error: any) {
				console.error("[BACKEND] Error al obtener perfil:", error);
				set.status = 500;
				return errorResponse(error.message);
			}
		},
		{
			detail: {
				tags: ["Users"],
				summary: "Obtener perfil completo",
				description:
					"Obtiene el perfil del usuario autenticado incluyendo imagen de perfil",
			},
		},
	)

	/**
	 * PATCH /users/profile
	 * Actualiza el perfil del usuario autenticado
	 */
	.patch(
		"/profile",
		async ({ body, user, set }) => {
			try {
				console.log("[BACKEND] Petición de actualización de perfil recibida");
				console.log(
					"[BACKEND] User del contexto:",
					user ? { id: user.id, email: user.email } : "NO USER",
				);
				console.log("[BACKEND] Body recibido:", JSON.stringify(body, null, 2));

				if (!user?.id) {
					console.error("[BACKEND] Usuario no autenticado");
					set.status = 401;
					return errorResponse("Usuario no autenticado");
				}

				console.log("[BACKEND] Actualizando perfil para usuario:", user.id);
				const updatedUser = await usersController.updateProfile(user.id, body);
				console.log("[BACKEND] Perfil actualizado exitosamente:", updatedUser);

				return successResponse(updatedUser, "Perfil actualizado exitosamente");
			} catch (error: any) {
				console.error("[BACKEND] Error al actualizar perfil:", error);
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: updateProfileSchema,
			detail: {
				tags: ["Users"],
				summary: "Actualizar perfil",
				description: "Actualiza el perfil del usuario autenticado",
			},
		},
	)

	// Rutas CRUD de usuarios (requieren rol admin)
	.use(requireAuth({ roles: ["admin"] }))

	/**
	 * POST /users
	 * Crea un nuevo usuario (solo admin)
	 */
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const user = await usersController.createUser(body);
				set.status = 201;
				return successResponse(user, "Usuario creado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				email: t.String({ format: "email" }),
				password: t.String({ minLength: 6 }),
				name: t.String({ minLength: 1 }),
				phone: t.Optional(t.String()),
				role: t.Union([
					t.Literal("admin"),
					t.Literal("manager"),
					t.Literal("cashier"),
					t.Literal("seller"),
				]),
				storeId: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Users"],
				summary: "Crear usuario",
				description: "Crea un nuevo usuario (solo admin)",
			},
		},
	)

	/**
	 * GET /users
	 * Obtiene todos los usuarios (solo admin)
	 */
	.get(
		"/",
		async ({ query }) => {
			try {
				const users = await usersController.getAllUsers(
					query.includeInactive === "true",
				);
				return successResponse(users);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				includeInactive: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Users"],
				summary: "Listar usuarios",
				description: "Obtiene todos los usuarios (solo admin)",
			},
		},
	)

	/**
	 * GET /users/:id
	 * Obtiene un usuario por ID (solo admin)
	 */
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const user = await usersController.getUserById(params.id);
				return successResponse(user);
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
				tags: ["Users"],
				summary: "Obtener usuario",
				description: "Obtiene un usuario por ID (solo admin)",
			},
		},
	)

	/**
	 * PUT /users/:id
	 * Actualiza un usuario (solo admin)
	 */
	.put(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const user = await usersController.updateUser(params.id, body);
				return successResponse(user, "Usuario actualizado exitosamente");
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
				email: t.Optional(t.String({ format: "email" })),
				name: t.Optional(t.String()),
				phone: t.Optional(t.String()),
				role: t.Optional(
					t.Union([
						t.Literal("admin"),
						t.Literal("manager"),
						t.Literal("cashier"),
						t.Literal("seller"),
					]),
				),
				storeId: t.Optional(t.String()),
				isActive: t.Optional(t.Boolean()),
			}),
			detail: {
				tags: ["Users"],
				summary: "Actualizar usuario",
				description: "Actualiza un usuario (solo admin)",
			},
		},
	)

	/**
	 * DELETE /users/:id
	 * Elimina un usuario (solo admin)
	 */
	.delete(
		"/:id",
		async ({ params, set }) => {
			try {
				const user = await usersController.deleteUser(params.id);
				return successResponse(user, "Usuario eliminado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Users"],
				summary: "Eliminar usuario",
				description: "Elimina un usuario (solo admin)",
			},
		},
	);
