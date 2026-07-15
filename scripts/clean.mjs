import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const targets = [
  '.artifacts',
  'coverage',
  'packages/aiforus-dsl/dist',
  'packages/aiforus-vue-renderer/dist',
];

for (const target of targets) {
  rmSync(resolve(root, target), { force: true, recursive: true });
}
