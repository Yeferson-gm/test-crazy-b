import { mediaService } from "./media.service";

export class MediaController {
	/**
	 * Guarda los datos de un media en la base de datos
	 */
	async createMedia(data: {
		publicId: string;
		format: string;
		secureUrl: string;
	}) {
		return await mediaService.createMedia(data);
	}

	/**
	 * Sube una imagen
	 */
	async uploadImage(file: File | Blob, folder: string, tags?: string) {
		return await mediaService.uploadImage(file, folder, tags);
	}

	/**
	 * Sube múltiples imágenes
	 */
	async uploadMultipleImages(
		files: Array<File | Blob>,
		folder: string,
		tags?: string,
		maxFiles?: number,
	) {
		return await mediaService.uploadMultipleImages(
			files,
			folder,
			tags,
			maxFiles,
		);
	}

	/**
	 * Sube un video
	 */
	async uploadVideo(file: File | Blob, folder: string, tags?: string) {
		return await mediaService.uploadVideo(file, folder, tags);
	}

	/**
	 * Sube un archivo
	 */
	async uploadFile(file: File | Blob, folder: string, tags?: string) {
		return await mediaService.uploadFile(file, folder, tags);
	}

	/**
	 * Sube múltiples archivos
	 */
	async uploadMultipleFiles(
		files: Array<File | Blob>,
		folder: string,
		tags?: string,
		maxFiles?: number,
	) {
		return await mediaService.uploadMultipleFiles(
			files,
			folder,
			tags,
			maxFiles,
		);
	}

	/**
	 * Obtiene todas las imágenes
	 */
	async getImages() {
		return await mediaService.getImages();
	}

	/**
	 * Obtiene todos los videos
	 */
	async getVideos() {
		return await mediaService.getVideos();
	}

	/**
	 * Obtiene todos los archivos
	 */
	async getFiles() {
		return await mediaService.getFiles();
	}

	/**
	 * Obtiene todos los assets
	 */
	async getAllAssets() {
		return await mediaService.getAllAssets();
	}

	/**
	 * Elimina una imagen
	 */
	async deleteImage(publicId: string) {
		return await mediaService.deleteImage(publicId);
	}

	/**
	 * Elimina un video
	 */
	async deleteVideo(publicId: string) {
		return await mediaService.deleteVideo(publicId);
	}

	/**
	 * Elimina un archivo
	 */
	async deleteFile(publicId: string) {
		return await mediaService.deleteFile(publicId);
	}
}

export const mediaController = new MediaController();
