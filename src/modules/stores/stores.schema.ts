import { t } from "elysia";

export const createStoreSchema = t.Object({
	name: t.String({ minLength: 3 }),
	address: t.String({ minLength: 5 }),
	city: t.Optional(t.String()),
	phone: t.Optional(t.String()),
	email: t.Optional(t.String({ format: "email" })),
	ruc: t.Optional(t.String({ minLength: 11, maxLength: 11 })),
	manager: t.Optional(t.String()),
});

export const updateStoreSchema = t.Object({
	name: t.Optional(t.String({ minLength: 3 })),
	address: t.Optional(t.String({ minLength: 5 })),
	city: t.Optional(t.String()),
	phone: t.Optional(t.String()),
	email: t.Optional(t.String({ format: "email" })),
	ruc: t.Optional(t.String({ minLength: 11, maxLength: 11 })),
	manager: t.Optional(t.String()),
	isActive: t.Optional(t.Boolean()),
});
