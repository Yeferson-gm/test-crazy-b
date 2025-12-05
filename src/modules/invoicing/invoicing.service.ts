import prisma from "#database/prisma";
import { config } from "#shared/config/env";
import type {
	SunatInvoiceRequest,
	SunatInvoiceResponse,
} from "#shared/types/index";
import { formatInvoiceNumber } from "#shared/utils/generators";
import { mediaService } from "#modules/media/media.service";

export class InvoicingService {
	/**
	 * Genera un comprobante electrónico para una venta
	 */
	async createInvoice(data: {
		saleId: string;
		invoiceType: "boleta" | "factura" | "nota_credito" | "nota_debito";
		serie: string;
	}) {
		return await prisma.$transaction(async (tx) => {
			// Obtener información de la venta
			const sale = await tx.sale.findUnique({
				where: { id: data.saleId },
				include: {
					items: {
						include: {
							product: true,
						},
					},
					customer: true,
					store: true,
				},
			});

			if (!sale) {
				throw new Error("Venta no encontrada");
			}

			if (!sale.customer) {
				throw new Error("La venta debe tener un cliente asignado");
			}

			// Verificar si ya existe un comprobante para esta venta
			const existingInvoice = await tx.invoice.findFirst({
				where: { saleId: data.saleId },
			});

			if (existingInvoice) {
				throw new Error("Ya existe un comprobante para esta venta");
			}

			// Obtener el siguiente número correlativo para la serie
			const lastInvoice = await tx.invoice.findFirst({
				where: {
					serie: data.serie,
					storeId: sale.storeId,
				},
				orderBy: { createdAt: "desc" },
			});

			const nextNumber = lastInvoice ? parseInt(lastInvoice.number) + 1 : 1;

			const number = nextNumber.toString().padStart(8, "0");
			const fullNumber = formatInvoiceNumber(data.serie, nextNumber);

			// Preparar datos para la API de SUNAT
			const sunatRequest: SunatInvoiceRequest = {
				tipoComprobante: data.invoiceType,
				serie: data.serie,
				numero: number,
				fechaEmision: new Date().toISOString(),
				cliente: {
					tipoDocumento: sale.customer.documentType,
					numeroDocumento: sale.customer.documentNumber,
					razonSocial: sale.customer.name,
					direccion: sale.customer.address || "",
				},
				items: sale.items.map((item) => ({
					descripcion: item.product.name,
					cantidad: item.quantity,
					precioUnitario: parseFloat(item.unitPrice),
					valorVenta: parseFloat(item.subtotal),
					igv: parseFloat(item.total) - parseFloat(item.subtotal),
					total: parseFloat(item.total),
				})),
				totales: {
					subtotal: parseFloat(sale.subtotal),
					igv: parseFloat(sale.taxAmount),
					total: parseFloat(sale.total),
				},
			};

			// Llamar a la API de facturación personalizada
			const sunatResponse = await this.sendToSunat(sunatRequest);

			if (!sunatResponse.success) {
				throw new Error(`Error al generar comprobante: ${sunatResponse.error}`);
			}

			// Subir XML y PDF a la API de media si existen
			let xmlMediaUrl = sunatResponse.comprobante?.xml;
			let pdfMediaUrl = sunatResponse.comprobante?.pdf;

			if (sunatResponse.comprobante?.xmlContent) {
				const xmlBlob = new Blob([sunatResponse.comprobante.xmlContent], {
					type: "application/xml",
				});
				const xmlUpload = await mediaService.uploadFile(
					xmlBlob,
					`invoices/${sale.storeId}`,
					`${fullNumber},xml,sunat`,
				);
				if (xmlUpload.success) {
					xmlMediaUrl = xmlUpload.data?.secureUrl;
				}
			}

			if (sunatResponse.comprobante?.pdfContent) {
				const pdfBlob = new Blob([sunatResponse.comprobante.pdfContent], {
					type: "application/pdf",
				});
				const pdfUpload = await mediaService.uploadFile(
					pdfBlob,
					`invoices/${sale.storeId}`,
					`${fullNumber},pdf,sunat`,
				);
				if (pdfUpload.success) {
					pdfMediaUrl = pdfUpload.data?.secureUrl;
				}
			}

			// Crear registro de comprobante
			const invoice = await tx.invoice.create({
				data: {
					saleId: data.saleId,
					storeId: sale.storeId,
					customerId: sale.customerId!,
					invoiceType: data.invoiceType,
					serie: data.serie,
					number,
					fullNumber,
					issueDate: new Date(),
					subtotal: sale.subtotal,
					taxAmount: sale.taxAmount,
					total: sale.total,
					status: "accepted",
					sunatResponse: sunatResponse as any,
					sunatCdr: sunatResponse.comprobante?.cdr,
					xmlUrl: xmlMediaUrl,
					pdfUrl: pdfMediaUrl,
					hashCode: sunatResponse.comprobante?.hash,
					qrCode: sunatResponse.comprobante?.qr,
				},
			});

			return invoice;
		});
	}

	/**
	 * Envía comprobante a la API de SUNAT (personalizada del usuario)
	 */
	private async sendToSunat(
		data: SunatInvoiceRequest,
	): Promise<SunatInvoiceResponse> {
		try {
			const response = await fetch(
				`${config.sunat.apiUrl}/generar-comprobante`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${config.sunat.apiKey}`,
						...(config.sunat.apiSecret && {
							"X-API-Secret": config.sunat.apiSecret,
						}),
					},
					body: JSON.stringify(data),
				},
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.message || `HTTP error! status: ${response.status}`,
				);
			}

			const result = await response.json();
			return result;
		} catch (error: any) {
			console.error("Error al comunicarse con API de facturación:", error);
			return {
				success: false,
				error:
					error.message ||
					"Error al comunicarse con el servicio de facturación",
			};
		}
	}

	/**
	 * Obtiene un comprobante por ID
	 */
	async getInvoiceById(id: string) {
		const invoice = await prisma.invoice.findUnique({
			where: { id },
			include: {
				sale: {
					include: {
						items: {
							include: {
								product: true,
							},
						},
					},
				},
				customer: true,
				store: true,
			},
		});

		if (!invoice) {
			throw new Error("Comprobante no encontrado");
		}

		return invoice;
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
		const page = options?.page || 1;
		const limit = options?.limit || 20;
		const skip = (page - 1) * limit;

		const where: any = { storeId };

		if (options?.status) {
			where.status = options.status;
		}

		if (options?.startDate && options?.endDate) {
			where.createdAt = {
				gte: options.startDate,
				lte: options.endDate,
			};
		}

		const [invoicesList, totalCount] = await Promise.all([
			prisma.invoice.findMany({
				where,
				include: {
					sale: true,
					customer: true,
				},
				skip,
				take: limit,
				orderBy: { createdAt: "desc" },
			}),
			prisma.invoice.count({ where }),
		]);

		return {
			invoices: invoicesList,
			pagination: {
				page,
				limit,
				total: totalCount,
				totalPages: Math.ceil(totalCount / limit),
			},
		};
	}

	/**
	 * Anula un comprobante
	 */
	async cancelInvoice(id: string, reason: string) {
		const invoice = await this.getInvoiceById(id);

		if (invoice.status === "cancelled") {
			throw new Error("El comprobante ya está anulado");
		}

		// Aquí deberías implementar la lógica para comunicarte con SUNAT
		// para la anulación del comprobante (comunicación de baja)

		const updatedInvoice = await prisma.invoice.update({
			where: { id },
			data: {
				status: "cancelled",
				notes: `Anulado: ${reason}`,
				updatedAt: new Date(),
			},
		});

		return updatedInvoice;
	}
}

export const invoicingService = new InvoicingService();
