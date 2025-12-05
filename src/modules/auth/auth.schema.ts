import { t } from "elysia";

export const loginSchema = t.Object({
	email: t.String({ format: "email" }),
	password: t.String({ minLength: 6 }),
});

export const registerSchema = t.Object({
	email: t.String({ format: "email" }),
	password: t.String({ minLength: 6 }),
	firstName: t.String({ minLength: 2 }),
	lastName: t.String({ minLength: 2 }),
	dni: t.String({ minLength: 8, maxLength: 8 }),
	phone: t.Optional(t.String()),
	role: t.Union([
		t.Literal("admin"),
		t.Literal("manager"),
		t.Literal("cashier"),
		t.Literal("seller"),
	]),
	storeId: t.String(),
});

export const updatePasswordSchema = t.Object({
	currentPassword: t.String({ minLength: 6 }),
	newPassword: t.String({ minLength: 6 }),
});
