# Third-Party Notices

## Distributed package dependencies

`@aiforus/dsl@0.0.0` has no runtime dependencies.

`@aiforus/vue-renderer@0.0.0` depends on the workspace DSL package and declares
Vue 3 as an MIT-licensed peer dependency. The renderer contains no copied Vue
source.

No fonts, icons, example media, generated assets, or binary resources are
distributed in the Phase 1 package skeletons.

## Development tooling

Development-only tools are not included in package tarballs. Their licenses
are checked from the lockfile by `pnpm verify:licenses`. Permissive non-MIT
development-tool licenses do not relicense the published packages.

Explicit development-only reviews:

- `minimatch@10.2.5`: BlueOak-1.0.0, license file SHA-256
  `2c7c5d22ed5a8ee968c64757710979afcd77438c48b4a265b94e615babd8a901`;
- `spawndamnit@3.0.1`: package metadata does not expose a standard SPDX value,
  but its bundled license is MIT, verified at SHA-256
  `aac99045d4e36ab3b1e2914337620963b56cbac53de280c94f29261a22ab5b0f`.

Before every stable release, regenerate the production dependency inventory
and add the full notices for any newly distributed Apache-2.0, BSD, ISC, or
other approved permissive dependency.
