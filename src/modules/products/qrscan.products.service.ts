import prisma from "#database/prisma";

interface ScannerSession {
	sessionId: string;
	connected: boolean;
	wasNotified: boolean;
	scannedBarcode: string | null;
	createdAt: Date;
}

// Store sessions in memory (podría ser Redis en producción)
const sessions = new Map<string, ScannerSession>();

export class QRScanProductsService {
	/**
	 * Crear sesión temporal para dispositivo
	 */
	createSession(sessionId: string) {
		const session: ScannerSession = {
			sessionId,
			connected: false,
			wasNotified: false,
			scannedBarcode: null,
			createdAt: new Date(),
		};

		sessions.set(sessionId, session);

		// Auto-limpiar sesión después de 1 hora
		setTimeout(
			() => {
				sessions.delete(sessionId);
			},
			60 * 60 * 1000,
		);

		return session;
	}

	/**
	 * Marcar dispositivo como conectado
	 */
	connectDevice(sessionId: string) {
		const session = sessions.get(sessionId);
		if (!session) {
			throw new Error("Sesión no encontrada");
		}

		session.connected = true;
		return session;
	}

	/**
	 * Obtener estado de sesión
	 */
	getSessionStatus(sessionId: string) {
		const session = sessions.get(sessionId);
		if (!session) {
			return {
				exists: false,
				connected: false,
				wasNotified: false,
				scannedBarcode: null,
			};
		}

		return {
			exists: true,
			connected: session.connected,
			wasNotified: session.wasNotified,
			scannedBarcode: session.scannedBarcode,
		};
	}

	/**
	 * Marcar como notificado
	 */
	markAsNotified(sessionId: string) {
		const session = sessions.get(sessionId);
		if (session) {
			session.wasNotified = true;
		}
	}

	/**
	 * Escanear código y procesar
	 */
	async scanBarcode(sessionId: string, barcode: string) {
		const session = sessions.get(sessionId);
		if (!session) {
			throw new Error("Sesión no encontrada");
		}

		// Buscar producto por SKU
		const product = await prisma.product.findFirst({
			where: { sku: barcode },
			include: {
				productImage: true,
				category: true,
			},
		});

		session.scannedBarcode = barcode;

		return {
			exists: !!product,
			product: product || null,
			barcode,
		};
	}

	/**
	 * Incrementar stock de producto existente
	 */
	async incrementStock(productId: string, quantity: number = 1) {
		return await prisma.product.update({
			where: { id: productId },
			data: {
				stock: {
					increment: quantity,
				},
			},
			include: {
				productImage: true,
				category: true,
			},
		});
	}

	/**
	 * Limpiar código escaneado
	 */
	clearScannedBarcode(sessionId: string) {
		const session = sessions.get(sessionId);
		if (session) {
			session.scannedBarcode = null;
		}
	}

	/**
	 * Eliminar sesión
	 */
	deleteSession(sessionId: string) {
		sessions.delete(sessionId);
	}

	/**
	 * Limpiar sesiones antiguas (más de 1 hora)
	 */
	cleanOldSessions() {
		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		for (const [sessionId, session] of sessions.entries()) {
			if (session.createdAt < oneHourAgo) {
				sessions.delete(sessionId);
			}
		}
	}
}

export const qrScanProductsService = new QRScanProductsService();
