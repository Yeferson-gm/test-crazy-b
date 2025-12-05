import { suppliersService } from "./suppliers.service";

export class SuppliersController {
	async createSupplier(data: {
		name: string;
		ruc?: string;
		email?: string;
		phone?: string;
		address?: string;
		contactName?: string;
		website?: string;
		notes?: string;
	}) {
		return await suppliersService.createSupplier(data);
	}

	async getAllSuppliers(includeInactive: boolean = false) {
		return await suppliersService.getAllSuppliers(includeInactive);
	}

	async getSupplierById(id: string) {
		return await suppliersService.getSupplierById(id);
	}

	async searchSuppliers(searchTerm: string) {
		return await suppliersService.searchSuppliers(searchTerm);
	}

	async updateSupplier(
		id: string,
		data: {
			name?: string;
			ruc?: string;
			email?: string;
			phone?: string;
			address?: string;
			contactName?: string;
			website?: string;
			notes?: string;
			isActive?: boolean;
		},
	) {
		return await suppliersService.updateSupplier(id, data);
	}

	async deleteSupplier(id: string) {
		return await suppliersService.deleteSupplier(id);
	}
}

export const suppliersController = new SuppliersController();
