/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./test/setup.ts"],
		include: ["test/**/*.{test,spec}.{js,ts}", "e2e/**/*.{test,spec}.{js,ts}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"dist/",
				"coverage/",
				"**/*.d.ts",
				"**/*.d.js",
				"test/",
				"e2e/",
				"prisma/",
			],
		},
	},
	resolve: {
		alias: {
			"#configs": new URL("./src/configs", import.meta.url).pathname,
			"#controllers": new URL("./src/controllers", import.meta.url).pathname,
			"#middlewares": new URL("./src/middlewares", import.meta.url).pathname,
			"#routes": new URL("./src/routes", import.meta.url).pathname,
			"#services": new URL("./src/services", import.meta.url).pathname,
			"#interfaces": new URL("./src/interfaces", import.meta.url).pathname,
			"#types": new URL("./src/types", import.meta.url).pathname,
			"#utils": new URL("./src/utils", import.meta.url).pathname,
			"#validators": new URL("./src/validators", import.meta.url).pathname,
		},
	},
});
