import { Elysia, t } from "elysia";
import { storesController } from "./stores.controller";
import { createStoreSchema, updateStoreSchema } from "./stores.schema";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const storesRoutes = new Elysia({ prefix: "/stores" })
	// Rutas que requieren autenticación básica (cualquier usuario autenticado)
	.use(requireAuth())

	/**
	 * GET /stores
	 * Obtiene todas las tiendas
	 */
	.get(
		"/",
		async ({ query }) => {
			try {
				const stores = await storesController.getAllStores(
					query.includeInactive === "true",
				);
				return successResponse(stores);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				includeInactive: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Stores"],
				summary: "Listar tiendas",
				description: "Obtiene todas las tiendas activas",
			},
		},
	)

	/**
	 * GET /stores/:id
	 * Obtiene una tienda por ID
	 */
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const store = await storesController.getStoreById(params.id);
				return successResponse(store);
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
				tags: ["Stores"],
				summary: "Obtener tienda",
				description: "Obtiene una tienda por su ID",
			},
		},
	)

	/**
	 * GET /stores/code/:code
	 * Obtiene una tienda por código
	 */
	.get(
		"/code/:code",
		async ({ params, set }) => {
			try {
				const store = await storesController.getStoreByCode(params.code);
				return successResponse(store);
			} catch (error: any) {
				set.status = 404;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				code: t.String(),
			}),
			detail: {
				tags: ["Stores"],
				summary: "Obtener tienda por código",
				description: "Obtiene una tienda por su código único",
			},
		},
	)

	/**
	 * GET /stores/search
	 * Busca tiendas por nombre
	 */
	.get(
		"/search",
		async ({ query }) => {
			try {
				const stores = await storesController.searchStores(query.q);
				return successResponse(stores);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				q: t.String({ minLength: 1 }),
			}),
			detail: {
				tags: ["Stores"],
				summary: "Buscar tiendas",
				description: "Busca tiendas por nombre",
			},
		},
	)

	// Rutas que requieren rol de admin
	.use(requireAuth({ roles: ["admin"] }))

	/**
	 * POST /stores
	 * Crea una nueva tienda (solo admin)
	 */
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const store = await storesController.createStore(body);
				set.status = 201;
				return successResponse(store, "Tienda creada exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: createStoreSchema,
			detail: {
				tags: ["Stores"],
				summary: "Crear tienda",
				description: "Crea una nueva tienda (solo admin)",
			},
		},
	)

	/**
	 * PUT /stores/:id
	 * Actualiza una tienda (solo admin)
	 */
	.put(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const store = await storesController.updateStore(params.id, body);
				return successResponse(store, "Tienda actualizada exitosamente");
			} catch (error: any) {
				set.status = 404;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: updateStoreSchema,
			detail: {
				tags: ["Stores"],
				summary: "Actualizar tienda",
				description: "Actualiza los datos de una tienda (solo admin)",
			},
		},
	)

	/**
	 * PATCH /stores/:id/toggle
	 * Activa/Desactiva una tienda (solo admin)
	 */
	.patch(
		"/:id/toggle",
		async ({ params, set }) => {
			try {
				const store = await storesController.toggleStoreStatus(params.id);
				return successResponse(store, "Estado de tienda actualizado");
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
				tags: ["Stores"],
				summary: "Activar/Desactivar tienda",
				description:
					"Cambia el estado activo/inactivo de una tienda (solo admin)",
			},
		},
	)

	/**
	 * DELETE /stores/:id
	 * Elimina una tienda permanentemente (solo admin)
	 */
	.delete(
		"/:id",
		async ({ params, set }) => {
			try {
				await storesController.deleteStore(params.id);
				return successResponse(null, "Tienda eliminada exitosamente");
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
				tags: ["Stores"],
				summary: "Eliminar tienda",
				description: "Elimina permanentemente una tienda (solo admin)",
			},
		},
	);
