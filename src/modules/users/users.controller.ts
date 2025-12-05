import { usersService } from "./users.service";

export class UsersController {
	/**
	 * Actualiza el perfil del usuario
	 */
	async updateProfile(
		userId: string,
		data: { email?: string; phone?: string; profileImageId?: string },
	) {
		return await usersService.updateProfile(userId, data);
	}

	/**
	 * Crea un nuevo usuario
	 */
	async createUser(data: {
		email: string;
		password: string;
		name: string;
		phone?: string;
		role: "admin" | "manager" | "cashier" | "seller";
		storeId?: string;
	}) {
		return await usersService.createUser(data);
	}

	/**
	 * Obtiene todos los usuarios
	 */
	async getAllUsers(includeInactive: boolean = false) {
		return await usersService.getAllUsers(includeInactive);
	}

	/**
	 * Obtiene un usuario por ID
	 */
	async getUserById(id: string) {
		return await usersService.getUserById(id);
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
		return await usersService.updateUser(id, data);
	}

	/**
	 * Elimina un usuario
	 */
	async deleteUser(id: string) {
		return await usersService.deleteUser(id);
	}
}

export const usersController = new UsersController();
