import { Elysia, t } from "elysia";
import { categoriesController } from "./categories.controller";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const categoriesRoutes = new Elysia({ prefix: "/categories" })
	.use(requireAuth())

	/**
	 * POST /categories
	 * Crea una nueva categoría
	 */
	.use(requireAuth({ roles: ["admin", "manager"] }))
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const category = await categoriesController.createCategory(body);
				set.status = 201;
				return successResponse(category, "Categoría creada exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				description: t.Optional(t.String()),
				parentId: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Categories"],
				summary: "Crear categoría",
			},
		},
	)

	/**
	 * GET /categories
	 * Obtiene todas las categorías
	 */
	.get(
		"/",
		async ({ query }) => {
			try {
				const categories = await categoriesController.getAllCategories(
					query.includeInactive === "true",
				);
				return successResponse(categories);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				includeInactive: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Categories"],
				summary: "Listar categorías",
			},
		},
	)

	/**
	 * GET /categories/roots
	 * Obtiene categorías raíz
	 */
	.get(
		"/roots",
		async () => {
			try {
				const categories = await categoriesController.getRootCategories();
				return successResponse(categories);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			detail: {
				tags: ["Categories"],
				summary: "Categorías raíz",
			},
		},
	)

	/**
	 * GET /categories/tree
	 * Obtiene árbol jerárquico
	 */
	.get(
		"/tree",
		async () => {
			try {
				const tree = await categoriesController.getCategoryTree();
				return successResponse(tree);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			detail: {
				tags: ["Categories"],
				summary: "Árbol de categorías",
			},
		},
	)

	/**
	 * GET /categories/:id
	 * Obtiene una categoría por ID
	 */
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const category = await categoriesController.getCategoryById(params.id);
				return successResponse(category);
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
				tags: ["Categories"],
				summary: "Obtener categoría",
			},
		},
	)

	/**
	 * PUT /categories/:id
	 * Actualiza una categoría
	 */
	.use(requireAuth({ roles: ["admin", "manager"] }))
	.put(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const category = await categoriesController.updateCategory(
					params.id,
					body,
				);
				return successResponse(category, "Categoría actualizada exitosamente");
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
				name: t.Optional(t.String()),
				description: t.Optional(t.String()),
				parentId: t.Optional(t.String()),
				isActive: t.Optional(t.Boolean()),
			}),
			detail: {
				tags: ["Categories"],
				summary: "Actualizar categoría",
			},
		},
	)

	/**
	 * DELETE /categories/:id
	 * Elimina una categoría
	 */
	.use(requireAuth({ roles: ["admin"] }))
	.delete(
		"/:id",
		async ({ params, set }) => {
			try {
				const category = await categoriesController.deleteCategory(params.id);
				return successResponse(category, "Categoría eliminada exitosamente");
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
				tags: ["Categories"],
				summary: "Eliminar categoría",
			},
		},
	);
