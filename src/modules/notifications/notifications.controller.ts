import {
	notificationsService,
	type NotificationType,
	type NotificationPriority,
} from "./notifications.service";

export class NotificationsController {
	async createNotification(data: {
		userId: string;
		type: NotificationType;
		title: string;
		message: string;
		priority?: NotificationPriority;
		metadata?: Record<string, any>;
	}) {
		return await notificationsService.createNotification(data);
	}

	async getUserNotifications(
		userId: string,
		options?: {
			unreadOnly?: boolean;
			limit?: number;
		},
	) {
		return await notificationsService.getUserNotifications(userId, options);
	}

	async markAsRead(id: string, userId: string) {
		return await notificationsService.markAsRead(id, userId);
	}

	async markAllAsRead(userId: string) {
		return await notificationsService.markAllAsRead(userId);
	}

	async deleteNotification(id: string, userId: string) {
		return await notificationsService.deleteNotification(id, userId);
	}

	async getUnreadCount(userId: string) {
		return await notificationsService.getUnreadCount(userId);
	}
}

export const notificationsController = new NotificationsController();
