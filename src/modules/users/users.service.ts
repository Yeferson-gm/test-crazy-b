import prisma from "#database/prisma";
import { auth } from "#shared/config/auth";

export class UsersService {
	/**
	 * Actualiza el perfil del usuario
	 */
	async updateProfile(
		userId: string,
		data: { email?: string; phone?: string; profileImageId?: string },
	) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: {
				email: data.email,
				phone: data.phone,
				profileImageId: data.profileImageId,
			},
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				dni: true,
				phone: true,
				role: true,
				storeId: true,
				image: true,
				profileImageId: true,
			},
		});

		return updatedUser;
	}

	/**
	 * Crea un nuevo usuario/trabajador usando Better Auth
	 */
	async createUser(data: {
		email: string;
		password: string;
		name: string;
		phone?: string;
		role: "admin" | "manager" | "cashier" | "seller";
		storeId?: string;
	}) {
		// Verificar si el email ya existe
		const existing = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existing) {
			throw new Error("Ya existe un usuario con ese email");
		}

		// Dividir el nombre en firstName y lastName si es posible
		const nameParts = data.name.trim().split(" ");
		const firstName = nameParts[0] || data.name;
		const lastName = nameParts.slice(1).join(" ") || "";

		// Usar Better Auth API para crear el usuario con password hasheado (scrypt)
		const userResponse = await auth.api.signUpEmail({
			body: {
				email: data.email,
				password: data.password,
				name: data.name,
				firstName: firstName,
				lastName: lastName,
				phone: data.phone,
				role: data.role,
				storeId: data.storeId,
				isActive: true,
			},
		});

		if (!userResponse?.user) {
			throw new Error("Error al crear usuario");
		}

		// Retornar el usuario creado con la tienda incluida
		return await prisma.user.findUnique({
			where: { id: userResponse.user.id },
			include: {
				store: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	/**
	 * Obtiene todos los usuarios
	 */
	async getAllUsers(includeInactive: boolean = false) {
		return await prisma.user.findMany({
			where: includeInactive ? undefined : { isActive: true },
			include: {
				store: {
					select: {
						id: true,
						name: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Obtiene un usuario por ID
	 */
	async getUserById(id: string) {
		const user = await prisma.user.findUnique({
			where: { id },
			include: {
				store: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});

		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		return user;
	}

	/**
	 * Actualiza un usuario
	 */
	async updateUser(
		id: string,
		data: {
			email?: string;
			name?: string;
			phone?: string;
			role?: "admin" | "manager" | "cashier" | "seller";
			storeId?: string;
			isActive?: boolean;
		},
	) {
		// Verificar que existe
		await this.getUserById(id);

		// Si se actualiza el email, verificar que no exista
		if (data.email) {
			const existing = await prisma.user.findFirst({
				where: {
					email: data.email,
					NOT: { id },
				},
			});

			if (existing) {
				throw new Error("Ya existe un usuario con ese email");
			}
		}

		return await prisma.user.update({
			where: { id },
			data,
			include: {
				store: {
					select: {
						id: true,
						name: true,
					},
				},
			},
		});
	}

	/**
	 * Elimina permanentemente un usuario
	 */
	async deleteUser(id: string) {
		// Verificar que el usuario existe
		await this.getUserById(id);

		// Eliminar el usuario permanentemente
		return await prisma.user.delete({
			where: { id },
		});
	}
}

export const usersService = new UsersService();
