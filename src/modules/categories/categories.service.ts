import prisma from "#database/prisma";

export class CategoriesService {
	/**
	 * Crea una nueva categoría
	 */
	async createCategory(data: {
		name: string;
		description?: string;
		parentId?: string;
	}) {
		// Verificar si el nombre ya existe
		const existing = await prisma.category.findFirst({
			where: { name: data.name },
		});

		if (existing) {
			throw new Error("Ya existe una categoría con ese nombre");
		}

		// Si tiene padre, verificar que exista
		if (data.parentId) {
			const parent = await prisma.category.findUnique({
				where: { id: data.parentId },
			});

			if (!parent) {
				throw new Error("Categoría padre no encontrada");
			}
		}

		return await prisma.category.create({
			data,
			include: {
				parent: true,
			},
		});
	}

	/**
	 * Obtiene todas las categorías
	 */
	async getAllCategories(includeInactive: boolean = false) {
		return await prisma.category.findMany({
			where: includeInactive ? undefined : { isActive: true },
			include: {
				parent: true,
				children: true,
				_count: {
					select: { products: true },
				},
			},
			orderBy: { name: "asc" },
		});
	}

	/**
	 * Obtiene categorías raíz (sin padre)
	 */
	async getRootCategories() {
		return await prisma.category.findMany({
			where: {
				parentId: null,
				isActive: true,
			},
			include: {
				children: {
					where: { isActive: true },
				},
				_count: {
					select: { products: true },
				},
			},
			orderBy: { name: "asc" },
		});
	}

	/**
	 * Obtiene una categoría por ID
	 */
	async getCategoryById(id: string) {
		const category = await prisma.category.findUnique({
			where: { id },
			include: {
				parent: true,
				children: true,
				products: {
					where: { isActive: true },
				},
			},
		});

		if (!category) {
			throw new Error("Categoría no encontrada");
		}

		return category;
	}

	/**
	 * Actualiza una categoría
	 */
	async updateCategory(
		id: string,
		data: {
			name?: string;
			description?: string;
			parentId?: string;
			isActive?: boolean;
		},
	) {
		// Verificar que la categoría existe
		await this.getCategoryById(id);

		// Si se cambia el nombre, verificar que no exista
		if (data.name) {
			const existing = await prisma.category.findFirst({
				where: {
					name: data.name,
					NOT: { id },
				},
			});

			if (existing) {
				throw new Error("Ya existe una categoría con ese nombre");
			}
		}

		// Si se cambia el padre, verificar que exista y no cree ciclos
		if (data.parentId) {
			if (data.parentId === id) {
				throw new Error("Una categoría no puede ser su propio padre");
			}

			const parent = await prisma.category.findUnique({
				where: { id: data.parentId },
			});

			if (!parent) {
				throw new Error("Categoría padre no encontrada");
			}

			// Verificar que no sea una subcategoría
			const isChild = await this.isChildOf(data.parentId, id);
			if (isChild) {
				throw new Error("No se puede crear una jerarquía circular");
			}
		}

		return await prisma.category.update({
			where: { id },
			data,
			include: {
				parent: true,
				children: true,
			},
		});
	}

	/**
	 * Elimina permanentemente una categoría
	 */
	async deleteCategory(id: string) {
		// Verificar que la categoría existe
		await this.getCategoryById(id);

		// Eliminar la categoría permanentemente
		return await prisma.category.delete({
			where: { id },
		});
	}

	/**
	 * Obtiene árbol jerárquico de categorías
	 */
	async getCategoryTree() {
		const categories = await prisma.category.findMany({
			where: { isActive: true },
			include: {
				children: {
					where: { isActive: true },
					include: {
						children: {
							where: { isActive: true },
						},
					},
				},
				_count: {
					select: { products: true },
				},
			},
			orderBy: { name: "asc" },
		});

		// Filtrar solo raíces
		return categories.filter((cat) => !cat.parentId);
	}

	/**
	 * Verifica si una categoría es hija de otra (recursivo)
	 */
	private async isChildOf(
		categoryId: string,
		potentialParentId: string,
	): Promise<boolean> {
		const category = await prisma.category.findUnique({
			where: { id: categoryId },
		});

		if (!category || !category.parentId) {
			return false;
		}

		if (category.parentId === potentialParentId) {
			return true;
		}

		return await this.isChildOf(category.parentId, potentialParentId);
	}
}

export const categoriesService = new CategoriesService();
