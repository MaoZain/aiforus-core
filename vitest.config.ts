import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
    },
    projects: [
      {
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
