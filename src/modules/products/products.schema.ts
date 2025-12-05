import { t } from "elysia";

export const createProductSchema = t.Object({
	categoryId: t.Optional(t.String()),
	name: t.String({ minLength: 3 }),
	description: t.Optional(t.String()),
	barcode: t.Optional(t.String()),
	imageId: t.Optional(t.String()),
	costPrice: t.String(),
	salePrice: t.String(),
	taxRate: t.Optional(t.String()),
	minStock: t.Optional(t.Number({ minimum: 0 })),
});

export const updateProductSchema = t.Object({
	categoryId: t.Optional(t.String()),
	name: t.Optional(t.String({ minLength: 3 })),
	description: t.Optional(t.String()),
	barcode: t.Optional(t.String()),
	imageId: t.Optional(t.String()),
	costPrice: t.Optional(t.String()),
	salePrice: t.Optional(t.String()),
	taxRate: t.Optional(t.String()),
	minStock: t.Optional(t.Number({ minimum: 0 })),
	isActive: t.Optional(t.Boolean()),
});

export const productQuerySchema = t.Object({
	page: t.Optional(t.String()),
	limit: t.Optional(t.String()),
	search: t.Optional(t.String()),
	categoryId: t.Optional(t.String()),
	includeInactive: t.Optional(t.String()),
});
