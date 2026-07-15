import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const approvedLicenses = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'ISC',
  'MIT',
  'MIT-0',
  'Python-2.0',
  'Unlicense',
]);

const auditedMetadataOverrides = new Map([
  [
    'spawndamnit@3.0.1',
    {
      expression: 'Unknown',
      licenseFile: 'LICENSE',
      licenseSha256: 'aac99045d4e36ab3b1e2914337620963b56cbac53de280c94f29261a22ab5b0f',
      resolvedLicense: 'MIT',
    },
  ],
]);

function hasAuditedOverride(expression, entry) {
  if (!Array.isArray(entry.versions) || entry.versions.length !== 1) return false;
  if (!Array.isArray(entry.paths) || entry.paths.length === 0) return false;

  const override = auditedMetadataOverrides.get(`${entry.name}@${entry.versions[0]}`);
  if (!override || override.expression !== expression) return false;

  return entry.paths.every((packagePath) => {
    const bytes = readFileSync(resolve(packagePath, override.licenseFile));
    const digest = createHash('sha256').update(bytes).digest('hex');
    return digest === override.licenseSha256 && approvedLicenses.has(override.resolvedLicense);
  });
}

function runAudit(label, args) {
  const result = spawnSync('pnpm', ['licenses', 'list', '--json', ...args], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    throw new Error(`Unable to read ${label} dependency licenses.`);
  }

  const output = result.stdout.trim();
  const report = output.startsWith('No licenses in packages found')
    ? {}
    : JSON.parse(output || '{}');
  const rejected = [];
  let dependencyCount = 0;

  for (const [expression, packages] of Object.entries(report)) {
    const entries = Array.isArray(packages) ? packages : [];
    dependencyCount += entries.length;

    const identifiers = expression
      .replace(/[()]/g, ' ')
      .split(/\s+(?:AND|OR)\s+/u)
      .map((value) => value.trim())
      .filter(Boolean);

    const expressionApproved =
      identifiers.length > 0 && identifiers.every((license) => approvedLicenses.has(license));
    const unauditedEntries = expressionApproved
      ? []
      : entries.filter((entry) => !hasAuditedOverride(expression, entry));

    if (!expressionApproved && unauditedEntries.length) {
      rejected.push({
        expression,
        packages: unauditedEntries.map((entry) => entry.name ?? 'unknown'),
      });
    }
  }

  if (rejected.length) {
    console.error(JSON.stringify({ label, rejected }, null, 2));
    throw new Error(`${label} dependencies include unapproved or unknown licenses.`);
  }

  console.log(`${label} license audit passed (${dependencyCount} dependency entries).`);
}

runAudit('production', ['--prod']);
runAudit('development', ['--dev']);
