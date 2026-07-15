# @aiforus/dsl

Dependency-free courseware contracts compatible with the frozen OpenMAIC DSL
baseline. The package contains TypeScript types, JSON Schemas, validators,
normalizers, discriminant guards, and version/migration helpers. Rendering and
LLM generation are deliberately outside this package.

## Compatibility baseline

- Upstream: `THU-MAIC/OpenMAIC`
- Commit: `d8a0081c7d229081301dfa5f21ccfd7ba93bda51`
- Upstream package: `@openmaic/dsl@0.4.0`
- Serialized `DSL_VERSION`: `0.1.0`
- License: MIT

The AIForUs package version is independent of both the OpenMAIC package version
and the serialized DSL version. Upstream updates are reviewed and imported
manually; they are never synchronized automatically.

## Usage

```ts
import {
  DSL_VERSION,
  normalizeScene,
  validateAction,
  validateScene,
  type Action,
  type Scene,
  type Slide,
} from '@aiforus/dsl';
```

Static JSON Schemas are included for non-TypeScript producers such as the
AIForUs Django backend:

```ts
import stageSchema from '@aiforus/dsl/schema/stage.schema.json' with { type: 'json' };
import sceneSchema from '@aiforus/dsl/schema/scene.schema.json' with { type: 'json' };
import actionSchema from '@aiforus/dsl/schema/action.schema.json' with { type: 'json' };
```

The published schema roots are `Stage`, the default serialized `slide | quiz`
`Scene`, and `Action`. Application-specific Deep Interactive and PBL content is
composed through the generic `Scene<TAction, TContent>` extension point. It is
not added to the frozen slide/quiz schema and does not introduce an
`InteractiveArtifact` type into this package.

## Contract guarantees

- no runtime dependencies;
- serialized field names, discriminants, defaults, action payloads, and schema
  roots match the pinned OpenMAIC baseline;
- `SceneType` remains `slide | quiz | interactive | pbl`;
- slide elements cover text, image, shape, line, chart, table, LaTeX, video,
  audio, and code;
- normalizers are pure and validators do not mutate input;
- generated schemas are deterministic and pinned by compatibility hashes.

## Development

Use Node `22.16.0` (the repository `.node-version`) and pnpm `11.7.0`:

```bash
pnpm --filter @aiforus/dsl typecheck
pnpm test --project aiforus-dsl
pnpm --filter @aiforus/dsl build
```

This alpha package remains unpublished until the reviewed Phase 4 release after
the Vue renderer reaches its own compatibility gate.

## Attribution

The contract implementation is derived from OpenMAIC under the MIT License.
The package `LICENSE` preserves both the upstream and AIForUs copyright notices;
repository-level details are recorded in `UPSTREAM.md` and `NOTICE`.
