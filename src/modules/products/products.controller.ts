import { productsService } from "#modules/products/products.service";

export class ProductsController {
	/**
	 * Crea un nuevo producto
	 */
	async createProduct(data: {
		categoryId?: string;
		name: string;
		description?: string;
		barcode?: string;
		image?: string;
		costPrice: string;
		salePrice: string;
		taxRate?: string;
		minStock?: number;
	}) {
		return await productsService.createProduct(data);
	}

	/**
	 * Obtiene todos los productos con paginación y filtros
	 */
	async getAllProducts(options: {
		page?: number;
		limit?: number;
		search?: string;
		categoryId?: string;
		includeInactive?: boolean;
	}) {
		return await productsService.getAllProducts(options);
	}

	/**
	 * Obtiene un producto por ID
	 */
	async getProductById(id: string) {
		return await productsService.getProductById(id);
	}

	/**
	 * Obtiene un producto por código de barras
	 */
	async getProductByBarcode(barcode: string) {
		return await productsService.getProductByBarcode(barcode);
	}

	/**
	 * Actualiza un producto
	 */
	async updateProduct(
		id: string,
		data: {
			categoryId?: string;
			name?: string;
			description?: string;
			barcode?: string;
			image?: string;
			costPrice?: string;
			salePrice?: string;
			taxRate?: string;
			minStock?: number;
			isActive?: boolean;
		},
	) {
		return await productsService.updateProduct(id, data);
	}

	/**
	 * Elimina (desactiva) un producto
	 */
	async deleteProduct(id: string) {
		return await productsService.deleteProduct(id);
	}

	/**
	 * Obtiene productos con stock bajo
	 */
	async getLowStockProducts(storeId: string) {
		return await productsService.getLowStockProducts(storeId);
	}
}

export const productsController = new ProductsController();
