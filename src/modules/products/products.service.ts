import prisma from "#database/prisma";
import { generateSKU } from "#shared/utils/generators";

export class ProductsService {
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
		// Generar SKU automático
		const sku = generateSKU();

		// Verificar si el código de barras ya existe
		if (data.barcode) {
			const existingProduct = await prisma.product.findFirst({
				where: { barcode: data.barcode },
			});

			if (existingProduct) {
				throw new Error("El código de barras ya existe");
			}
		}

		const newProduct = await prisma.product.create({
			data: {
				...data,
				sku,
			},
		});

		return newProduct;
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
		const page = options.page || 1;
		const limit = options.limit || 20;
		const skip = (page - 1) * limit;

		// Construir condiciones de filtrado
		const where: any = options.includeInactive ? {} : { isActive: true };

		// Filtrar por búsqueda (nombre, SKU, código de barras)
		if (options.search) {
			where.OR = [
				{ name: { contains: options.search, mode: "insensitive" } },
				{ sku: { contains: options.search, mode: "insensitive" } },
				{ barcode: { contains: options.search, mode: "insensitive" } },
			];
		}

		// Filtrar por categoría
		if (options.categoryId) {
			where.categoryId = options.categoryId;
		}

		const [productsList, totalCount] = await Promise.all([
			prisma.product.findMany({
				where,
				include: {
					category: true,
					productImage: true,
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.product.count({ where }),
		]);

		return {
			products: productsList,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
		};
	}

	/**
	 * Obtiene un producto por ID
	 */
	async getProductById(id: string) {
		const product = await prisma.product.findUnique({
			where: { id },
			include: {
				category: true,
				productImage: true,
			},
		});

		if (!product) {
			throw new Error("Producto no encontrado");
		}

		return product;
	}

	/**
	 * Obtiene un producto por código de barras/QR
	 */
	async getProductByBarcode(barcode: string) {
		const product = await prisma.product.findFirst({
			where: { barcode },
			include: {
				category: true,
			},
		});

		if (!product) {
			throw new Error("Producto no encontrado");
		}

		return product;
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
		// Si se actualiza el código de barras, verificar que no exista
		if (data.barcode) {
			const existingProduct = await prisma.product.findFirst({
				where: {
					barcode: data.barcode,
					NOT: { id },
				},
			});

			if (existingProduct) {
				throw new Error("El código de barras ya existe en otro producto");
			}
		}

		const updatedProduct = await prisma.product.update({
			where: { id },
			data,
		});

		return updatedProduct;
	}

	/**
	 * Elimina (desactiva) un producto
	 */
	async deleteProduct(id: string) {
		const deletedProduct = await prisma.product.update({
			where: { id },
			data: {
				isActive: false,
			},
		});

		return deletedProduct;
	}

	/**
	 * Obtiene productos con stock bajo en una tienda
	 */
	async getLowStockProducts(storeId: string) {
		const lowStockProducts = await prisma.inventory.findMany({
			where: {
				storeId,
				product: {
					isActive: true,
				},
			},
			include: {
				product: true,
			},
		});

		// Filtrar productos donde quantity <= minStock
		return lowStockProducts.filter(
			(inv) => inv.quantity <= inv.product.minStock,
		);
	}
}

export const productsService = new ProductsService();
