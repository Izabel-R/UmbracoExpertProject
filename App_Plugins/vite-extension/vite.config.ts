import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
    build: {
        lib: {
            entry: "src/vite-extension.ts", // your web component source file
            formats: ["es"],
            fileName: () => "vite-dashboard.js",
        },
        outDir: "dist",
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco-cms\//], // keep Umbraco/Lit externals out of your bundle
        },
    },
    define: {
        __APP_BUILD_TIME__: JSON.stringify(new Date().toISOString()),
        __APP_MODE__: JSON.stringify(mode),
    },
}));
