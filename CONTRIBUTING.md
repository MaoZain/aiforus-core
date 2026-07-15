# Contributing

## Before making changes

1. Read `docs/compatibility.md` and `UPSTREAM.md`.
2. Create a focused branch from `main`.
3. Do not copy upstream files or assets without recording their exact source
   commit, path, and license.
4. Do not add runtime dependencies without a package-content and license
   review.

## Required checks

```bash
pnpm install --frozen-lockfile
pnpm verify:release
```

Package changes require a Changeset:

```bash
pnpm changeset
```

Commit generated lockfile and schema changes. Never commit `.env` files,
registry tokens, GitHub tokens, private keys, generated tarballs, or copied
assets without explicit redistribution evidence.
