# Upstream Provenance

## Frozen baseline

- Repository: `https://github.com/THU-MAIC/OpenMAIC`
- Commit: `d8a0081c7d229081301dfa5f21ccfd7ba93bda51`
- Commit timestamp: `2026-07-15T10:22:59Z`
- Upstream package: `@openmaic/dsl@0.4.0`
- Root and package license: MIT
- License SHA-256:
  `ba252563743227138231604c9138dd400faca5a10c3cf206b466e5466c565a19`

The baseline is immutable. Branch names, tags, npm dist-tags, and current
upstream `main` are not substitutes for this commit.

## DSL import map

All paths in this table are relative to their repository root. `Identity only`
means literal package references changed from `@openmaic/dsl` to
`@aiforus/dsl`; serialized names, discriminants, defaults, and logic did not
change. Every imported file is MIT-licensed at the frozen commit.

| Upstream path                                   | Local path                                     | Local changes                               |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| `packages/@openmaic/dsl/src/action.ts`          | `packages/aiforus-dsl/src/action.ts`           | Identity only                               |
| `packages/@openmaic/dsl/src/guards.ts`          | `packages/aiforus-dsl/src/guards.ts`           | None                                        |
| `packages/@openmaic/dsl/src/index.ts`           | `packages/aiforus-dsl/src/index.ts`            | Identity and AIForUs dependency-map comment |
| `packages/@openmaic/dsl/src/normalize.ts`       | `packages/aiforus-dsl/src/normalize.ts`        | Identity only                               |
| `packages/@openmaic/dsl/src/runtime.ts`         | `packages/aiforus-dsl/src/runtime.ts`          | None                                        |
| `packages/@openmaic/dsl/src/schema-roots.ts`    | `packages/aiforus-dsl/src/schema-roots.ts`     | None                                        |
| `packages/@openmaic/dsl/src/slides.ts`          | `packages/aiforus-dsl/src/slides.ts`           | Identity only                               |
| `packages/@openmaic/dsl/src/stage.ts`           | `packages/aiforus-dsl/src/stage.ts`            | Identity only                               |
| `packages/@openmaic/dsl/src/storage.ts`         | `packages/aiforus-dsl/src/storage.ts`          | None                                        |
| `packages/@openmaic/dsl/src/validate.ts`        | `packages/aiforus-dsl/src/validate.ts`         | Identity only                               |
| `packages/@openmaic/dsl/src/version.ts`         | `packages/aiforus-dsl/src/version.ts`          | Identity and repository formatting only     |
| `packages/@openmaic/dsl/test/normalize.test.ts` | `packages/aiforus-dsl/tests/normalize.test.ts` | Test import identity only                   |
| `packages/@openmaic/dsl/test/runtime.test.ts`   | `packages/aiforus-dsl/tests/runtime.test.ts`   | Test import identity only                   |
| `packages/@openmaic/dsl/test/schema.test.ts`    | `packages/aiforus-dsl/tests/schema.test.ts`    | Test import identity only                   |
| `packages/@openmaic/dsl/test/stage.test.ts`     | `packages/aiforus-dsl/tests/stage.test.ts`     | Test import identity only                   |
| `packages/@openmaic/dsl/test/validate.test.ts`  | `packages/aiforus-dsl/tests/validate.test.ts`  | Test import identity only                   |
| `packages/@openmaic/dsl/test/version.test.ts`   | `packages/aiforus-dsl/tests/version.test.ts`   | Test import identity only                   |
| `packages/@openmaic/dsl/scripts/gen-schema.mjs` | `packages/aiforus-dsl/scripts/gen-schema.mjs`  | Identity only                               |

Local-only package configuration, documentation, compatibility fixtures, and
conformance tests are not upstream imports. The upstream package manifest,
README, `.gitignore`, and build output were not copied.

## Frozen schema evidence

Both packages were built independently with TypeScript `5.9.3` and
`ts-json-schema-generator` `2.4.0`. Their generated files are byte-identical:

| Schema               | SHA-256                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `action.schema.json` | `e91b51f719f8d50b926d64e5d92ff62bb39f681f7bb5ba7a16a44769c1bcdae4` |
| `scene.schema.json`  | `d9606b57994b213df55c54b031c4c5f60fcb7427e07be2d6ef384dc93c25ca53` |
| `stage.schema.json`  | `4ca9543c8f9e5524590ec2e08c7b468ec5da16d38fcf3dba4d7adfc8423b26f0` |

Run `pnpm compare:upstream -- /absolute/path/to/OpenMAIC` against a built checkout
at the frozen commit to recheck imported files, schemas, exports, validators,
normalizers, migrations, and fixtures.

## Update policy

Upstream changes are never synchronized automatically. Every candidate update
must identify an exact commit and pass license, source-diff, compatibility,
visual, package-content, and clean-consumer review before manual adoption.
