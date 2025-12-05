import { Elysia, t } from "elysia";
import { employeesController } from "./employees.controller";
import { requireAuth } from "#shared/middleware/auth";
import { successResponse, errorResponse } from "#shared/utils/response";

export const employeesRoutes = new Elysia({ prefix: "/employees" })
	.use(requireAuth({ roles: ["admin", "manager"] }))

	/**
	 * GET /employees
	 * Obtiene todos los empleados
	 */
	.get(
		"/",
		async ({ query, user, set }) => {
			try {
				const storeId = user.role === "admin" ? query.storeId : user.storeId;

				const employees = await employeesController.getAllEmployees({
					storeId,
					role: query.role,
					includeInactive: query.includeInactive === "true",
				});

				return successResponse(employees);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			query: t.Object({
				storeId: t.Optional(t.String()),
				role: t.Optional(t.String()),
				includeInactive: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Employees"],
				summary: "Listar empleados",
			},
		},
	)

	/**
	 * GET /employees/:id
	 * Obtiene un empleado por ID
	 */
	.get(
		"/:id",
		async ({ params, set }) => {
			try {
				const employee = await employeesController.getEmployeeById(params.id);
				return successResponse(employee);
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
				tags: ["Employees"],
				summary: "Obtener empleado",
			},
		},
	)

	/**
	 * GET /employees/:id/sales
	 * Obtiene ventas de un empleado
	 */
	.get(
		"/:id/sales",
		async ({ params, query }) => {
			try {
				const sales = await employeesController.getEmployeeSales(params.id, {
					startDate: query.startDate ? new Date(query.startDate) : undefined,
					endDate: query.endDate ? new Date(query.endDate) : undefined,
				});

				return successResponse(sales);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			query: t.Object({
				startDate: t.Optional(t.String()),
				endDate: t.Optional(t.String()),
			}),
			detail: {
				tags: ["Employees"],
				summary: "Ventas de empleado",
			},
		},
	)

	/**
	 * GET /employees/:id/stats
	 * Obtiene estadísticas de empleado
	 */
	.get(
		"/:id/stats",
		async ({ params }) => {
			try {
				const stats = await employeesController.getEmployeeStats(params.id);
				return successResponse(stats);
			} catch (error: any) {
				return errorResponse(error.message);
			}
		},
		{
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Employees"],
				summary: "Estadísticas de empleado",
			},
		},
	);
