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

Manual publishing requires an explicit `dist_tag` workflow input. Use `alpha`
for the current integration series, `next` for a later release candidate, and
`latest` only for a reviewed stable version. Changesets owns versioning and
changelogs, while `scripts/publish-artifacts.mjs` publishes the exact tarballs
produced by `verify:packages` with the selected tag. The script rejects a
prerelease sent to `latest`, supports safe reruns, and verifies the selected
tag plus SLSA provenance after publication. It never relies on npm's default
tag.

## npm Trusted Publishing

The repository uses `.github/workflows/release.yml` with GitHub OIDC
`id-token: write`; no long-lived npm write token belongs in repository secrets.
Trusted publishing requires npm CLI 11.5.1 or newer and Node 22.14 or newer.

Before OIDC publishing can be enabled for a package, that package must exist in
npm and its Trusted Publisher must be configured to match exactly:

- GitHub owner: `MaoZain`;
- repository: `aiforus-core`;
- workflow: `release.yml`.

The initial `0.1.0-alpha.0` package publication was a controlled bootstrap
operation performed with an npm owner session. It used the `alpha` tag and did
not claim CI provenance. Configure Trusted Publishing for both packages before
the next version, then use only the manual `publish` input of `release.yml` for
subsequent publishes. Do not store the bootstrap credential.

The public registry requires every package document to have a `latest` key.
The bootstrap publication therefore exposed `latest -> 0.1.0-alpha.0`, and
Changesets moved it to `0.1.0-alpha.1` because neither package had a regular
release. npm rejects removing the package's only `latest` key. The reviewed
`0.1.0` stable release replaces that temporary prerelease target. The custom
artifact publisher rejects prereleases directed to `latest`, so future
prerelease channels continue to advance independently.

Trusted Publishing automatically creates provenance for public packages from
this public GitHub repository.

After a successful OIDC publication, change each package's Publishing access
to "Require two-factor authentication and disallow tokens", then revoke the
temporary bootstrap token.
