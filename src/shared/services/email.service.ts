import { Resend } from "resend";
import { config } from "#shared/config/env";
import { welcomeEmployeeTemplate } from "#shared/templates/welcome-employee";

class EmailService {
	private resend: Resend;
	private fromEmail: string;

	constructor() {
		this.resend = new Resend(config.resend.apiKey);
		this.fromEmail = config.resend.fromEmail;
	}

	/**
	 * Envía email de bienvenida a nuevo empleado
	 */
	async sendWelcomeEmployee(data: {
		to: string;
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		role: string;
		storeName?: string;
	}) {
		try {
			const { data: result, error } = await this.resend.emails.send({
				from: this.fromEmail,
				to: [data.to],
				subject: "Bienvenido a Crazy Shop - Credenciales de acceso",
				html: welcomeEmployeeTemplate({
					firstName: data.firstName,
					lastName: data.lastName,
					email: data.email,
					password: data.password,
					role: data.role,
					storeName: data.storeName,
				}),
			});

			if (error) {
				console.error("Error enviando email:", error);
				return { success: false, error };
			}

			return { success: true, data: result };
		} catch (error) {
			console.error("Error enviando email:", error);
			return { success: false, error };
		}
	}

	/**
	 * Envía email genérico
	 */
	async sendEmail(data: {
		to: string | string[];
		subject: string;
		html: string;
	}) {
		try {
			const { data: result, error } = await this.resend.emails.send({
				from: this.fromEmail,
				to: Array.isArray(data.to) ? data.to : [data.to],
				subject: data.subject,
				html: data.html,
			});

			if (error) {
				console.error("Error enviando email:", error);
				return { success: false, error };
			}

			return { success: true, data: result };
		} catch (error) {
			console.error("Error enviando email:", error);
			return { success: false, error };
		}
	}
}

export const emailService = new EmailService();
