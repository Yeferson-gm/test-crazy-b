import { Elysia, t } from "elysia";
import { QueriesService } from "#modules/queries/queries.service";

export const queriesRoutes = new Elysia({ prefix: "/queries" })
	.decorate("queriesService", new QueriesService())
	.get(
		"/ruc/:ruc",
		async ({ params: { ruc }, queriesService }) => {
			return await queriesService.consultarRUC(ruc);
		},
		{
			params: t.Object({
				ruc: t.String({ minLength: 11, maxLength: 11 }),
			}),
		},
	)
	.get(
		"/dni/:dni",
		async ({ params: { dni }, queriesService }) => {
			return await queriesService.consultarDNI(dni);
		},
		{
			params: t.Object({
				dni: t.String({ minLength: 8, maxLength: 8 }),
			}),
		},
	);
