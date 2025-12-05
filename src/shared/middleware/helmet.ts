import { Elysia } from "elysia";

export const helmetMiddleware = new Elysia({ name: "helmet" }).onRequest(
	({ set }) => {
		set.headers["X-Content-Type-Options"] = "nosniff";
		set.headers["X-Frame-Options"] = "DENY";
		set.headers["X-XSS-Protection"] = "1; mode=block";
		set.headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
		set.headers["Content-Security-Policy"] = [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline'",
			"img-src 'self' data: https:",
			"font-src 'self' data:",
			"connect-src 'self'",
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'",
		].join("; ");

		if (process.env.NODE_ENV === "production") {
			set.headers["Strict-Transport-Security"] =
				"max-age=31536000; includeSubDomains; preload";
		}

		set.headers["Permissions-Policy"] = [
			"camera=()",
			"microphone=()",
			"geolocation=()",
			"interest-cohort=()",
		].join(", ");

		set.headers["X-Download-Options"] = "noopen";
		set.headers["X-Permitted-Cross-Domain-Policies"] = "none";
	},
);
