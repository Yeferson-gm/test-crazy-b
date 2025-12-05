import { config } from "#shared/config/env";
import prisma from "#database/prisma";
import type {
	UploadResponse,
	MultipleUploadResponse,
	DeleteResponse,
	GetAssetsResponse,
} from "./media.interface";

export class MediaService {
	private readonly apiUrl: string;
	private readonly apiKey: string;

	constructor() {
		this.apiUrl = config.media.apiUrl;
		this.apiKey = config.media.apiKey;
	}

	/**
	 * Guarda los datos de un media en la base de datos
	 */
	async createMedia(data: {
		publicId: string;
		format: string;
		secureUrl: string;
	}) {
		const media = await prisma.media.upsert({
			where: {
				publicId: data.publicId,
			},
			update: {
				format: data.format,
				secureUrl: data.secureUrl,
			},
			create: {
				publicId: data.publicId,
				format: data.format,
				secureUrl: data.secureUrl,
			},
		});

		return media;
	}

	/**
	 * Configura los headers comunes para las peticiones
	 */
	private getHeaders(includeContentType = true): Record<string, string> {
		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.apiKey}`,
			Origin: "http://localhost:4322",
		};

		if (includeContentType) {
			headers["Content-Type"] = "application/json";
		}

		return headers;
	}

	/**
	 * Sube una imagen a la API
	 */
	async uploadImage(
		file: File | Blob,
		folder: string,
		tags?: string,
	): Promise<UploadResponse> {
		try {
			console.log("[BACKEND] Iniciando subida de imagen a Cloudinary...");
			console.log("[BACKEND] Folder:", folder, "Tags:", tags);

			const formData = new FormData();
			formData.append("image", file);
			formData.append("folder", folder);
			if (tags) formData.append("tags", tags);

			console.log(
				"[BACKEND] Enviando petición a:",
				`${this.apiUrl}/image/upload`,
			);

			const response = await fetch(`${this.apiUrl}/image/upload`, {
				method: "POST",
				headers: this.getHeaders(false),
				body: formData,
			});

			console.log(
				"[BACKEND] Respuesta de Cloudinary:",
				response.status,
				response.statusText,
			);

			const result = (await response.json()) as UploadResponse;
			console.log(
				"[BACKEND] Resultado de Cloudinary:",
				JSON.stringify(result, null, 2),
			);

			return result;
		} catch (error: any) {
			console.error("[BACKEND] Error al subir imagen:", error);
			return {
				success: false,
				error: error.message || "Error al subir la imagen",
			};
		}
	}

	/**
	 * Sube múltiples imágenes a la API
	 */
	async uploadMultipleImages(
		files: Array<File | Blob>,
		folder: string,
		tags?: string,
		maxFiles = 5,
	): Promise<MultipleUploadResponse> {
		try {
			const formData = new FormData();

			for (const file of files) {
				formData.append("images", file);
			}

			formData.append("folder", folder);
			if (tags) formData.append("tags", tags);
			formData.append("maxFiles", maxFiles.toString());

			const response = await fetch(`${this.apiUrl}/image/upload/multiple`, {
				method: "POST",
				headers: this.getHeaders(false),
				body: formData,
			});

			const result = (await response.json()) as MultipleUploadResponse;
			return result;
		} catch (error: any) {
			console.error("Error al subir imágenes:", error);
			return {
				success: false,
				error: error.message || "Error al subir las imágenes",
			};
		}
	}

	/**
	 * Sube un video a la API
	 */
	async uploadVideo(
		file: File | Blob,
		folder: string,
		tags?: string,
	): Promise<UploadResponse> {
		try {
			const formData = new FormData();
			formData.append("video", file);
			formData.append("folder", folder);
			if (tags) formData.append("tags", tags);

			const response = await fetch(`${this.apiUrl}/video/upload`, {
				method: "POST",
				headers: this.getHeaders(false),
				body: formData,
			});

			const result = (await response.json()) as UploadResponse;
			return result;
		} catch (error: any) {
			console.error("Error al subir video:", error);
			return {
				success: false,
				error: error.message || "Error al subir el video",
			};
		}
	}

	/**
	 * Sube un archivo genérico (PDF, documentos, etc.) a la API
	 */
	async uploadFile(
		file: File | Blob,
		folder: string,
		tags?: string,
	): Promise<UploadResponse> {
		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("folder", folder);
			if (tags) formData.append("tags", tags);

			const response = await fetch(`${this.apiUrl}/file/upload`, {
				method: "POST",
				headers: this.getHeaders(false),
				body: formData,
			});

			const result = (await response.json()) as UploadResponse;
			return result;
		} catch (error: any) {
			console.error("Error al subir archivo:", error);
			return {
				success: false,
				error: error.message || "Error al subir el archivo",
			};
		}
	}

	/**
	 * Sube múltiples archivos a la API
	 */
	async uploadMultipleFiles(
		files: Array<File | Blob>,
		folder: string,
		tags?: string,
		maxFiles = 5,
	): Promise<MultipleUploadResponse> {
		try {
			const formData = new FormData();

			for (const file of files) {
				formData.append("files", file);
			}

			formData.append("folder", folder);
			if (tags) formData.append("tags", tags);
			formData.append("maxFiles", maxFiles.toString());

			const response = await fetch(`${this.apiUrl}/file/upload/multiple`, {
				method: "POST",
				headers: this.getHeaders(false),
				body: formData,
			});

			const result = (await response.json()) as MultipleUploadResponse;
			return result;
		} catch (error: any) {
			console.error("Error al subir archivos:", error);
			return {
				success: false,
				error: error.message || "Error al subir los archivos",
			};
		}
	}

	/**
	 * Obtiene todas las imágenes del dominio
	 */
	async getImages(): Promise<GetAssetsResponse> {
		try {
			const response = await fetch(`${this.apiUrl}/images`, {
				method: "GET",
				headers: this.getHeaders(),
			});

			const result = (await response.json()) as GetAssetsResponse;
			return result;
		} catch (error: any) {
			console.error("Error al obtener imágenes:", error);
			return {
				success: false,
				error: error.message || "Error al obtener las imágenes",
			};
		}
	}

	/**
	 * Obtiene todos los videos del dominio
	 */
	async getVideos(): Promise<GetAssetsResponse> {
		try {
			const response = await fetch(`${this.apiUrl}/videos`, {
				method: "GET",
				headers: this.getHeaders(),
			});

			const result = (await response.json()) as GetAssetsResponse;
			return result;
		} catch (error: any) {
			console.error("Error al obtener videos:", error);
			return {
				success: false,
				error: error.message || "Error al obtener los videos",
			};
		}
	}

	/**
	 * Obtiene todos los archivos del dominio
	 */
	async getFiles(): Promise<GetAssetsResponse> {
		try {
			const response = await fetch(`${this.apiUrl}/files`, {
				method: "GET",
				headers: this.getHeaders(),
			});

			const result = (await response.json()) as GetAssetsResponse;
			return result;
		} catch (error: any) {
			console.error("Error al obtener archivos:", error);
			return {
				success: false,
				error: error.message || "Error al obtener los archivos",
			};
		}
	}

	/**
	 * Obtiene todos los assets (imágenes, videos, audios, archivos)
	 */
	async getAllAssets(): Promise<GetAssetsResponse> {
		try {
			const response = await fetch(`${this.apiUrl}/assets`, {
				method: "GET",
				headers: this.getHeaders(),
			});

			const result = (await response.json()) as GetAssetsResponse;
			return result;
		} catch (error: any) {
			console.error("Error al obtener assets:", error);
			return {
				success: false,
				error: error.message || "Error al obtener los assets",
			};
		}
	}

	/**
	 * Elimina una imagen por su publicId de Cloudinary y de la base de datos
	 */
	async deleteImage(publicId: string): Promise<DeleteResponse> {
		try {
			console.log("[BACKEND] Iniciando eliminación de imagen...");
			console.log("[BACKEND] PublicId:", publicId);
			console.log(
				"[BACKEND] URL completa:",
				`${this.apiUrl}/image/${publicId}`,
			);

			// Eliminar de Cloudinary
			const response = await fetch(`${this.apiUrl}/image/${publicId}`, {
				method: "DELETE",
				headers: this.getHeaders(),
			});

			console.log(
				"[BACKEND] Respuesta de Cloudinary (delete):",
				response.status,
				response.statusText,
			);

			const result = (await response.json()) as DeleteResponse;
			console.log(
				"[BACKEND] Resultado de eliminación de Cloudinary:",
				JSON.stringify(result, null, 2),
			);

			// Si se eliminó exitosamente de Cloudinary, eliminar también de la BD
			if (result.success) {
				try {
					const deleted = await prisma.media.deleteMany({
						where: {
							publicId: publicId,
						},
					});
					console.log(
						"[BACKEND] Registros de Media eliminados de la BD:",
						deleted.count,
					);
				} catch (dbError) {
					console.error("[BACKEND] Error al eliminar de la BD:", dbError);
					// No fallar si no se encuentra en la BD
				}
			}

			return result;
		} catch (error: any) {
			console.error("[BACKEND] Error al eliminar imagen:", error);
			return {
				success: false,
				error: error.message || "Error al eliminar la imagen",
			};
		}
	}

	/**
	 * Elimina un video por su publicId
	 */
	async deleteVideo(publicId: string): Promise<DeleteResponse> {
		try {
			const response = await fetch(`${this.apiUrl}/video/${publicId}`, {
				method: "DELETE",
				headers: this.getHeaders(),
			});

			const result = (await response.json()) as DeleteResponse;
			return result;
		} catch (error: any) {
			console.error("Error al eliminar video:", error);
			return {
				success: false,
				error: error.message || "Error al eliminar el video",
			};
		}
	}

	/**
	 * Elimina un archivo por su publicId
	 */
	async deleteFile(publicId: string): Promise<DeleteResponse> {
		try {
			const response = await fetch(`${this.apiUrl}/file/${publicId}`, {
				method: "DELETE",
				headers: this.getHeaders(),
			});

			const result = (await response.json()) as DeleteResponse;
			return result;
		} catch (error: any) {
			console.error("Error al eliminar archivo:", error);
			return {
				success: false,
				error: error.message || "Error al eliminar el archivo",
			};
		}
	}
}

export const mediaService = new MediaService();
