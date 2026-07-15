import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

import { format, resolveConfig } from 'prettier';

const expectedCommit = 'd8a0081c7d229081301dfa5f21ccfd7ba93bda51';
const upstreamArgument = process.argv.slice(2).find((argument) => argument !== '--');
const localRoot = resolve(import.meta.dirname, '..');

if (!upstreamArgument) {
  console.error('Usage: pnpm compare:upstream -- /absolute/path/to/OpenMAIC');
  process.exit(2);
}

const upstreamRoot = resolve(upstreamArgument);
if (!existsSync(resolve(upstreamRoot, '.git'))) {
  throw new Error(`${upstreamRoot} is not a Git checkout.`);
}

const revision = spawnSync('git', ['rev-parse', 'HEAD'], {
  cwd: upstreamRoot,
  encoding: 'utf8',
});
if (revision.status !== 0) {
  process.stderr.write(revision.stderr);
  process.exit(revision.status ?? 1);
}

const actualCommit = revision.stdout.trim();
assert.equal(actualCommit, expectedCommit, 'OpenMAIC checkout does not match the frozen commit');

const upstreamPackage = resolve(upstreamRoot, 'packages/@openmaic/dsl');
const localPackage = resolve(localRoot, 'packages/aiforus-dsl');
const prettierConfig = (await resolveConfig(localRoot)) ?? {};

const regularFiles = (directory, suffix) =>
  readdirSync(directory)
    .filter((name) => name.endsWith(suffix))
    .sort();

const normalizeIdentity = async (content, name) => {
  const renamed = content.replaceAll('@openmaic/dsl', '@aiforus/dsl');
  const comparable =
    name === 'index.ts'
      ? // The local index has an AIForUs dependency-map comment. Public exports
        // from the first export statement onward must remain equivalent.
        renamed.slice(renamed.indexOf("export * from './slides.js';"))
      : renamed;
  return format(comparable, {
    ...prettierConfig,
    parser: name.endsWith('.ts') ? 'typescript' : 'babel',
  });
};

let comparedFiles = 0;
for (const name of regularFiles(resolve(upstreamPackage, 'src'), '.ts')) {
  const upstream = await normalizeIdentity(
    readFileSync(resolve(upstreamPackage, 'src', name), 'utf8'),
    name,
  );
  const local = await normalizeIdentity(
    readFileSync(resolve(localPackage, 'src', name), 'utf8'),
    name,
  );
  assert.equal(local, upstream, `source drift: src/${name}`);
  comparedFiles += 1;
}

for (const name of regularFiles(resolve(upstreamPackage, 'test'), '.ts')) {
  const upstream = await normalizeIdentity(
    readFileSync(resolve(upstreamPackage, 'test', name), 'utf8'),
    name,
  );
  const local = await normalizeIdentity(
    readFileSync(resolve(localPackage, 'tests', name), 'utf8'),
    name,
  );
  assert.equal(local, upstream, `test drift: test/${name}`);
  comparedFiles += 1;
}

const upstreamGenerator = await normalizeIdentity(
  readFileSync(resolve(upstreamPackage, 'scripts/gen-schema.mjs'), 'utf8'),
  'gen-schema.mjs',
);
const localGenerator = await normalizeIdentity(
  readFileSync(resolve(localPackage, 'scripts/gen-schema.mjs'), 'utf8'),
  'gen-schema.mjs',
);
assert.equal(localGenerator, upstreamGenerator, 'schema generator drift');
comparedFiles += 1;

const localManifest = JSON.parse(readFileSync(resolve(localPackage, 'package.json'), 'utf8'));
assert.equal(
  localManifest.dependencies,
  undefined,
  '@aiforus/dsl must have zero runtime dependencies',
);

const localSource = regularFiles(resolve(localPackage, 'src'), '.ts')
  .map((name) => readFileSync(resolve(localPackage, 'src', name), 'utf8'))
  .join('\n');
assert.equal(
  localSource.includes('InteractiveArtifact'),
  false,
  'InteractiveArtifact must remain application-side',
);

const schemaNames = ['action.schema.json', 'scene.schema.json', 'stage.schema.json'];
for (const name of schemaNames) {
  const upstreamPath = resolve(upstreamPackage, 'dist/schema', name);
  const localPath = resolve(localPackage, 'dist/schema', name);
  if (!existsSync(upstreamPath) || !existsSync(localPath)) {
    throw new Error(`Build both DSL packages before comparison; missing dist/schema/${name}.`);
  }
  assert.deepEqual(readFileSync(localPath), readFileSync(upstreamPath), `schema drift: ${name}`);
}

const upstreamDsl = await import(pathToFileURL(resolve(upstreamPackage, 'dist/index.js')).href);
const localDsl = await import(pathToFileURL(resolve(localPackage, 'dist/index.js')).href);
assert.deepEqual(
  Object.keys(localDsl).sort(),
  Object.keys(upstreamDsl).sort(),
  'public export drift',
);

const fixture = (name) => JSON.parse(readFileSync(resolve(localPackage, 'fixtures', name), 'utf8'));
const stage = fixture('openmaic-d8a0081-stage.json');
const scenes = [
  fixture('openmaic-d8a0081-slide-scene.json'),
  fixture('openmaic-d8a0081-quiz-scene.json'),
];

assert.deepEqual(localDsl.validateStage(stage), upstreamDsl.validateStage(stage));
for (const scene of scenes) {
  assert.deepEqual(localDsl.validateScene(scene), upstreamDsl.validateScene(scene));
  assert.deepEqual(localDsl.normalizeScene(scene), upstreamDsl.normalizeScene(scene));
  assert.deepEqual(localDsl.migrate(scene), upstreamDsl.migrate(scene));
}

console.log(`Verified frozen OpenMAIC checkout: ${actualCommit}`);
console.log(`Verified ${comparedFiles} imported source/test files after package-identity mapping.`);
console.log('Verified schemas, public exports, fixtures, validators, normalizers, and migrations.');
