import prisma from "#database/prisma";
import dayjs from "dayjs";

export class ReportsService {
	/**
	 * Reporte de ventas por período
	 */
	async getSalesReport(options: {
		storeId?: string;
		startDate: Date;
		endDate: Date;
	}) {
		const where: any = {
			createdAt: {
				gte: options.startDate,
				lte: options.endDate,
			},
			status: "completed",
		};

		if (options.storeId) {
			where.storeId = options.storeId;
		}

		const [sales, totalSales] = await Promise.all([
			prisma.sale.findMany({
				where,
				include: {
					items: true,
					store: true,
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.sale.aggregate({
				where,
				_sum: { total: true, subtotal: true, taxAmount: true },
				_count: true,
			}),
		]);

		const totalRevenue = parseFloat(totalSales._sum.total || "0");
		const totalSubtotal = parseFloat(totalSales._sum.subtotal || "0");
		const totalTax = parseFloat(totalSales._sum.taxAmount || "0");

		return {
			sales,
			summary: {
				totalSales: totalSales._count,
				totalRevenue,
				totalSubtotal,
				totalTax,
				averageTicket:
					totalSales._count > 0 ? totalRevenue / totalSales._count : 0,
			},
			period: {
				startDate: options.startDate,
				endDate: options.endDate,
			},
		};
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
		const limit = options.limit || 10;

		const saleWhere: any = { status: "completed" };

		if (options.storeId) {
			saleWhere.storeId = options.storeId;
		}

		if (options.startDate && options.endDate) {
			saleWhere.createdAt = {
				gte: options.startDate,
				lte: options.endDate,
			};
		}

		const saleItems = await prisma.saleItem.findMany({
			where: {
				sale: saleWhere,
			},
			include: {
				product: {
					include: {
						category: true,
					},
				},
			},
		});

		const productSales = new Map<
			string,
			{
				product: any;
				quantity: number;
				revenue: number;
				salesCount: number;
			}
		>();

		saleItems.forEach((item) => {
			const existing = productSales.get(item.productId);
			if (existing) {
				existing.quantity += item.quantity;
				existing.revenue += parseFloat(item.total);
				existing.salesCount += 1;
			} else {
				productSales.set(item.productId, {
					product: item.product,
					quantity: item.quantity,
					revenue: parseFloat(item.total),
					salesCount: 1,
				});
			}
		});

		const topProducts = Array.from(productSales.values())
			.sort((a, b) => b.quantity - a.quantity)
			.slice(0, limit);

		return topProducts;
	}

	/**
	 * Reporte de inventario bajo stock
	 */
	async getLowStockReport(storeId: string) {
		const lowStockProducts = await prisma.inventory.findMany({
			where: {
				storeId,
				product: {
					isActive: true,
				},
			},
			include: {
				product: {
					include: {
						category: true,
					},
				},
				store: true,
			},
		});

		const filtered = lowStockProducts.filter(
			(inv) => inv.quantity <= inv.product.minStock,
		);

		return {
			totalLowStock: filtered.length,
			products: filtered.map((inv) => ({
				product: inv.product,
				currentStock: inv.quantity,
				minStock: inv.product.minStock,
				deficit: inv.product.minStock - inv.quantity,
				store: inv.store,
			})),
		};
	}

	/**
	 * Reporte de ventas por método de pago
	 */
	async getSalesByPaymentMethod(options: {
		storeId?: string;
		startDate: Date;
		endDate: Date;
	}) {
		const where: any = {
			createdAt: {
				gte: options.startDate,
				lte: options.endDate,
			},
			status: "completed",
		};

		if (options.storeId) {
			where.storeId = options.storeId;
		}

		const sales = await prisma.sale.findMany({
			where,
			select: {
				paymentMethod: true,
				total: true,
			},
		});

		const byMethod = new Map<string, { count: number; total: number }>();

		sales.forEach((sale) => {
			const existing = byMethod.get(sale.paymentMethod);
			if (existing) {
				existing.count += 1;
				existing.total += parseFloat(sale.total);
			} else {
				byMethod.set(sale.paymentMethod, {
					count: 1,
					total: parseFloat(sale.total),
				});
			}
		});

		return Array.from(byMethod.entries()).map(([method, data]) => ({
			paymentMethod: method,
			salesCount: data.count,
			totalRevenue: data.total,
		}));
	}

	/**
	 * Reporte de ventas diarias (últimos 30 días)
	 */
	async getDailySalesReport(storeId?: string) {
		const endDate = dayjs().endOf("day").toDate();
		const startDate = dayjs().subtract(30, "days").startOf("day").toDate();

		const where: any = {
			createdAt: {
				gte: startDate,
				lte: endDate,
			},
			status: "completed",
		};

		if (storeId) {
			where.storeId = storeId;
		}

		const sales = await prisma.sale.findMany({
			where,
			select: {
				createdAt: true,
				total: true,
			},
			orderBy: { createdAt: "asc" },
		});

		const dailySales = new Map<string, { count: number; total: number }>();

		sales.forEach((sale) => {
			const day = dayjs(sale.createdAt).format("YYYY-MM-DD");
			const existing = dailySales.get(day);
			if (existing) {
				existing.count += 1;
				existing.total += parseFloat(sale.total);
			} else {
				dailySales.set(day, {
					count: 1,
					total: parseFloat(sale.total),
				});
			}
		});

		return Array.from(dailySales.entries())
			.map(([date, data]) => ({
				date,
				salesCount: data.count,
				totalRevenue: data.total,
			}))
			.sort((a, b) => a.date.localeCompare(b.date));
	}

	/**
	 * Dashboard general
	 */
	async getDashboardStats(storeId?: string) {
		const today = dayjs().startOf("day").toDate();
		const endOfDay = dayjs().endOf("day").toDate();

		const where: any = { status: "completed" };
		const whereToday: any = {
			status: "completed",
			createdAt: { gte: today, lte: endOfDay },
		};

		if (storeId) {
			where.storeId = storeId;
			whereToday.storeId = storeId;
		}

		const [todaySales, totalSales, lowStockCount] = await Promise.all([
			prisma.sale.aggregate({
				where: whereToday,
				_sum: { total: true },
				_count: true,
			}),
			prisma.sale.aggregate({
				where,
				_sum: { total: true },
				_count: true,
			}),
			prisma.inventory.count({
				where: storeId ? { storeId } : {},
			}),
		]);

		return {
			today: {
				sales: todaySales._count,
				revenue: parseFloat(todaySales._sum.total || "0"),
			},
			allTime: {
				sales: totalSales._count,
				revenue: parseFloat(totalSales._sum.total || "0"),
			},
			inventory: {
				totalProducts: lowStockCount,
			},
		};
	}
}

export const reportsService = new ReportsService();
