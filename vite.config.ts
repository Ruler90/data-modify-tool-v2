import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
    },
    build: {
        lib: {
            entry: 'src/app.ts',
            formats: ['iife'],
            name: 'DataModifyTool',
            fileName: () => 'bookmarklet.js',
        },
        emptyOutDir: false,
        minify: 'terser',
        terserOptions: {
            format: {
                ascii_only: true,
                comments: false,
                preamble: 'javascript:',
            },
        },
        cssCodeSplit: false,
        rollupOptions: {
            treeshake: { moduleSideEffects: false },
            output: {
                assetFileNames: () => 'bookmarklet.css',
            },
        },
    },
});
