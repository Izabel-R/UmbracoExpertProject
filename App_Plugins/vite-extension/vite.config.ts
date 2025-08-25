import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/vite-insights.ts", // your web component source file
            formats: ["es"],
            fileName: "vite-insights"
        },
        outDir: "dist", // all compiled files will be placed here
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/], // ignore the Umbraco Backoffice package in the build
        },
    },
    base: "/App_Plugins/vite-extension/", // the base path of the app in the browser (used for assets)
});