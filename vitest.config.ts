import { fileURLToPath } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

const dslEntry = fileURLToPath(new URL('./packages/aiforus-dsl/src/index.ts', import.meta.url));

export default defineConfig({
  plugins: [vue()],
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
    projects: [
      {
        resolve: {
          alias: {
            '@aiforus/dsl': dslEntry,
          },
        },
        test: {
          include: ['tests/**/*.test.ts'],
          name: 'aiforus-dsl',
          root: './packages/aiforus-dsl',
        },
      },
      {
        plugins: [vue()],
        resolve: {
          alias: {
            '@aiforus/dsl': dslEntry,
          },
        },
        test: {
          environment: 'jsdom',
          include: ['tests/**/*.test.ts'],
          name: 'aiforus-vue-renderer',
          root: './packages/aiforus-vue-renderer',
        },
      },
    ],
  },
});
