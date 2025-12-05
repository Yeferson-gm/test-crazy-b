import { t } from "elysia";

export const updateProfileSchema = t.Object({
	email: t.Optional(t.String({ format: "email" })),
	phone: t.Optional(t.String()),
	profileImageId: t.Optional(t.Nullable(t.String())),
});
