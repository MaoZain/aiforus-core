import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const expectedCommit = 'd8a0081c7d229081301dfa5f21ccfd7ba93bda51';
const upstreamArgument = process.argv[2];

if (!upstreamArgument) {
  console.error('Usage: pnpm compare:upstream -- /absolute/path/to/OpenMAIC');
  process.exit(2);
}

const upstream = resolve(upstreamArgument);
if (!existsSync(resolve(upstream, '.git'))) {
  throw new Error(`${upstream} is not a Git checkout.`);
}

const revision = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: upstream, encoding: 'utf8' });
if (revision.status !== 0) {
  process.stderr.write(revision.stderr);
  process.exit(revision.status ?? 1);
}

const actualCommit = revision.stdout.trim();
if (actualCommit !== expectedCommit) {
  throw new Error(`Expected OpenMAIC ${expectedCommit}, received ${actualCommit}.`);
}

console.log(`Verified frozen OpenMAIC checkout: ${actualCommit}`);
console.log('Phase-specific import scripts must compare only approved source paths.');
