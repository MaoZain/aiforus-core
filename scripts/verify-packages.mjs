import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const artifactDirectory = resolve(root, '.artifacts');
const packages = [
  {
    directory: 'packages/aiforus-dsl',
    name: '@aiforus/dsl',
    required: ['LICENSE', 'README.md', 'dist/index.d.ts', 'dist/index.js', 'package.json'],
  },
  {
    directory: 'packages/aiforus-vue-renderer',
    name: '@aiforus/vue-renderer',
    required: ['LICENSE', 'README.md', 'dist/index.d.ts', 'dist/index.js', 'package.json'],
  },
];

rmSync(artifactDirectory, { force: true, recursive: true });
mkdirSync(artifactDirectory, { recursive: true });

for (const packageDefinition of packages) {
  const packageDirectory = resolve(root, packageDefinition.directory);
  const manifest = JSON.parse(readFileSync(resolve(packageDirectory, 'package.json'), 'utf8'));

  if (manifest.name !== packageDefinition.name || manifest.license !== 'MIT') {
    throw new Error(`Invalid identity or license for ${packageDefinition.directory}.`);
  }
  if (manifest.private === true || manifest.publishConfig?.access !== 'public') {
    throw new Error(`${packageDefinition.name} is not configured for public publication.`);
  }
  if (manifest.repository?.url !== 'git+https://github.com/MaoZain/aiforus-core.git') {
    throw new Error(`${packageDefinition.name} has an invalid provenance repository URL.`);
  }

  const result = spawnSync('pnpm', ['pack', '--json', '--pack-destination', artifactDirectory], {
    cwd: packageDirectory,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    throw new Error(`Unable to pack ${packageDefinition.name}.`);
  }

  const packed = JSON.parse(result.stdout);
  const details = Array.isArray(packed) ? packed[0] : packed;
  const files = (details.files ?? []).map((file) => (typeof file === 'string' ? file : file.path));
  const unexpected = files.filter(
    (file) =>
      file !== 'LICENSE' &&
      file !== 'README.md' &&
      file !== 'package.json' &&
      !file.startsWith('dist/'),
  );
  const missing = packageDefinition.required.filter((file) => !files.includes(file));

  if (unexpected.length || missing.length) {
    console.error(
      JSON.stringify({ name: packageDefinition.name, files, missing, unexpected }, null, 2),
    );
    throw new Error(`Unsafe package contents for ${packageDefinition.name}.`);
  }

  console.log(`${packageDefinition.name} package contents verified (${files.length} files).`);
}
