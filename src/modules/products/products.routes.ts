import { Elysia, t } from "elysia";
import { productsController } from "#modules/products/products.controller";
import {
	createProductSchema,
	updateProductSchema,
	productQuerySchema,
} from "#modules/products/products.schema";
import { requireAuth } from "#shared/middleware/auth";
import {
	successResponse,
	errorResponse,
	paginatedResponse,
} from "#shared/utils/response";

export const productsRoutes = new Elysia({ prefix: "/products" })
	.use(requireAuth())

	/**
	 * POST /products
	 * Crea un nuevo producto (manager y admin)
	 */
	.use(requireAuth({ roles: ["admin", "manager"] }))
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const product = await productsController.createProduct(body);
				set.status = 201;
				return successResponse(product, "Producto creado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: createProductSchema,
			detail: {
				tags: ["Products"],
				summary: "Crear producto",
				description: "Crea un nuevo producto (requiere rol manager o admin)",
			},
		},
	)

	/**
	 * GET /products
	 * Lista productos con paginación y filtros
	 */
	.get(
		"/",
		async ({ query }) => {
			try {
				const result = await productsController.getAllProducts({
					page: query.page ? parseInt(query.page) : undefined,
					limit: query.limit ? parseInt(query.limit) : undefined,
					search: query.search,
					categoryId: query.categoryId,
					includeInactive: query.includeInactive === "true",
				});

				return paginatedResponse(
					result.products,
					result.pagination.page,
					result.pagination.limit,
					result.pagination.total,
				);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: productQuerySchema,
			detail: {
				tags: ["Products"],
				summary: "Listar productos",
				description: "Obtiene productos con paginación y filtros",
			},
		},
	)

	/**
	 * GET /products/:id
	 * Obtiene un producto por ID
	 */
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const product = await productsController.getProductById(params.id);
				return successResponse(product);
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
				tags: ["Products"],
				summary: "Obtener producto",
				description: "Obtiene un producto por su ID",
			},
		},
	)

	/**
	 * GET /products/barcode/:barcode
	 * Obtiene un producto por código de barras/QR
	 */
	.get(
		"/barcode/:barcode",
		async ({ params, set }) => {
			try {
				const product = await productsController.getProductByBarcode(
					params.barcode,
				);
				return successResponse(product);
			} catch (error: any) {
				set.status = 404;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				barcode: t.String(),
			}),
			detail: {
				tags: ["Products"],
				summary: "Obtener producto por código",
				description: "Busca un producto por su código de barras o QR",
			},
		},
	)

	/**
	 * PUT /products/:id
	 * Actualiza un producto (manager y admin)
	 */
	.use(requireAuth({ roles: ["admin", "manager"] }))
	.put(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const product = await productsController.updateProduct(params.id, body);
				return successResponse(product, "Producto actualizado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			body: updateProductSchema,
			detail: {
				tags: ["Products"],
				summary: "Actualizar producto",
				description: "Actualiza un producto (requiere rol manager o admin)",
			},
		},
	)

	/**
	 * DELETE /products/:id
	 * Desactiva un producto (solo admin)
	 */
	.use(requireAuth({ roles: ["admin"] }))
	.delete(
		"/:id",
		async ({ params, set }) => {
			try {
				const product = await productsController.deleteProduct(params.id);
				return successResponse(product, "Producto desactivado exitosamente");
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
				tags: ["Products"],
				summary: "Eliminar producto",
				description: "Desactiva un producto (solo admin)",
			},
		},
	)

	/**
	 * GET /products/store/:storeId/low-stock
	 * Obtiene productos con stock bajo en una tienda
	 */
	.use(requireAuth())
	.get(
		"/store/:storeId/low-stock",
		async ({ params, set, user }) => {
			try {
				// Verificar acceso a la tienda
				if (user.role !== "admin" && user.storeId !== params.storeId) {
					set.status = 403;
					return errorResponse("No tienes acceso a esta tienda");
				}

				const products = await productsController.getLowStockProducts(
					params.storeId,
				);
				return successResponse(products);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				storeId: t.String(),
			}),
			detail: {
				tags: ["Products"],
				summary: "Productos con stock bajo",
				description: "Obtiene productos con inventario por debajo del mínimo",
			},
		},
	);
