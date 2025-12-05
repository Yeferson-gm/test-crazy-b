import prisma from "#database/prisma";

export class PaymentsService {
	/**
	 * Registra un pago para una venta
	 */
	async createPaymentRecord(data: {
		saleId: string;
		amount: string;
		paymentMethod: "cash" | "card" | "yape" | "plin" | "transfer";
		reference?: string;
		notes?: string;
	}) {
		const payment = await prisma.paymentRecord.create({
			data,
			include: {
				sale: true,
			},
		});

		return payment;
	}

	/**
	 * Obtiene registros de pago de una venta
	 */
	async getSalePayments(saleId: string) {
		return await prisma.paymentRecord.findMany({
			where: { saleId },
			orderBy: { createdAt: "desc" },
		});
	}

	/**
	 * Abre caja registradora
	 */
	async openCashRegister(data: {
		storeId: string;
		userId: string;
		openingAmount: string;
		notes?: string;
	}) {
		// Verificar que no haya caja abierta
		const openRegister = await prisma.cashRegister.findFirst({
			where: {
				storeId: data.storeId,
				status: "open",
			},
		});

		if (openRegister) {
			throw new Error("Ya existe una caja abierta en esta tienda");
		}

		return await prisma.cashRegister.create({
			data: {
				storeId: data.storeId,
				userId: data.userId,
				openingAmount: data.openingAmount,
				status: "open",
				notes: data.notes,
			},
			include: {
				store: true,
				user: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
						role: true,
					},
				},
			},
		});
	}

	/**
	 * Cierra caja registradora
	 */
	async closeCashRegister(data: {
		registerId: string;
		closingAmount: string;
		notes?: string;
	}) {
		const register = await prisma.cashRegister.findUnique({
			where: { id: data.registerId },
			include: {
				store: true,
			},
		});

		if (!register) {
			throw new Error("Caja no encontrada");
		}

		if (register.status !== "open") {
			throw new Error("La caja ya está cerrada");
		}

		// Calcular ventas en efectivo durante el período
		const cashSales = await prisma.sale.aggregate({
			where: {
				storeId: register.storeId,
				paymentMethod: "cash",
				status: "completed",
				createdAt: {
					gte: register.openedAt,
				},
			},
			_sum: {
				total: true,
			},
		});

		const expectedAmount =
			parseFloat(register.openingAmount.toString()) +
			parseFloat(cashSales._sum.total?.toString() || "0");

		const difference = parseFloat(data.closingAmount) - expectedAmount;

		return await prisma.cashRegister.update({
			where: { id: data.registerId },
			data: {
				closingAmount: data.closingAmount,
				expectedAmount: expectedAmount.toFixed(2),
				difference: difference.toFixed(2),
				status: "closed",
				closedAt: new Date(),
				notes: data.notes,
			},
			include: {
				store: true,
				user: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
						role: true,
					},
				},
			},
		});
	}

	/**
	 * Obtiene caja actual abierta
	 */
	async getCurrentCashRegister(storeId: string) {
		return await prisma.cashRegister.findFirst({
			where: {
				storeId,
				status: "open",
			},
			include: {
				store: true,
				user: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
						role: true,
					},
				},
			},
		});
	}

	/**
	 * Historial de cajas
	 */
	async getCashRegisterHistory(storeId: string, limit: number = 20) {
		return await prisma.cashRegister.findMany({
			where: { storeId },
			include: {
				user: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
						role: true,
					},
				},
			},
			orderBy: { openedAt: "desc" },
			take: limit,
		});
	}

	/**
	 * Obtiene detalles de caja por ID
	 */
	async getCashRegisterById(id: string) {
		const register = await prisma.cashRegister.findUnique({
			where: { id },
			include: {
				store: true,
				user: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
						role: true,
					},
				},
			},
		});

		if (!register) {
			throw new Error("Caja no encontrada");
		}

		// Obtener ventas del período
		const sales = await prisma.sale.findMany({
			where: {
				storeId: register.storeId,
				status: "completed",
				createdAt: {
					gte: register.openedAt,
					...(register.closedAt && { lte: register.closedAt }),
				},
			},
			include: {
				items: true,
			},
		});

		return {
			...register,
			sales,
		};
	}
}

export const paymentsService = new PaymentsService();
