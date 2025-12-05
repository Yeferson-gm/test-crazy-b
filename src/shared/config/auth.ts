import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "#database/prisma";
import { config } from "#shared/config/env";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	secret: config.auth.secret,
	baseURL: config.cors.allowedOrigins[0],
	trustedOrigins: config.cors.allowedOrigins,
	emailAndPassword: {
		enabled: true,
	},
	session: {
		expiresIn: 60 * 60 * 24,
		updateAge: 60 * 60 * 12,
	},
	user: {
		additionalFields: {
			storeId: {
				type: "string",
				required: false,
			},
			firstName: {
				type: "string",
				required: false,
			},
			lastName: {
				type: "string",
				required: false,
			},
			dni: {
				type: "string",
				required: false,
			},
			phone: {
				type: "string",
				required: false,
			},
			role: {
				type: "string",
				required: false,
				defaultValue: "admin",
			},
			isActive: {
				type: "boolean",
				required: false,
				defaultValue: true,
			},
			image: {
				type: "string",
				required: false,
			},
			profileImageId: {
				type: "string",
				required: false,
			},
		},
	},
});
