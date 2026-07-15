# Third-Party Notices

## Distributed package dependencies

`@aiforus/dsl@0.1.0-alpha.0` has no runtime dependencies. Its contract source is
derived from `@openmaic/dsl@0.4.0` at commit
`d8a0081c7d229081301dfa5f21ccfd7ba93bda51` under MIT; the upstream notice is
preserved in the package LICENSE and repository `NOTICE`.

`@aiforus/vue-renderer@0.1.0-alpha.0` depends only on `@aiforus/dsl` at runtime
and declares Vue 3 as an MIT-licensed peer dependency. The renderer contains
no copied Vue source. Its behavior is informed by
`@openmaic/renderer@0.0.2` at the same frozen commit under MIT; attribution is
preserved in its package LICENSE and repository `NOTICE`.

The Vue renderer does not distribute OpenMAIC's bundled fonts, font license
files, ECharts, Shiki, KaTeX, Motion, React, `html-to-image`, or
`html2canvas-pro`. Charts, code blocks, formula fallback, effects, and
snapshots use package-local browser primitives or explicit consumer adapters.

No fonts, icons, example media, fixtures, gallery files, or binary resources
are distributed in either package tarball. Compatibility fixtures remain
test-only.

## Development tooling

Development-only tools are not included in package tarballs. Their licenses
are checked from the lockfile by `pnpm verify:licenses`. Permissive non-MIT
development-tool licenses do not relicense the published packages.

Explicit development-only reviews:

- `@csstools/color-helpers@6.1.0` and
  `@csstools/css-syntax-patches-for-csstree@1.1.6`: MIT-0, indirect jsdom CSS
  parsing dependencies; not distributed at runtime;
- `minimatch@10.2.5`: BlueOak-1.0.0, license file SHA-256
  `2c7c5d22ed5a8ee968c64757710979afcd77438c48b4a265b94e615babd8a901`;
- `spawndamnit@3.0.1`: package metadata does not expose a standard SPDX value,
  but its bundled license is MIT, verified at SHA-256
  `aac99045d4e36ab3b1e2914337620963b56cbac53de280c94f29261a22ab5b0f`.

Before every stable release, regenerate the production dependency inventory
and add the full notices for any newly distributed Apache-2.0, BSD, ISC, or
other approved permissive dependency.
