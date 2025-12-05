import prisma from "#database/prisma";

export type NotificationType =
	| "low_stock"
	| "sale"
	| "payment"
	| "system"
	| "alert";
export type NotificationPriority = "low" | "medium" | "high";

export class NotificationsService {
	/**
	 * Crea una notificación
	 */
	async createNotification(data: {
		userId: string;
		type: NotificationType;
		title: string;
		message: string;
		priority?: NotificationPriority;
		metadata?: Record<string, any>;
	}) {
		return await prisma.notification.create({
			data: {
				userId: data.userId,
				type: data.type,
				title: data.title,
				message: data.message,
				priority: data.priority || "medium",
				metadata: data.metadata as any,
			},
		});
	}

	/**
	 * Obtiene notificaciones de un usuario
	 */
	async getUserNotifications(
		userId: string,
		options?: {
			unreadOnly?: boolean;
			limit?: number;
		},
	) {
		const where: any = { userId };

		if (options?.unreadOnly) {
			where.isRead = false;
		}

		return await prisma.notification.findMany({
			where,
			orderBy: { createdAt: "desc" },
			take: options?.limit || 50,
		});
	}

	/**
	 * Marca notificación como leída
	 */
	async markAsRead(id: string, userId: string) {
		const notification = await prisma.notification.findFirst({
			where: { id, userId },
		});

		if (!notification) {
			throw new Error("Notificación no encontrada");
		}

		return await prisma.notification.update({
			where: { id },
			data: { isRead: true, readAt: new Date() },
		});
	}

	/**
	 * Marca todas como leídas
	 */
	async markAllAsRead(userId: string) {
		return await prisma.notification.updateMany({
			where: { userId, isRead: false },
			data: { isRead: true, readAt: new Date() },
		});
	}

	/**
	 * Elimina una notificación
	 */
	async deleteNotification(id: string, userId: string) {
		const notification = await prisma.notification.findFirst({
			where: { id, userId },
		});

		if (!notification) {
			throw new Error("Notificación no encontrada");
		}

		return await prisma.notification.delete({
			where: { id },
		});
	}

	/**
	 * Cuenta notificaciones no leídas
	 */
	async getUnreadCount(userId: string) {
		return await prisma.notification.count({
			where: { userId, isRead: false },
		});
	}

	/**
	 * Notifica bajo stock a administradores y gerentes de tienda
	 */
	async notifyLowStock(
		storeId: string,
		productName: string,
		currentStock: number,
		minStock: number,
	) {
		// Obtener usuarios de la tienda con permisos
		const users = await prisma.user.findMany({
			where: {
				storeId,
				role: { in: ["admin", "manager"] },
				isActive: true,
			},
		});

		const notifications = users.map((user) =>
			this.createNotification({
				userId: user.id,
				type: "low_stock",
				title: "Stock bajo",
				message: `El producto "${productName}" tiene stock bajo: ${currentStock} unidades (mínimo: ${minStock})`,
				priority: "high",
				metadata: { storeId, productName, currentStock, minStock },
			}),
		);

		return await Promise.all(notifications);
	}

	/**
	 * Notifica venta importante
	 */
	async notifyLargeSale(
		storeId: string,
		saleNumber: string,
		total: number,
		threshold: number,
	) {
		const users = await prisma.user.findMany({
			where: {
				storeId,
				role: { in: ["admin", "manager"] },
				isActive: true,
			},
		});

		const notifications = users.map((user) =>
			this.createNotification({
				userId: user.id,
				type: "sale",
				title: "Venta importante",
				message: `Se registró una venta grande: ${saleNumber} por S/ ${total}`,
				priority: "medium",
				metadata: { storeId, saleNumber, total, threshold },
			}),
		);

		return await Promise.all(notifications);
	}
}

export const notificationsService = new NotificationsService();
