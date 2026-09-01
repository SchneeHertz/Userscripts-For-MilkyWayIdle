import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { userscriptBundlePlugin } from "./scripts/vite-userscript-plugin.mjs";

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const sourceDirectory = path.join(projectDirectory, "src");
const outputFileName = "MWITools-Lite.user.js";
const installableOutputPath = path.join(projectDirectory, outputFileName);
const temporaryOutputDirectory = path.join(projectDirectory, "temp", "vite-build");

export default defineConfig({
    plugins: [userscriptBundlePlugin({ sourceDirectory, outputFileName, installableOutputPath })],
    build: {
        target: "es2020",
        outDir: temporaryOutputDirectory,
        emptyOutDir: false,
        copyPublicDir: false,
        minify: false,
        sourcemap: false,
        reportCompressedSize: false,
        lib: {
            entry: path.join(sourceDirectory, "vite-entry.ts"),
            name: "MWIToolsLite",
            formats: ["iife"],
            fileName: () => outputFileName,
        },
        rollupOptions: {
            treeshake: false,
            output: {
                entryFileNames: outputFileName,
                strict: true,
                topLevelVar: false,
            },
        },
    },
});
