import { categoriesService } from "./categories.service";

export class CategoriesController {
	async createCategory(data: {
		name: string;
		description?: string;
		parentId?: string;
	}) {
		return await categoriesService.createCategory(data);
	}

	async getAllCategories(includeInactive: boolean = false) {
		return await categoriesService.getAllCategories(includeInactive);
	}

	async getRootCategories() {
		return await categoriesService.getRootCategories();
	}

	async getCategoryById(id: string) {
		return await categoriesService.getCategoryById(id);
	}

	async updateCategory(
		id: string,
		data: {
			name?: string;
			description?: string;
			parentId?: string;
			isActive?: boolean;
		},
	) {
		return await categoriesService.updateCategory(id, data);
	}

	async deleteCategory(id: string) {
		return await categoriesService.deleteCategory(id);
	}

	async getCategoryTree() {
		return await categoriesService.getCategoryTree();
	}
}

export const categoriesController = new CategoriesController();
