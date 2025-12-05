import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),
	PORT: z.string(),
	DATABASE_URL: z.string(),
	JWT_SECRET: z.string(),
	JWT_EXPIRES_IN: z.string(),
	ALLOWED_ORIGINS: z.string(),
	SUNAT_API_URL: z.string(),
	SUNAT_API_KEY: z.string(),
	SUNAT_API_SECRET: z.string().optional(),
	MEDIA_API_URL: z.string(),
	MEDIA_API_KEY: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	RESEND_API_KEY: z.string(),
	RESEND_FROM_EMAIL: z.string().email(),
	CONSULTAS_API_URL: z.string(),
	CONSULTAS_API_TOKEN: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export const config = {
	port: env.PORT,
	nodeEnv: env.NODE_ENV,
	database: {
		url: env.DATABASE_URL,
	},
	jwt: {
		secret: env.JWT_SECRET,
		expiresIn: env.JWT_EXPIRES_IN,
	},
	cors: {
		allowedOrigins: env.ALLOWED_ORIGINS.split(","),
	},
	sunat: {
		apiUrl: env.SUNAT_API_URL,
		apiKey: env.SUNAT_API_KEY,
		apiSecret: env.SUNAT_API_SECRET,
	},
	media: {
		apiUrl: env.MEDIA_API_URL,
		apiKey: env.MEDIA_API_KEY,
	},
	auth: {
		secret: env.BETTER_AUTH_SECRET,
	},
	resend: {
		apiKey: env.RESEND_API_KEY,
		fromEmail: env.RESEND_FROM_EMAIL,
	},
	consultas: {
		apiUrl: env.CONSULTAS_API_URL,
		apiToken: env.CONSULTAS_API_TOKEN,
	},
};
