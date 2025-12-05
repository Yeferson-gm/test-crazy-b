import { reportsService } from "./reports.service";

export class ReportsController {
	/**
	 * Reporte de ventas por período
	 */
	async getSalesReport(options: {
		storeId?: string;
		startDate: Date;
		endDate: Date;
	}) {
		return await reportsService.getSalesReport(options);
	}

	/**
	 * Productos más vendidos
	 */
	async getTopSellingProducts(options: {
		storeId?: string;
		startDate?: Date;
		endDate?: Date;
		limit?: number;
	}) {
		return await reportsService.getTopSellingProducts(options);
	}

	/**
	 * Reporte de inventario bajo stock
	 */
	async getLowStockReport(storeId: string) {
		return await reportsService.getLowStockReport(storeId);
	}

	/**
	 * Reporte de ventas por método de pago
	 */
	async getSalesByPaymentMethod(options: {
		storeId?: string;
		startDate: Date;
		endDate: Date;
	}) {
		return await reportsService.getSalesByPaymentMethod(options);
	}

	/**
	 * Reporte de ventas diarias
	 */
	async getDailySalesReport(storeId?: string) {
		return await reportsService.getDailySalesReport(storeId);
	}

	/**
	 * Dashboard general
	 */
	async getDashboardStats(storeId?: string) {
		return await reportsService.getDashboardStats(storeId);
	}
}

export const reportsController = new ReportsController();
