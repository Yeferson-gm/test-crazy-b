import prisma from "#database/prisma";

export class EmployeesService {
	/**
	 * Obtiene todos los empleados
	 */
	async getAllEmployees(options?: {
		storeId?: string;
		role?: string;
		includeInactive?: boolean;
	}) {
		const where: any = {};

		if (options?.storeId) {
			where.storeId = options.storeId;
		}

		if (options?.role) {
			where.role = options.role;
		}

		if (!options?.includeInactive) {
			where.isActive = true;
		}

		return await prisma.user.findMany({
			where,
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				dni: true,
				phone: true,
				role: true,
				storeId: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				store: {
					select: {
						id: true,
						name: true,
						code: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Obtiene un empleado por ID
	 */
	async getEmployeeById(id: string) {
		const employee = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				dni: true,
				phone: true,
				role: true,
				storeId: true,
				isActive: true,
				createdAt: true,
				updatedAt: true,
				store: true,
			},
		});

		if (!employee) {
			throw new Error("Empleado no encontrado");
		}

		return employee;
	}

	/**
	 * Obtiene ventas de un empleado
	 */
	async getEmployeeSales(
		employeeId: string,
		options?: {
			startDate?: Date;
			endDate?: Date;
		},
	) {
		const where: any = { userId: employeeId, status: "completed" };

		if (options?.startDate && options?.endDate) {
			where.createdAt = {
				gte: options.startDate,
				lte: options.endDate,
			};
		}

		const [sales, stats] = await Promise.all([
			prisma.sale.findMany({
				where,
				include: {
					items: true,
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.sale.aggregate({
				where,
				_sum: { total: true },
				_count: true,
			}),
		]);

		return {
			sales,
			summary: {
				totalSales: stats._count,
				totalRevenue: parseFloat(stats._sum.total?.toString() || "0"),
			},
		};
	}

	/**
	 * Obtiene estadísticas de empleado
	 */
	async getEmployeeStats(employeeId: string) {
		const [totalSales, todaySales, cashRegisterCount] = await Promise.all([
			prisma.sale.aggregate({
				where: {
					userId: employeeId,
					status: "completed",
				},
				_sum: { total: true },
				_count: true,
			}),
			prisma.sale.aggregate({
				where: {
					userId: employeeId,
					status: "completed",
					createdAt: {
						gte: new Date(new Date().setHours(0, 0, 0, 0)),
					},
				},
				_sum: { total: true },
				_count: true,
			}),
			prisma.cashRegister.count({
				where: { userId: employeeId },
			}),
		]);

		return {
			allTime: {
				sales: totalSales._count,
				revenue: parseFloat(totalSales._sum.total?.toString() || "0"),
			},
			today: {
				sales: todaySales._count,
				revenue: parseFloat(todaySales._sum.total?.toString() || "0"),
			},
			cashRegistersOpened: cashRegisterCount,
		};
	}
}

export const employeesService = new EmployeesService();
