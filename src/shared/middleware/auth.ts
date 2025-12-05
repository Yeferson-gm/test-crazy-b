import { Elysia } from "elysia";
import { auth } from "#shared/config/auth";
import type { UserRole } from "#shared/types/index";

/**
 * 1. Middleware de Better Auth con macro
 * Proporciona session y user en las rutas que lo requieran
 *
 * 2. Middleware para verificar autenticación
 * Uso: .use(authMiddleware)
 *
 * 3. Middleware para verificar roles específicos
 * Uso: .use(requireAuth({ roles: ['admin', 'manager'] }))
 *
 * 4. Middleware para verificar acceso a tienda específica
 * Uso: .use(requireStoreAccess())
 */

export const betterAuthMiddleware = new Elysia({ name: "better-auth" }).mount(
	auth.handler,
);

export const authMiddleware = new Elysia({ name: "auth-check" }).derive(
	async ({ request: { headers }, set }) => {
		const session = await auth.api.getSession({
			headers,
		});

		if (!session) {
			set.status = 401;
			throw new Error("No autorizado - Sesión no válida");
		}

		return {
			user: session.user,
			session: session.session,
		};
	},
);

export const requireAuth = (options?: { roles?: UserRole[] }) => {
	return new Elysia({ name: "require-auth" }).derive(
		{ as: "global" },
			async ({ request: { headers }, set }) => {
			console.log("[AUTH MIDDLEWARE] Cookie header:", headers.get("cookie"));

			const session = await auth.api.getSession({
				headers,
			});

			if (!session) {
				console.error("[AUTH MIDDLEWARE] No hay sesión válida");
				set.status = 401;
				throw new Error("No autorizado - Sesión no válida");
			}

			if (options?.roles && options.roles.length > 0) {
				const userRole = session.user.role as UserRole;
				if (!options.roles.includes(userRole)) {
					set.status = 403;
					throw new Error("No tienes permisos para realizar esta acción");
				}
			}

			return {
				user: session.user,
				session: session.session,
			};
		},
	);
};

export const requireStoreAccess = (storeIdParam: string = "storeId") => {
	return new Elysia({ name: "require-store-access" }).derive(
		async ({ request: { headers }, params, set }) => {
			const session = await auth.api.getSession({
				headers,
			});

			if (!session) {
				set.status = 401;
				throw new Error("No autorizado - Sesión no válida");
			}

			const requestedStoreId = (params as any)[storeIdParam];
			const userRole = session.user.role as UserRole;

			if (userRole === "admin") {
				return {
					user: session.user,
					session: session.session,
				};
			}

			if (session.user.storeId !== requestedStoreId) {
				set.status = 403;
				throw new Error("No tienes acceso a esta tienda");
			}

			return {
				user: session.user,
				session: session.session,
			};
		},
	);
};
