# Release Process

## Required gates

Every release candidate must pass:

```bash
pnpm install --frozen-lockfile
pnpm verify:release
```

Review the generated `.artifacts/*.tgz` files and confirm that only `dist`,
`README.md`, `LICENSE`, and the packed `package.json` are present.

## Changesets

Package changes require `pnpm changeset`. Merging the Changesets version pull
request updates versions and changelogs. Stable versions are published only
from reviewed commits after all phase-specific gates pass.

## npm Trusted Publishing

The repository uses `.github/workflows/release.yml` with GitHub OIDC
`id-token: write`; no long-lived npm write token belongs in repository secrets.
Trusted publishing requires npm CLI 11.5.1 or newer and Node 22.14 or newer.

Before OIDC publishing can be enabled for a package, that package must exist in
npm and its Trusted Publisher must be configured to match exactly:

- GitHub owner: `MaoZain`;
- repository: `aiforus-core`;
- workflow: `release.yml`.

The initial package publication is therefore a controlled bootstrap operation
performed in the later alpha-release phase with an interactive npm owner
session. Immediately afterward, configure Trusted Publishing for both packages
and use only the manual `publish` input of `release.yml` for subsequent
publishes. Do not store the bootstrap credential.

Trusted Publishing automatically creates provenance for public packages from
this public GitHub repository.
