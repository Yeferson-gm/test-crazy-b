import prisma from "#database/prisma";
import { hashPassword, comparePassword } from "#shared/utils/password";
import { emailService } from "#shared/services/email.service";

export class AuthService {
	/**
	 * Registra un nuevo usuario
	 */
	async register(data: {
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		dni: string;
		phone?: string;
		role: "admin" | "manager" | "cashier" | "seller";
		storeId: string;
	}) {
		const existingUser = await prisma.user.findUnique({
			where: { email: data.email },
		});

		if (existingUser) {
			throw new Error("El email ya está registrado");
		}

		const hashedPassword = await hashPassword(data.password);

		const store = await prisma.store.findUnique({
			where: { id: data.storeId },
			select: { name: true },
		});

		const newUser = await prisma.user.create({
			data: {
				...data,
				password: hashedPassword,
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
				isActive: true,
				emailVerified: true,
				image: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		await emailService.sendWelcomeEmployee({
			to: newUser.email,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
			email: newUser.email,
			password: data.password,
			role: newUser.role,
			storeName: store?.name,
		});

		return newUser;
	}

	/**
	 * Obtiene usuario por ID
	 */
	async getUserById(userId: string) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				dni: true,
				phone: true,
				role: true,
				storeId: true,
				isActive: true,
				emailVerified: true,
				image: true,
				createdAt: true,
				updatedAt: true,
				store: {
					select: {
						id: true,
						name: true,
						code: true,
						address: true,
						phone: true,
						email: true,
						ruc: true,
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
	 * Obtiene todos los usuarios con filtros
	 */
	async getAllUsers(options: { page?: number; limit?: number; role?: string }) {
		const page = options.page || 1;
		const limit = options.limit || 20;
		const skip = (page - 1) * limit;

		const where: any = {};
		if (options.role) {
			where.role = options.role;
		}

		const [users, total] = await Promise.all([
			prisma.user.findMany({
				where,
				select: {
					id: true,
					email: true,
					firstName: true,
					lastName: true,
					dni: true,
					phone: true,
					role: true,
					storeId: true,
					isActive: true,
					emailVerified: true,
					image: true,
					createdAt: true,
					updatedAt: true,
					store: {
						select: {
							id: true,
							name: true,
							code: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.user.count({ where }),
		]);

		return {
			users,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit),
			},
		};
	}

	/**
	 * Actualiza un usuario
	 */
	async updateUser(
		id: string,
		data: {
			firstName?: string;
			lastName?: string;
			dni?: string;
			phone?: string;
			role?: "admin" | "manager" | "cashier" | "seller";
			isActive?: boolean;
		},
	) {
		const user = await prisma.user.update({
			where: { id },
			data,
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				dni: true,
				phone: true,
				role: true,
				storeId: true,
				isActive: true,
				emailVerified: true,
				image: true,
				createdAt: true,
				updatedAt: true,
			},
		});

		return user;
	}

	/**
	 * Desactiva un usuario
	 */
	async deactivateUser(id: string) {
		const user = await prisma.user.update({
			where: { id },
			data: { isActive: false },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				isActive: true,
			},
		});

		return user;
	}

	/**
	 * Actualiza contraseña
	 */
	async updatePassword(
		userId: string,
		currentPassword: string,
		newPassword: string,
	) {
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			throw new Error("Usuario no encontrado");
		}

		const isPasswordValid = await comparePassword(
			currentPassword,
			user.password!,
		);

		if (!isPasswordValid) {
			throw new Error("Contraseña actual incorrecta");
		}

		const hashedPassword = await hashPassword(newPassword);

		await prisma.user.update({
			where: { id: userId },
			data: {
				password: hashedPassword,
			},
		});

		return { message: "Contraseña actualizada exitosamente" };
	}
}

export const authService = new AuthService();
