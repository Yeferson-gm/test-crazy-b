import type { ApiResponse, PaginatedResponse } from "#shared/types/index";

export const successResponse = <T>(
	data: T,
	message?: string,
): ApiResponse<T> => ({
	success: true,
	data,
	message,
});

export const errorResponse = (
	error: string,
	message?: string,
): ApiResponse => ({
	success: false,
	error,
	message,
});

export const paginatedResponse = <T>(
	data: T[],
	page: number,
	limit: number,
	total: number,
): PaginatedResponse<T> => ({
	success: true,
	data,
	pagination: {
		page,
		limit,
		total,
		totalPages: Math.ceil(total / limit),
	},
});
