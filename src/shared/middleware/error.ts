import { Elysia } from "elysia";
import { errorResponse } from "#shared/utils/response";

export const errorMiddleware = new Elysia({ name: "error" }).onError(
	({ code, error, set }) => {
		console.error(`[ERROR] ${code}:`, error.message);

		switch (code) {
			case "VALIDATION":
				set.status = 400;
				return errorResponse("Error de validación", error.message);

			case "NOT_FOUND":
				set.status = 404;
				return errorResponse("Recurso no encontrado", error.message);

			case "PARSE":
				set.status = 400;
				return errorResponse("Error al procesar la solicitud", error.message);

			case "INVALID_COOKIE_SIGNATURE":
				set.status = 401;
				return errorResponse("Cookie inválida", error.message);

			default:
				// Si el error ya tiene un status personalizado (ej: 401, 403), lo mantenemos
				if (set.status && set.status >= 400) {
					return errorResponse(error.message);
				}

				// Error genérico del servidor
				set.status = 500;
				return errorResponse(
					"Error interno del servidor",
					process.env.NODE_ENV === "development" ? error.message : undefined,
				);
		}
	},
);
