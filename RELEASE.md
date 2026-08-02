# Release process

## Source of truth

- `CHANGELOG.md` is the source for user-facing release notes.
- `extension/manifest.json` contains the version of a real release, without the `v` prefix.
- A Git tag `vX.Y.Z` marks the exact commit released as manifest version `X.Y.Z`.
- GitHub Releases are the official source of packaged ZIP files. Do not create new release ZIP files in `docs/publication/`.

## Preparing a release

1. Keep unreleased user-facing changes under `### Unreleased` in `CHANGELOG.md`.
2. When ready to release, rename that section to `### X.Y.Z` and review its text. Each bullet should describe a user-visible change.
3. Set `extension/manifest.json` to the same `X.Y.Z` version.
4. Run the complete browser test suite from the repository root: `./tests/run-tests.sh`.
5. Optionally build and inspect a local ZIP with the central builder before publishing.
6. Commit the release preparation, push `main`, and create an annotated tag `vX.Y.Z` on that commit.
7. Push the tag. GitHub Actions validates the tag, manifest, and CHANGELOG, runs the browser tests, builds `element-copier.zip`, and publishes the GitHub Release.

The Release title is the tag. Its body is copied from the matching `CHANGELOG.md` section; do not edit release notes separately on GitHub.

## Distribution

The stable download URL is:

`https://github.com/md2it/element-copier/releases/latest/download/element-copier.zip`

It always points to the ZIP asset of the latest published GitHub Release. Store links remain the primary installation path for ordinary users.

## Local package check

To build a ZIP locally without changing this repository, run the central builder from its sibling repository:

```sh
cd ../browser-extension-ci-cd
npm ci
npm run build:extension -- \
  --extension-root ../element-copier/extension \
  --output-zip /tmp/element-copier.zip
```

The builder creates a temporary staging copy, minifies it, and writes the ZIP. It does not modify the extension source.

## Store automation

The tagged release uses central CI/CD `v1.5.0`. After GitHub Release creation, it uses the same ZIP for the configured stores.

### Required configuration

- Repository variables: `STORE_UPLOAD_ENABLED`, `STORE_PUBLISH_ENABLED`, `CHROME_EXTENSION_ID`, `CHROME_PUBLISHER_ID`, and `AMO_ADDON_ID`.
- Repository secrets: `CHROME_SERVICE_ACCOUNT_JSON`, `AMO_JWT_ISSUER`, and `AMO_JWT_SECRET`.
- The repository workflow passes the two enablement values to central CI/CD. A store operation runs only when its corresponding repository variable and workflow input are both `true`.

### Automated outcome

- With upload enabled, the workflow uploads the package to Chrome Web Store and validates it; it also uploads and validates the package in AMO.
- With publish enabled as well, Chrome is submitted for review and the validated AMO upload is submitted as a listed version.
- A successful workflow means GitHub Release creation and store submission completed. It does not mean that a store has already made the version available to users: Chrome and AMO may still require review, signing, or processing.

## Verifying a release

1. Confirm that the workflow for `vX.Y.Z` completed successfully, including all configured store jobs.
2. Confirm that the GitHub Release is published, not a draft, and contains `element-copier.zip`.
3. Confirm the package manifest version matches the tag version.
4. Check Chrome Web Store and Firefox Add-ons separately for their review or publication status.
