# Compatibility Contract

## Slide packages

`@aiforus/dsl` will accept and preserve the serialized slide, element, stage,
scene, and action contract from the pinned OpenMAIC baseline. Compatibility is
defined at JSON and observable playback boundaries, not at framework component
APIs.

`@aiforus/vue-renderer@0.1.0-alpha.0` is the first Vue 3 implementation. It
renders the frozen Slide element contract, executes Slide effects/actions, and
exposes explicit host adapters. It does not reproduce the React component API
of `@openmaic/renderer`.

The first compatibility implementation is frozen to OpenMAIC commit
`d8a0081c7d229081301dfa5f21ccfd7ba93bda51`. A future upstream version is not
adopted merely because it is newer.

## Package version status

`@aiforus/dsl@0.1.0-alpha.0` is the first frozen-contract implementation. It is
still unpublished until the alpha publication is explicitly approved.
`@aiforus/vue-renderer@0.1.0-alpha.0` is likewise release-ready only after the
Phase 3 clean-consumer and repository gates pass.

## Non-goals of the initial slide release

- React API compatibility;
- automatic upstream synchronization;
- Django or LLM generation inside npm packages;
- Quiz rendering;
- Deep Interactive runtime;
- copying the OpenMAIC application or unrelated workspace packages.

The detailed renderer matrix and the deliberate Vue/runtime substitutions are
recorded in `docs/renderer-compatibility.md`.
