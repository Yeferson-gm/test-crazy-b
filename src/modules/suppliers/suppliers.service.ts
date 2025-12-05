import prisma from "#database/prisma";

export class SuppliersService {
	/**
	 * Crea un nuevo proveedor
	 */
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
		// Verificar si el RUC ya existe
		if (data.ruc) {
			const existing = await prisma.supplier.findUnique({
				where: { ruc: data.ruc },
			});

			if (existing) {
				throw new Error("Ya existe un proveedor con ese RUC");
			}
		}

		return await prisma.supplier.create({
			data,
		});
	}

	/**
	 * Obtiene todos los proveedores
	 */
	async getAllSuppliers(includeInactive: boolean = false) {
		return await prisma.supplier.findMany({
			where: includeInactive ? undefined : { isActive: true },
			orderBy: { name: "asc" },
		});
	}

	/**
	 * Obtiene un proveedor por ID
	 */
	async getSupplierById(id: string) {
		const supplier = await prisma.supplier.findUnique({
			where: { id },
		});

		if (!supplier) {
			throw new Error("Proveedor no encontrado");
		}

		return supplier;
	}

	/**
	 * Busca proveedores
	 */
	async searchSuppliers(searchTerm: string) {
		return await prisma.supplier.findMany({
			where: {
				isActive: true,
				OR: [
					{ name: { contains: searchTerm, mode: "insensitive" } },
					{ ruc: { contains: searchTerm, mode: "insensitive" } },
					{ email: { contains: searchTerm, mode: "insensitive" } },
				],
			},
			orderBy: { name: "asc" },
		});
	}

	/**
	 * Actualiza un proveedor
	 */
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
		// Verificar que existe
		await this.getSupplierById(id);

		// Si se actualiza el RUC, verificar que no exista
		if (data.ruc) {
			const existing = await prisma.supplier.findFirst({
				where: {
					ruc: data.ruc,
					NOT: { id },
				},
			});

			if (existing) {
				throw new Error("Ya existe un proveedor con ese RUC");
			}
		}

		return await prisma.supplier.update({
			where: { id },
			data,
		});
	}

	/**
	 * Elimina permanentemente un proveedor
	 */
	async deleteSupplier(id: string) {
		// Verificar que el proveedor existe
		await this.getSupplierById(id);

		// Eliminar el proveedor permanentemente
		return await prisma.supplier.delete({
			where: { id },
		});
	}
}

export const suppliersService = new SuppliersService();
