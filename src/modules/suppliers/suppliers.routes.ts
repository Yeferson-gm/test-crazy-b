import { Elysia, t } from "elysia";
import { suppliersController } from "./suppliers.controller";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const suppliersRoutes = new Elysia({ prefix: "/suppliers" })
	.use(requireAuth({ roles: ["admin", "manager"] }))

	/**
	 * POST /suppliers
	 * Crea un nuevo proveedor
	 */
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const supplier = await suppliersController.createSupplier(body);
				set.status = 201;
				return successResponse(supplier, "Proveedor creado exitosamente");
			} catch (error: any) {
				set.status = 400;
				return errorResponse(error.message);
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1 }),
				ruc: t.Optional(t.String()),
				email: t.Optional(t.String()),
				phone: t.Optional(t.String()),
				address: t.Optional(t.String()),
				contactName: t.Optional(t.String()),
				website: t.Optional(t.String()),
				notes: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Suppliers"],
				summary: "Crear proveedor",
			},
		},
	)

	/**
	 * GET /suppliers
	 * Obtiene todos los proveedores
	 */
	.get(
		"/",
		async ({ query }) => {
			try {
				const suppliers = await suppliersController.getAllSuppliers(
					query.includeInactive === "true",
				);
				return successResponse(suppliers);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				includeInactive: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Suppliers"],
				summary: "Listar proveedores",
			},
		},
	)

	/**
	 * GET /suppliers/search
	 * Busca proveedores
	 */
	.get(
		"/search",
		async ({ query }) => {
			try {
				const suppliers = await suppliersController.searchSuppliers(query.q);
				return successResponse(suppliers);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				q: t.String({ minLength: 1 }),
			}),
			detail: {
				tags: ["Suppliers"],
				summary: "Buscar proveedores",
			},
		},
	)

	/**
	 * GET /suppliers/:id
	 * Obtiene un proveedor por ID
	 */
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const supplier = await suppliersController.getSupplierById(params.id);
				return successResponse(supplier);
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
				tags: ["Suppliers"],
				summary: "Obtener proveedor",
			},
		},
	)

	/**
	 * PUT /suppliers/:id
	 * Actualiza un proveedor
	 */
	.put(
		"/:id",
		async ({ params, body, set }) => {
			try {
				const supplier = await suppliersController.updateSupplier(
					params.id,
					body,
				);
				return successResponse(supplier, "Proveedor actualizado exitosamente");
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
				ruc: t.Optional(t.String()),
				email: t.Optional(t.String()),
				phone: t.Optional(t.String()),
				address: t.Optional(t.String()),
				contactName: t.Optional(t.String()),
				website: t.Optional(t.String()),
				notes: t.Optional(t.String()),
				isActive: t.Optional(t.Boolean()),
			}),
			detail: {
				tags: ["Suppliers"],
				summary: "Actualizar proveedor",
			},
		},
	)

	/**
	 * DELETE /suppliers/:id
	 * Elimina un proveedor
	 */
	.use(requireAuth({ roles: ["admin"] }))
	.delete(
		"/:id",
		async ({ params, set }) => {
			try {
				const supplier = await suppliersController.deleteSupplier(params.id);
				return successResponse(supplier, "Proveedor eliminado exitosamente");
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
				tags: ["Suppliers"],
				summary: "Eliminar proveedor",
			},
		},
	);
