import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { config } from "#shared/config/env";

export const corsMiddleware = new Elysia({ name: "cors" }).use(
	cors({
		origin: config.cors.allowedOrigins,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Accept",
			"Origin",
			"Cookie",
		],
		exposeHeaders: [
			"Content-Length",
			"Content-Type",
			"X-Request-Id",
			"Set-Cookie",
		],
		maxAge: 86400,
	}),
);
