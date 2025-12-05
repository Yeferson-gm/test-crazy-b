import { invoicingService } from "./invoicing.service";

export class InvoicingController {
	/**
	 * Genera un comprobante electrónico
	 */
	async createInvoice(data: {
		saleId: string;
		invoiceType: "boleta" | "factura" | "nota_credito" | "nota_debito";
		serie: string;
	}) {
		return await invoicingService.createInvoice(data);
	}

	/**
	 * Obtiene un comprobante por ID
	 */
	async getInvoiceById(id: string) {
		return await invoicingService.getInvoiceById(id);
	}

	/**
	 * Obtiene comprobantes de una tienda
	 */
	async getStoreInvoices(
		storeId: string,
		options?: {
			startDate?: Date;
			endDate?: Date;
			status?: string;
			page?: number;
			limit?: number;
		},
	) {
		return await invoicingService.getStoreInvoices(storeId, options);
	}

	/**
	 * Anula un comprobante
	 */
	async cancelInvoice(id: string, reason: string) {
		return await invoicingService.cancelInvoice(id, reason);
	}
}

export const invoicingController = new InvoicingController();
