import prisma from "#database/prisma";
import { generateSaleNumber } from "#shared/utils/generators";
import dayjs from "dayjs";

export class SalesService {
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
		return await prisma.$transaction(async (tx) => {
			let customerId = data.customerId;

			// Crear o buscar cliente si se proporcionan datos
			if (!customerId && data.customerData) {
				const existingCustomer = await tx.customer.findFirst({
					where: { documentNumber: data.customerData.documentNumber },
				});

				if (existingCustomer) {
					customerId = existingCustomer.id;
				} else {
					const newCustomer = await tx.customer.create({
						data: data.customerData,
					});
					customerId = newCustomer.id;
				}
			}

			// Verificar stock y calcular totales
			let subtotal = 0;
			let taxAmount = 0;
			const itemsWithTotals = [];

			for (const item of data.items) {
				// Obtener información del producto
				const product = await tx.product.findFirst({
					where: { id: item.productId },
				});

				if (!product) {
					throw new Error("Producto no encontrado");
				}

				// Verificar stock disponible
				if (product.stock < item.quantity) {
					throw new Error(
						`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`,
					);
				}

				const unitPrice = parseFloat(item.unitPrice);
				const discount = parseFloat(item.discount || "0");
				const taxRate = parseFloat(product.taxRate.toString());

				const itemSubtotal = unitPrice * item.quantity - discount;
				const itemTax = itemSubtotal * (taxRate / 100);
				const itemTotal = itemSubtotal + itemTax;

				subtotal += itemSubtotal;
				taxAmount += itemTax;

				itemsWithTotals.push({
					productId: item.productId,
					quantity: item.quantity,
					unitPrice: item.unitPrice,
					taxRate: taxRate.toFixed(2),
					discount: discount.toFixed(2),
					subtotal: itemSubtotal.toFixed(2),
					total: itemTotal.toFixed(2),
				});
			}

			const globalDiscount = parseFloat(data.discount || "0");
			subtotal -= globalDiscount;
			const total = subtotal + taxAmount;

			// Generar número de venta
			const todaySales = await tx.sale.count({
				where: {
					storeId: data.storeId,
					createdAt: {
						gte: dayjs().startOf("day").toDate(),
						lte: dayjs().endOf("day").toDate(),
					},
				},
			});

			const saleNumber = generateSaleNumber(todaySales + 1);

			// Crear venta
			const newSale = await tx.sale.create({
				data: {
					storeId: data.storeId,
					userId: data.userId,
					customerId,
					saleNumber,
					subtotal: subtotal.toFixed(2),
					taxAmount: taxAmount.toFixed(2),
					discount: globalDiscount.toFixed(2),
					total: total.toFixed(2),
					paymentMethod: data.paymentMethod,
					paymentReference: data.paymentReference,
					status: "completed",
					notes: data.notes,
				},
			});

			// Crear items de la venta y reducir stock
			for (const item of itemsWithTotals) {
				await tx.saleItem.create({
					data: {
						saleId: newSale.id,
						...item,
					},
				});

				// Reducir stock del producto
				await tx.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							decrement: item.quantity,
						},
					},
				});
			}

			// Obtener venta completa con relaciones
			return await tx.sale.findFirst({
				where: { id: newSale.id },
				include: {
					items: {
						include: {
							product: true,
						},
					},
					customer: true,
					user: {
						select: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
							role: true,
							storeId: true,
							isActive: true,
							createdAt: true,
							updatedAt: true,
						},
					},
				},
			});
		});
	}

	/**
	 * Obtiene ventas de una tienda con filtros
	 */
	async getStoreSales(options: {
		storeId: string;
		startDate?: Date;
		endDate?: Date;
		page?: number;
		limit?: number;
	}) {
		const page = options.page || 1;
		const limit = options.limit || 20;
		const skip = (page - 1) * limit;

		const where: any = { storeId: options.storeId };

		if (options.startDate && options.endDate) {
			where.createdAt = {
				gte: options.startDate,
				lte: options.endDate,
			};
		}

		const [salesList, totalCount] = await Promise.all([
			prisma.sale.findMany({
				where,
				include: {
					items: {
						include: {
							product: {
								include: {
									images: true,
								},
							},
						},
					},
					customer: true,
					user: {
						select: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
							role: true,
							storeId: true,
							isActive: true,
							createdAt: true,
							updatedAt: true,
						},
					},
					store: {
						select: {
							id: true,
							name: true,
						},
					},
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.sale.count({ where }),
		]);

		return {
			sales: salesList,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
		};
	}

	/**
	 * Obtiene una venta por ID
	 */
	async getSaleById(id: string) {
		const sale = await prisma.sale.findUnique({
			where: { id },
			include: {
				items: {
					include: {
						product: {
							include: {
								images: true,
							},
						},
					},
				},
				customer: true,
				user: {
					select: {
						id: true,
						email: true,
						firstName: true,
						lastName: true,
						role: true,
						storeId: true,
						isActive: true,
						createdAt: true,
						updatedAt: true,
					},
				},
				store: {
					select: {
						id: true,
						name: true,
					},
				},
				invoice: true,
			},
		});

		if (!sale) {
			throw new Error("Venta no encontrada");
		}

		return sale;
	}

	/**
	 * Cancela una venta (restaura stock)
	 */
	async cancelSale(id: string, userId: string, reason: string) {
		return await prisma.$transaction(async (tx) => {
			const sale = await tx.sale.findUnique({
				where: { id },
				include: {
					items: true,
				},
			});

			if (!sale) {
				throw new Error("Venta no encontrada");
			}

			if (sale.status === "cancelled") {
				throw new Error("La venta ya está cancelada");
			}

			// Restaurar stock
			for (const item of sale.items) {
				await tx.product.update({
					where: { id: item.productId },
					data: {
						stock: {
							increment: item.quantity,
						},
					},
				});
			}

			// Actualizar estado de venta
			const updatedSale = await tx.sale.update({
				where: { id },
				data: {
					status: "cancelled",
					notes: `${sale.notes || ""}\nCANCELADA: ${reason}`,
					updatedAt: new Date(),
				},
			});

			return updatedSale;
		});
	}
}

export const salesService = new SalesService();
