import { authService } from "#modules/auth/auth.service";

export class AuthController {
	/**
	 * 1. Registra un nuevo usuario
	 * 2. Obtiene el perfil del usuario autenticado
	 * 3. Obtiene todos los usuarios (solo admin)
	 * 4. Actualiza un usuario
	 * 5. Desactiva un usuario
	 * 6. Actualiza la contraseña del usuario
	 */

	async register(data: any) {
		const user = await authService.register(data);
		return user;
	}

	async getProfile(userId: string) {
		const user = await authService.getUserById(userId);
		return user;
	}

	async getAllUsers(options: { page?: number; limit?: number; role?: string }) {
		const result = await authService.getAllUsers(options);
		return result;
	}

	async updateUser(id: string, data: any) {
		const user = await authService.updateUser(id, data);
		return user;
	}

	async deactivateUser(id: string) {
		const user = await authService.deactivateUser(id);
		return user;
	}

	async updatePassword(
		userId: string,
		currentPassword: string,
		newPassword: string,
	) {
		await authService.updatePassword(userId, currentPassword, newPassword);
		return {
			message: "Contraseña actualizada exitosamente",
		};
	}
}

export const authController = new AuthController();
