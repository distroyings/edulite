import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    server: {
        host: true, // Allow external access
        allowedHosts: 'all', // Allow all hosts for tunneling services
        strictPort: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
})
