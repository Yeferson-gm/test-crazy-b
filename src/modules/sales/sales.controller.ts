import { salesService } from "./sales.service";

export class SalesController {
	/**
	 * Crea una nueva venta
	 */
	async createSale(data: {
		storeId: string;
		userId: string;
		customerId?: string;
		customerData?: {
			documentType: string;
			documentNumber: string;
			name: string;
			email?: string;
			phone?: string;
			address?: string;
		};
		items: Array<{
			productId: string;
			quantity: number;
			unitPrice: string;
			discount?: string;
		}>;
		paymentMethod: "cash" | "card" | "yape" | "plin" | "transfer";
		paymentReference?: string;
		discount?: string;
		notes?: string;
	}) {
		return await salesService.createSale(data);
	}

	/**
	 * Obtiene ventas de una tienda
	 */
	async getStoreSales(options: {
		storeId: string;
		startDate?: Date;
		endDate?: Date;
		page?: number;
		limit?: number;
	}) {
		return await salesService.getStoreSales(options);
	}

	/**
	 * Obtiene una venta por ID
	 */
	async getSaleById(id: string) {
		return await salesService.getSaleById(id);
	}

	/**
	 * Cancela una venta
	 */
	async cancelSale(id: string, userId: string, reason: string) {
		return await salesService.cancelSale(id, userId, reason);
	}
}

export const salesController = new SalesController();
