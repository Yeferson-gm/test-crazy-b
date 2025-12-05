export interface UploadResponse {
	success: boolean;
	message?: string;
	data?: {
		publicId: string;
		format: string;
		secureUrl: string;
	};
	error?: string;
}

export interface MultipleUploadResponse {
	success: boolean;
	message?: string;
	data?: {
		successful: Array<{
			publicId: string;
			secureUrl: string;
		}>;
		failed: Array<any>;
		total: number;
		successCount: number;
		failureCount: number;
	};
	error?: string;
}

export interface DeleteResponse {
	success: boolean;
	message?: string;
	data?: {
		publicId: string;
	};
	error?: string;
}

export interface GetAssetsResponse {
	success: boolean;
	data?: Array<{
		publicId: string;
		format: string;
		secureUrl: string;
	}>;
	error?: string;
}
