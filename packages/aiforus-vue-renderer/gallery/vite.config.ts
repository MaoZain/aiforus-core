import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  root: resolve(import.meta.dirname),
  plugins: [vue()],
  resolve: {
    alias: {
      '@aiforus/dsl': resolve(import.meta.dirname, '../../aiforus-dsl/src/index.ts'),
    },
  },
});
