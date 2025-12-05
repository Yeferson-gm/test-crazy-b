import type { User as PrismaUser, Store as PrismaStore } from "@prisma/client";

// User types
export type User = PrismaUser;
export type NewUser = Omit<PrismaUser, "id" | "createdAt" | "updatedAt">;

export type UserRole = "admin" | "manager" | "cashier" | "seller";

export type UserPayload = {
	id: string;
	email: string;
	role: UserRole;
	storeId: string;
};

// Store types
export type Store = PrismaStore;
export type NewStore = Omit<PrismaStore, "id" | "createdAt" | "updatedAt">;

// Response types
export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface PaginatedResponse<T = any> {
	success: boolean;
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// Permission types
export interface PermissionCheck {
	userId: string;
	storeId: string;
	role: UserRole;
	requiredRoles?: UserRole[];
	allowedStoreIds?: string[];
}

// SUNAT API types (personaliza según tu API)
export interface SunatInvoiceRequest {
	tipoComprobante: "boleta" | "factura" | "nota_credito" | "nota_debito";
	serie: string;
	numero: string;
	fechaEmision: string;
	cliente: {
		tipoDocumento: string;
		numeroDocumento: string;
		razonSocial: string;
		direccion?: string;
	};
	items: Array<{
		descripcion: string;
		cantidad: number;
		precioUnitario: number;
		valorVenta: number;
		igv: number;
		total: number;
	}>;
	totales: {
		subtotal: number;
		igv: number;
		total: number;
	};
}

export interface SunatInvoiceResponse {
	success: boolean;
	comprobante?: {
		serie: string;
		numero: string;
		xml: string;
		pdf: string;
		cdr?: string;
		hash: string;
		qr: string;
	};
	error?: string;
}
