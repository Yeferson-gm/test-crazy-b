import { config } from "#shared/config/env";

export class QueriesService {
	private readonly baseUrl = config.consultas.apiUrl;
	private readonly token = config.consultas.apiToken;

	async consultarRUC(ruc: string) {
		try {
			const response = await fetch(`${this.baseUrl}/sunat/ruc/${ruc}`, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Error al consultar RUC: ${response.statusText}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Error en consultarRUC:", error);
			throw new Error("Error al consultar RUC");
		}
	}

	async consultarDNI(dni: string) {
		try {
			const response = await fetch(`${this.baseUrl}/reniec/dni/${dni}`, {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${this.token}`,
				},
			});

			if (!response.ok) {
				throw new Error(`Error al consultar DNI: ${response.statusText}`);
			}

			const data = await response.json();
			return data;
		} catch (error) {
			console.error("Error en consultarDNI:", error);
			throw new Error("Error al consultar DNI");
		}
	}
}
