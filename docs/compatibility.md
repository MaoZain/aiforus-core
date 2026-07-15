# Compatibility Contract

## Slide packages

`@aiforus/dsl` will accept and preserve the serialized slide, element, stage,
scene, and action contract from the pinned OpenMAIC baseline. Compatibility is
defined at JSON and observable playback boundaries, not at framework component
APIs.

`@aiforus/vue-renderer` will be a Vue 3 implementation. It will not reproduce
the React component API of `@openmaic/renderer`.

The first compatibility implementation is frozen to OpenMAIC commit
`d8a0081c7d229081301dfa5f21ccfd7ba93bda51`. A future upstream version is not
adopted merely because it is newer.

## Package version status

`@aiforus/dsl@0.1.0-alpha.0` is the first frozen-contract implementation. It is
still unpublished until the clean-consumer and alpha release gates complete.
The renderer remains an unpublished `0.0.0` skeleton until Phase 3.

## Non-goals of the initial slide release

- React API compatibility;
- automatic upstream synchronization;
- Django or LLM generation inside npm packages;
- Quiz rendering;
- Deep Interactive runtime;
- copying the OpenMAIC application or unrelated workspace packages.
