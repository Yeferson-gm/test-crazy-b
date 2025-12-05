import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";

import { corsMiddleware } from "#shared/middleware/cors";
import { helmetMiddleware } from "#shared/middleware/helmet";
import { apiRateLimitMiddleware } from "#shared/middleware/rate-limiting";
import { errorMiddleware } from "#shared/middleware/error";
import { betterAuthMiddleware } from "#shared/middleware/auth";

import { authRoutes } from "#modules/auth/auth.routes";
import { usersRoutes } from "#modules/users/users.routes";
import { storesRoutes } from "#modules/stores/stores.routes";
import { productsRoutes } from "#modules/products/products.routes";
import { qrScanProductsRoutes } from "#modules/products/qrscan.products.routes";
import { salesRoutes } from "#modules/sales/sales.routes";
import { invoicingRoutes } from "#modules/invoicing/invoicing.routes";
import { mediaRoutes } from "#modules/media/media.routes";
import { paymentsRoutes } from "#modules/payments/payments.routes";
import { reportsRoutes } from "#modules/reports/reports.routes";
import { categoriesRoutes } from "#modules/categories/categories.routes";
import { suppliersRoutes } from "#modules/suppliers/suppliers.routes";
import { employeesRoutes } from "#modules/employees/employees.routes";
import { notificationsRoutes } from "#modules/notifications/notifications.routes";
import { queriesRoutes } from "#modules/queries/queries.routes";

export const app = new Elysia()
	.use(corsMiddleware)
	.use(helmetMiddleware)
	.use(apiRateLimitMiddleware)
	.use(betterAuthMiddleware)
	.use(errorMiddleware)

	.use(
		swagger({
			documentation: {
				info: {
					title: "Crazy Shop POS API",
					version: "1.0.0",
					description:
						"API REST para sistema POS multi-tienda con facturación electrónica SUNAT",
				},
				tags: [
					{ name: "Auth", description: "Autenticación y autorización" },
					{ name: "Users", description: "Gestión de usuarios" },
					{ name: "Stores", description: "Gestión de tiendas" },
					{ name: "Categories", description: "Categorías de productos" },
					{ name: "Products", description: "Gestión de productos" },
					{ name: "Sales", description: "Registro y gestión de ventas" },
					{ name: "Invoicing", description: "Facturación electrónica SUNAT" },
					{ name: "Media", description: "Gestión de archivos multimedia" },
					{ name: "Payments", description: "Pagos y cajas registradoras" },
					{ name: "Reports", description: "Reportes y estadísticas" },
					{ name: "Employees", description: "Gestión de empleados" },
					{ name: "Notifications", description: "Notificaciones del sistema" },
				],
				components: {
					securitySchemes: {
						cookieAuth: {
							type: "apiKey",
							in: "cookie",
							name: "auth",
						},
					},
				},
				security: [{ cookieAuth: [] }],
			},
		}),
	)

	.get("/", () => ({
		message: "Crazy Shop POS API",
		version: "1.0.0",
		status: "running",
		timestamp: new Date().toISOString(),
	}))

	.get("/health", () => ({
		status: "healthy",
		timestamp: new Date().toISOString(),
	}))

	.group("/api", (app) =>
		app
			.use(authRoutes)
			.use(usersRoutes)
			.use(storesRoutes)
			.use(categoriesRoutes)
			.use(productsRoutes)
			.use(qrScanProductsRoutes)
			.use(salesRoutes)
			.use(invoicingRoutes)
			.use(mediaRoutes)
			.use(paymentsRoutes)
			.use(reportsRoutes)
			.use(suppliersRoutes)
			.use(employeesRoutes)
			.use(notificationsRoutes)
			.use(queriesRoutes),
	);
