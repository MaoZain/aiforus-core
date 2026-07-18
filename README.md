# aiforus-core

`aiforus-core` is the independently maintained, MIT-licensed home of AIForUs
courseware contracts and Vue renderers.

Initial packages:

- `@aiforus/dsl`: OpenMAIC-compatible slide data contracts, schemas,
  normalizers, validators, and migrations.
- `@aiforus/vue-renderer`: a Vue 3 renderer for the slide contract and its
  playback actions.

The first stable slide packages are `@aiforus/dsl@0.1.0` and
`@aiforus/vue-renderer@0.1.0`. Their compatibility baseline is frozen to the
reviewed OpenMAIC commit documented in `UPSTREAM.md`; upstream changes are
adopted only through an explicit review and release.

## Development

Requirements:

- Node.js 22.14 or newer (the repository pins 22.16.0);
- pnpm 11 (the repository pins 11.7.0 through Corepack).

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm verify:release
```

See [compatibility](docs/compatibility.md), [release](docs/release.md), and
[upstream maintenance](docs/upstream-maintenance.md) before changing public
contracts or publishing packages.

## License

AIForUs-owned code is licensed under the MIT License. Code derived from
OpenMAIC retains its original notices and provenance. See `NOTICE`,
`UPSTREAM.md`, `THIRD_PARTY_NOTICES.md`, and `licenses/`.
