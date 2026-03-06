import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      exclude: ['src/dev/**'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VueMarkdownEditor',
    },
    rollupOptions: {
      external: ['vue'],
      output: [
        {
          format: 'es',
          entryFileNames: 'index.es.js',
          exports: 'named',
          globals: { vue: 'Vue' },
        },
        {
          format: 'cjs',
          entryFileNames: 'index.cjs',
          exports: 'named',
          globals: { vue: 'Vue' },
        },
      ],
    },
    cssCodeSplit: false,
  },
})
