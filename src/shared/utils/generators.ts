import dayjs from "dayjs";

/**
 * Genera un número de venta único basado en fecha y secuencia
 * Formato: YYYYMMDD-XXXX (ej: 20241120-0001)
 */
export const generateSaleNumber = (sequence: number): string => {
	const date = dayjs().format("YYYYMMDD");
	const seq = sequence.toString().padStart(4, "0");
	return `${date}-${seq}`;
};

/**
 * Genera un SKU único para productos
 * Formato: SKU-TIMESTAMP-RANDOM
 */
export const generateSKU = (): string => {
	const timestamp = Date.now().toString(36).toUpperCase();
	const random = Math.random().toString(36).substring(2, 7).toUpperCase();
	return `SKU-${timestamp}-${random}`;
};

/**
 * Genera código de tienda
 * Formato: STORE-XXX
 */
export const generateStoreCode = (sequence: number): string => {
	return `STORE-${sequence.toString().padStart(3, "0")}`;
};

/**
 * Formatea número de comprobante
 * Formato: SERIE-NUMERO (ej: B001-00000123)
 */
export const formatInvoiceNumber = (serie: string, numero: number): string => {
	return `${serie}-${numero.toString().padStart(8, "0")}`;
};
