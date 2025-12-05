import { app } from "#app";
import { config } from "#shared/config/env";
import prisma from "#database/prisma";

async function checkDatabaseConnection() {
	try {
		await prisma.$connect();
		console.log("✅ Conexión a PostgreSQL establecida correctamente");
		return true;
	} catch (error) {
		console.error("❌ Error al conectar con la base de datos:", error);
		return false;
	}
}

async function startServer() {
	try {
		const dbConnected = await checkDatabaseConnection();

		if (!dbConnected) {
			console.error(
				"⚠️  El servidor continuará, pero sin conexión a la base de datos",
			);
		}

		app.listen(config.port);

		console.log(`
🚀 Crazy Shop POS API esta corriendo!

📚 API Docs: http://localhost:${config.port}/swagger
🏥 Health: http://localhost:${config.port}/health
📍 Server: http://localhost:${config.port}
`);
	} catch (error) {
		console.error("❌ Error al iniciar el servidor:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
}

startServer().catch(async (error) => {
	console.error("❌ Error fatal:", error);
	await prisma.$disconnect();
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("❌ Rechazo no controlado en:", promise, "razón:", reason);
});

process.on("uncaughtException", (error) => {
	console.error("❌ Excepción no controlada:", error);
	process.exit(1);
});

process.on("SIGTERM", async () => {
	console.log("\n🛑 SIGTERM recibido. Apagando de forma suave...");
	await prisma.$disconnect();
	console.log("💾 Base de datos desconectada");
	process.exit(0);
});

process.on("SIGINT", async () => {
	console.log("\n🛑 SIGINT recibido. Apagando de forma suave...");
	await prisma.$disconnect();
	console.log("💾 Base de datos desconectada");
	process.exit(0);
});
