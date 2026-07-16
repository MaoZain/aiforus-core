import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const root = resolve(import.meta.dirname, '..');
const artifactDirectory = resolve(root, '.artifacts');
const registry = 'https://registry.npmjs.org';
const packages = ['packages/aiforus-dsl', 'packages/aiforus-vue-renderer'];
const allowedTags = new Set(['alpha', 'next', 'latest']);

function readOption(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function artifactName(name, version) {
  return `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`;
}

async function readPackument(name) {
  const response = await fetch(`${registry}/${encodeURIComponent(name)}`, {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
  });
  if (response.status === 404) return undefined;
  if (!response.ok) throw new Error(`Unable to read npm metadata for ${name}: ${response.status}.`);
  return response.json();
}

function verifyPublishedVersion(packument, name, version, tag) {
  const published = packument?.versions?.[version];
  if (!published) return false;
  if (packument['dist-tags']?.[tag] !== version) {
    throw new Error(`${name}@${version} exists, but ${tag} does not point to it.`);
  }
  if (
    published.dist?.attestations?.provenance?.predicateType !== 'https://slsa.dev/provenance/v1'
  ) {
    throw new Error(`${name}@${version} is missing npm SLSA provenance.`);
  }
  return true;
}

const tag = readOption('--tag');
const dryRun = process.argv.includes('--dry-run');

if (!tag || !allowedTags.has(tag)) {
  throw new Error('Pass exactly one supported release tag with --tag alpha|next|latest.');
}

for (const directory of packages) {
  const manifest = JSON.parse(readFileSync(resolve(root, directory, 'package.json'), 'utf8'));
  const { name, version } = manifest;
  if (version.includes('-') && tag === 'latest') {
    throw new Error(`Refusing to publish prerelease ${name}@${version} under latest.`);
  }

  const tarball = resolve(artifactDirectory, artifactName(name, version));
  if (!existsSync(tarball)) throw new Error(`Missing verified package artifact: ${tarball}.`);

  const existing = await readPackument(name);
  if (verifyPublishedVersion(existing, name, version, tag)) {
    console.log(`${name}@${version} is already published with ${tag} and provenance; skipping.`);
    continue;
  }
  if (dryRun) {
    console.log(`[dry-run] npm publish ${tarball} --tag ${tag} --access public`);
    continue;
  }

  const result = spawnSync('npm', ['publish', tarball, '--tag', tag, '--access', 'public'], {
    cwd: root,
    stdio: 'inherit',
  });
  if (result.status !== 0) throw new Error(`Unable to publish ${name}@${version}.`);

  let verified = false;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    if (attempt > 0) await delay(3000);
    const packument = await readPackument(name);
    if (verifyPublishedVersion(packument, name, version, tag)) {
      verified = true;
      break;
    }
  }
  if (!verified) throw new Error(`npm did not expose ${name}@${version} after publication.`);
  console.log(`${name}@${version} published with ${tag} and SLSA provenance.`);
}
