import { Elysia, t } from "elysia";
import { mediaController } from "./media.controller";
import { authMiddleware } from "#shared/middleware/auth";

export const mediaRoutes = new Elysia({ prefix: "/media" })
	.use(authMiddleware)

	/**
	 * POST /api/media
	 * Guarda los datos de un archivo en la base de datos
	 */
	.post(
		"/",
		async ({ body, set }) => {
			try {
				const media = await mediaController.createMedia(body);
				return {
					success: true,
					message: "Media guardado exitosamente",
					data: media,
				};
			} catch (error: any) {
				set.status = 400;
				return {
					success: false,
					message: error.message || "Error al guardar media",
				};
			}
		},
		{
			body: t.Object({
				publicId: t.String(),
				format: t.String(),
				secureUrl: t.String(),
			}),
		},
	)

	/**
	 * POST /api/v1/media/image/upload
	 * Sube una imagen
	 */
	.post(
		"/image/upload",
		async ({ body }) => {
			const { file, folder, tags } = body;

			const result = await mediaController.uploadImage(file, folder, tags);

			if (!result.success) {
				return {
					success: false,
					message: result.error || "Error al subir la imagen",
				};
			}

			return {
				success: true,
				message: "Imagen subida exitosamente",
				data: result.data,
			};
		},
		{
			body: t.Object({
				file: t.File({
					type: ["image/jpeg", "image/png", "image/gif", "image/webp"],
					maxSize: "10m",
				}),
				folder: t.String(),
				tags: t.Optional(t.String()),
			}),
		},
	)

	/**
	 * POST /api/v1/media/image/upload/multiple
	 * Sube múltiples imágenes
	 */
	.post(
		"/image/upload/multiple",
		async ({ body }) => {
			const { files, folder, tags, maxFiles } = body;

			const result = await mediaController.uploadMultipleImages(
				files,
				folder,
				tags,
				maxFiles || 5,
			);

			if (!result.success) {
				return {
					success: false,
					message: result.error || "Error al subir las imágenes",
				};
			}

			return {
				success: true,
				message: `${result.data?.successCount} imágenes subidas exitosamente`,
				data: result.data,
			};
		},
		{
			body: t.Object({
				files: t.Files({
					type: ["image/jpeg", "image/png", "image/gif", "image/webp"],
					maxSize: "10m",
				}),
				folder: t.String(),
				tags: t.Optional(t.String()),
				maxFiles: t.Optional(t.Number()),
			}),
		},
	)

	/**
	 * POST /api/v1/media/video/upload
	 * Sube un video
	 */
	.post(
		"/video/upload",
		async ({ body }) => {
			const { file, folder, tags } = body;

			const result = await mediaController.uploadVideo(file, folder, tags);

			if (!result.success) {
				return {
					success: false,
					message: result.error || "Error al subir el video",
				};
			}

			return {
				success: true,
				message: "Video subido exitosamente",
				data: result.data,
			};
		},
		{
			body: t.Object({
				file: t.File({
					type: ["video/mp4", "video/mpeg", "video/webm", "video/quicktime"],
					maxSize: "50m",
				}),
				folder: t.String(),
				tags: t.Optional(t.String()),
			}),
		},
	)

	/**
	 * POST /api/v1/media/file/upload
	 * Sube un archivo genérico (PDF, documentos, XML, etc.)
	 */
	.post(
		"/file/upload",
		async ({ body }) => {
			const { file, folder, tags } = body;

			const result = await mediaController.uploadFile(file, folder, tags);

			if (!result.success) {
				return {
					success: false,
					message: result.error || "Error al subir el archivo",
				};
			}

			return {
				success: true,
				message: "Archivo subido exitosamente",
				data: result.data,
			};
		},
		{
			body: t.Object({
				file: t.File({
					type: [
						"application/pdf",
						"application/xml",
						"text/xml",
						"application/msword",
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
						"application/vnd.ms-excel",
						"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					],
					maxSize: "10m",
				}),
				folder: t.String(),
				tags: t.Optional(t.String()),
			}),
		},
	)

	/**
	 * POST /api/v1/media/file/upload/multiple
	 * Sube múltiples archivos
	 */
	.post(
		"/file/upload/multiple",
		async ({ body }) => {
			const { files, folder, tags, maxFiles } = body;

			const result = await mediaController.uploadMultipleFiles(
				files,
				folder,
				tags,
				maxFiles || 5,
			);

			if (!result.success) {
				return {
					success: false,
					message: result.error || "Error al subir los archivos",
				};
			}

			return {
				success: true,
				message: `${result.data?.successCount} archivos subidos exitosamente`,
				data: result.data,
			};
		},
		{
			body: t.Object({
				files: t.Files({
					maxSize: "10m",
				}),
				folder: t.String(),
				tags: t.Optional(t.String()),
				maxFiles: t.Optional(t.Number()),
			}),
		},
	)

	/**
	 * GET /api/v1/media/images
	 * Obtiene todas las imágenes
	 */
	.get("/images", async () => {
		const result = await mediaController.getImages();

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Error al obtener las imágenes",
			};
		}

		return {
			success: true,
			data: result.data,
		};
	})

	/**
	 * GET /api/v1/media/videos
	 * Obtiene todos los videos
	 */
	.get("/videos", async () => {
		const result = await mediaController.getVideos();

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Error al obtener los videos",
			};
		}

		return {
			success: true,
			data: result.data,
		};
	})

	/**
	 * GET /api/v1/media/files
	 * Obtiene todos los archivos
	 */
	.get("/files", async () => {
		const result = await mediaController.getFiles();

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Error al obtener los archivos",
			};
		}

		return {
			success: true,
			data: result.data,
		};
	})

	/**
	 * GET /api/v1/media/assets
	 * Obtiene todos los assets (imágenes, videos, audios, archivos)
	 */
	.get("/assets", async () => {
		const result = await mediaController.getAllAssets();

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Error al obtener los assets",
			};
		}

		return {
			success: true,
			data: result.data,
		};
	})

	/**
	 * DELETE /api/v1/media/image/:publicId
	 * Elimina una imagen
	 */
	.delete("/image/:publicId", async ({ params }) => {
		const { publicId } = params;

		const result = await mediaController.deleteImage(publicId);

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Error al eliminar la imagen",
			};
		}

		return {
			success: true,
			message: "Imagen eliminada exitosamente",
			data: result.data,
		};
	})

	/**
	 * DELETE /api/v1/media/video/:publicId
	 * Elimina un video
	 */
	.delete("/video/:publicId", async ({ params }) => {
		const { publicId } = params;

		const result = await mediaController.deleteVideo(publicId);

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Error al eliminar el video",
			};
		}

		return {
			success: true,
			message: "Video eliminado exitosamente",
			data: result.data,
		};
	})

	/**
	 * DELETE /api/v1/media/file/:publicId
	 * Elimina un archivo
	 */
	.delete("/file/:publicId", async ({ params }) => {
		const { publicId } = params;

		const result = await mediaController.deleteFile(publicId);

		if (!result.success) {
			return {
				success: false,
				message: result.error || "Error al eliminar el archivo",
			};
		}

		return {
			success: true,
			message: "Archivo eliminado exitosamente",
			data: result.data,
		};
	});
