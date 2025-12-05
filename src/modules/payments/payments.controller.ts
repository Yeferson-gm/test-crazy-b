import { paymentsService } from "./payments.service";

export class PaymentsController {
	/**
	 * Registra un pago
	 */
	async createPaymentRecord(data: {
		saleId: string;
		amount: string;
		paymentMethod: "cash" | "card" | "yape" | "plin" | "transfer";
		reference?: string;
		notes?: string;
	}) {
		return await paymentsService.createPaymentRecord(data);
	}

	/**
	 * Obtiene pagos de una venta
	 */
	async getSalePayments(saleId: string) {
		return await paymentsService.getSalePayments(saleId);
	}

	/**
	 * Abre caja
	 */
	async openCashRegister(data: {
		storeId: string;
		userId: string;
		openingAmount: string;
		notes?: string;
	}) {
		return await paymentsService.openCashRegister(data);
	}

	/**
	 * Cierra caja
	 */
	async closeCashRegister(data: {
		registerId: string;
		closingAmount: string;
		notes?: string;
	}) {
		return await paymentsService.closeCashRegister(data);
	}

	/**
	 * Obtiene caja actual
	 */
	async getCurrentCashRegister(storeId: string) {
		return await paymentsService.getCurrentCashRegister(storeId);
	}

	/**
	 * Historial de cajas
	 */
	async getCashRegisterHistory(storeId: string, limit?: number) {
		return await paymentsService.getCashRegisterHistory(storeId, limit);
	}

	/**
	 * Detalles de caja
	 */
	async getCashRegisterById(id: string) {
		return await paymentsService.getCashRegisterById(id);
	}
}

export const paymentsController = new PaymentsController();
