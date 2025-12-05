import { storesService } from "./stores.service";

export class StoresController {
	/**
	 * Crea una nueva tienda
	 */
	async createStore(data: {
		name: string;
		address: string;
		phone?: string;
		email?: string;
		ruc?: string;
	}) {
		return await storesService.createStore(data);
	}

	/**
	 * Obtiene todas las tiendas
	 */
	async getAllStores(includeInactive: boolean = false) {
		return await storesService.getAllStores(includeInactive);
	}

	/**
	 * Obtiene una tienda por ID
	 */
	async getStoreById(id: string) {
		return await storesService.getStoreById(id);
	}

	/**
	 * Obtiene una tienda por código
	 */
	async getStoreByCode(code: string) {
		return await storesService.getStoreByCode(code);
	}

	/**
	 * Actualiza una tienda
	 */
	async updateStore(
		id: string,
		data: {
			name?: string;
			address?: string;
			phone?: string;
			email?: string;
			ruc?: string;
			isActive?: boolean;
		},
	) {
		return await storesService.updateStore(id, data);
	}

	/**
	 * Activa/Desactiva una tienda
	 */
	async toggleStoreStatus(id: string) {
		return await storesService.toggleStoreStatus(id);
	}

	/**
	 * Elimina una tienda permanentemente
	 */
	async deleteStore(id: string) {
		return await storesService.deleteStore(id);
	}

	/**
	 * Busca tiendas por nombre
	 */
	async searchStores(searchTerm: string) {
		return await storesService.searchStores(searchTerm);
	}
}

export const storesController = new StoresController();
