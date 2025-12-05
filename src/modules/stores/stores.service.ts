import prisma from "#database/prisma";
import { generateStoreCode } from "#shared/utils/generators";

export class StoresService {
	/**
	 * Crea una nueva tienda
	 */
	async createStore(data: {
		name: string;
		address: string;
		city?: string;
		phone?: string;
		email?: string;
		ruc?: string;
		manager?: string;
	}) {
		// Generar código único de tienda
		const storeCount = await prisma.store.count();
		const code = generateStoreCode(storeCount + 1);

		const newStore = await prisma.store.create({
			data: {
				...data,
				code,
			},
		});

		return newStore;
	}

	/**
	 * Obtiene todas las tiendas
	 */
	async getAllStores(includeInactive: boolean = false) {
		return await prisma.store.findMany({
			where: includeInactive ? undefined : { isActive: true },
			orderBy: { createdAt: "asc" },
		});
	}

	/**
	 * Obtiene una tienda por ID
	 */
	async getStoreById(id: string) {
		const store = await prisma.store.findUnique({
			where: { id },
		});

		if (!store) {
			throw new Error("Tienda no encontrada");
		}

		return store;
	}

	/**
	 * Obtiene una tienda por código
	 */
	async getStoreByCode(code: string) {
		const store = await prisma.store.findUnique({
			where: { code },
		});

		if (!store) {
			throw new Error("Tienda no encontrada");
		}

		return store;
	}

	/**
	 * Actualiza una tienda
	 */
	async updateStore(
		id: string,
		data: {
			name?: string;
			address?: string;
			city?: string;
			phone?: string;
			email?: string;
			ruc?: string;
			manager?: string;
			isActive?: boolean;
		},
	) {
		const updatedStore = await prisma.store.update({
			where: { id },
			data,
		});

		return updatedStore;
	}

	/**
	 * Activa/Desactiva una tienda
	 */
	async toggleStoreStatus(id: string) {
		const store = await this.getStoreById(id);

		const updatedStore = await prisma.store.update({
			where: { id },
			data: {
				isActive: !store.isActive,
			},
		});

		return updatedStore;
	}

	/**
	 * Elimina una tienda permanentemente
	 */
	async deleteStore(id: string) {
		const store = await this.getStoreById(id);

		await prisma.store.delete({
			where: { id },
		});

		return store;
	}

	/**
	 * Busca tiendas por nombre
	 */
	async searchStores(searchTerm: string) {
		return await prisma.store.findMany({
			where: {
				isActive: true,
				name: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
		});
	}
}

export const storesService = new StoresService();
