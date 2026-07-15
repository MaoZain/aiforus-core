import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const dslEntry = fileURLToPath(new URL('./packages/aiforus-dsl/src/index.ts', import.meta.url));

export default defineConfig({
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
        test: {
          include: ['tests/**/*.test.ts'],
          name: 'aiforus-vue-renderer',
          root: './packages/aiforus-vue-renderer',
        },
      },
    ],
  },
});
