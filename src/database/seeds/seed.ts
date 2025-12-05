import prisma from "#database/prisma";
import { auth } from "#shared/config/auth";

async function seed() {
	console.log("🌱 Iniciando seed de datos...");

	try {
		// Crear tiendas
		console.log("📍 Creando tiendas...");
		const store1 = await prisma.store.create({
			data: {
				name: "Crazy Shop - Sede Central",
				code: "STORE-001",
				address: "Av. Principal 123, Lima",
				phone: "987654321",
				email: "central@crazyshop.com",
				ruc: "20123456789",
			},
		});

		console.log(`✅ Tiendas creadas: ${store1.name}`);

		// Crear usuario usando Better Auth API
		console.log("👤 Creando usuarios con Better Auth...");

		// Better Auth maneja la creación de usuario + cuenta (password hasheado con scrypt)
		const userResponse = await auth.api.signUpEmail({
			body: {
				email: "isauyeferson.gm@gmail.com",
				password: "Yeferson#0808",
				name: "Yeferson Admin",
				// Campos adicionales definidos en auth.ts
				firstName: "Yeferson",
				lastName: "Garcia",
				dni: "62531050",
				phone: "956565948",
				role: "admin",
				storeId: store1.id,
				isActive: true,
			},
		});

		// Better Auth crea el usuario con emailVerified en false por defecto
		// Lo actualizamos manualmente para el seed
		if (userResponse?.user) {
			await prisma.user.update({
				where: { id: userResponse.user.id },
				data: { emailVerified: true },
			});
		}

		console.log("✅ Usuario creado con Better Auth");
		console.log(
			"   📧 isauyeferson.gm@gmail.com / Yeferson#0808 (Admin - Yeferson)",
		);

		// Crear categorías
		console.log("📂 Creando categorías...");
		const catRopa = await prisma.category.create({
			data: { name: "Ropa", description: "Prendas de vestir" },
		});

		console.log(`✅ Categorías creadas: ${catRopa.name}`);

		// Crear productos con stock
		console.log("📦 Creando productos...");
		const productsData = [
			// Ropa
			{
				categoryId: catRopa.id,
				sku: "SKU-POLO-001",
				barcode: "7501234567893",
				name: "Polo Blanco Talla M",
				description: "Polo algodón 100%",
				costPrice: "12.00",
				salePrice: "20.00",
				stock: 80,
				minStock: 30,
			},
		];

		const createdProducts = [];
		for (const productData of productsData) {
			const product = await prisma.product.create({ data: productData });
			createdProducts.push(product);
		}

		console.log(`✅ ${createdProducts.length} productos creados con stock`);

		console.log("\n🎉 Seed completado exitosamente!");
		console.log("\n📝 Resumen:");
		console.log(`   - ${2} tiendas`);
		console.log(`   - ${1} usuario`);
		console.log(`   - ${1} categoría`);
		console.log(`   - ${createdProducts.length} productos`);
		console.log("\n🔑 Credenciales de acceso:");
		console.log("   Email:    isauyeferson.gm@gmail.com");
		console.log("   Password: Yeferson#0808");
		console.log("   Role:     Admin");
		console.log("\n🚀 Inicia el servidor con: bun run dev");
		console.log("📚 Documentación API: http://localhost:3007/swagger\n");
	} catch (error) {
		console.error("❌ Error al crear seed:", error);
		throw error;
	}
}

seed()
	.then(async () => {
		console.log("✅ Proceso completado");
		await prisma.$disconnect();
		process.exit(0);
	})
	.catch(async (error) => {
		console.error("❌ Error fatal:", error);
		await prisma.$disconnect();
		process.exit(1);
	});
