import { Elysia } from "elysia";
import type { RateLimitStore } from "#shared/interface/rate-limiting";

const store: RateLimitStore = {};

setInterval(
	() => {
		const now = Date.now();
		Object.keys(store).forEach((key) => {
			if (store[key] && store[key].resetTime < now) {
				delete store[key];
			}
		});
	},
	5 * 60 * 1000,
);

export const rateLimitMiddleware = (options?: {
	max?: number;
	windowMs?: number;
	message?: string;
}) => {
	const max = options?.max || 100;
	const windowMs = options?.windowMs || 15 * 60 * 1000;
	const message =
		options?.message || "Demasiadas solicitudes, por favor intenta más tarde";

	return new Elysia({ name: "rate-limit" }).onRequest(({ request, set }) => {
		const forwarded = request.headers.get("x-forwarded-for");
		const ip = forwarded
			? forwarded.split(",")[0]?.trim() || "unknown"
			: request.headers.get("x-real-ip") || "unknown";

		const now = Date.now();
		const key = `rate_limit:${ip}`;

		if (!store[key] || store[key].resetTime < now) {
			store[key] = {
				count: 1,
				resetTime: now + windowMs,
			};
		} else {
			store[key].count++;
		}

		const remaining = Math.max(0, max - store[key].count);
		const resetTime = Math.ceil((store[key].resetTime - now) / 1000);

		set.headers["X-RateLimit-Limit"] = max.toString();
		set.headers["X-RateLimit-Remaining"] = remaining.toString();
		set.headers["X-RateLimit-Reset"] = resetTime.toString();

		if (store[key].count > max) {
			set.status = 429;
			set.headers["Retry-After"] = resetTime.toString();
			throw new Error(message);
		}
	});
};

export const authRateLimitMiddleware = rateLimitMiddleware({
	max: 5,
	windowMs: 15 * 60 * 1000,
	message: "Demasiados intentos de autenticación, por favor intenta más tarde",
});

export const apiRateLimitMiddleware = rateLimitMiddleware({
	max: 100,
	windowMs: 15 * 60 * 1000,
	message: "Límite de solicitudes excedido, por favor intenta más tarde",
});
