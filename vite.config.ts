import { defineConfig } from "vite"

export default defineConfig({
    resolve: {
        alias: {
            framer: new URL(
                "./src/framer-preview-shim.ts",
                import.meta.url
            ).pathname,
        },
    },
})
