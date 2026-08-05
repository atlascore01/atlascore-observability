import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    dts({
      include: ["src"],
      outDir: "dist",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "AtlasCore",
      formats: ["es", "umd"],
      fileName: (format) => `atlascore-web-sdk.${format}.js`,
    },
    rollupOptions: {
      // No externalizamos nada: el SDK debe ser auto-contenido
      // para poder cargarse como <script> en cualquier página
    },
    sourcemap: true,
    minify: false, // false en dev, lo habilitamos en release
    target: "es2020",
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
