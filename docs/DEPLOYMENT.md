# Git and Netlify deployment

## Prepared configuration

Netlify builds with `npm run build` and publishes `dist`. Node **24.19.0** and Python 3.13 are configured in `netlify.toml`. GitHub Actions uses the same exact Node version. The accepted baseline was recorded under this runtime; Node 22 produced different procedural geometry hashes in the first remote validation. Keep the original baseline and use the pinned runtime. Runtime upgrades require a separately scoped comparison and review, rather than weakening hashes or automatically accepting new geometry. There is no server-side app, database, API key, paid add-on or CDN runtime dependency. Generated GLB/HTML/ZIP files are regenerated from the validated source during every build.

`.netlify/` is ignored. Never commit its local state or authentication material. `.openai/` is also omitted from this independent repository.

## Current external status

- Existing viewer: https://catalina-22-model-studio.bay627037.chatgpt.site
- Netlify project: `catalina22-model-studio`, team `SWS Ops`.
- Netlify project ID: `dbd9b24c-2337-4d25-89fe-1b3cb17c11fb`.
- Dashboard: https://app.netlify.com/projects/catalina22-model-studio
- Netlify URL: https://catalina22-model-studio.netlify.app
- Git continuous deployment: connected; production branch `main`.
- GitHub repository: https://github.com/bayrp22/catalina22-model, created by the owner as public; default branch `main`.

The owner permits native connector operations only and prohibits browser sign-in by coding agents. Use the native GitHub connector to publish changes and inspect build results with the native GitHub/Netlify connectors. The owner has completed the one-time Git connection in their own Netlify session. Do not work around the native-only restriction using agent-operated browser sign-in or new credentials.

## Connect continuous deployment

The repository has been initialized by the owner. For a fresh local checkout:

```bash
git clone https://github.com/bayrp22/catalina22-model.git
cd catalina22-model
npm run build
npm run dev
```

Coding agents must publish through the owner's authorized native GitHub connector. Owners may use their own authenticated Git workflow. Do not embed a token in a Git URL, command or tracked file. The original handoff bundle remains a separate backup; use this GitHub repository for the current deployment history.

The existing project is linked to `bayrp22/catalina22-model`. If restoring the connection, select this repository and `main` as the production branch, leave the base directory at the repository root, set build command `npm run build`, and publish directory `dist`. These build settings are also in `netlify.toml`. Netlify deploy previews should validate proposed branches before merge. This repository does not itself configure account-level settings.

For an owner-managed manual deploy, first run `npm run build`, then upload `dist` or use the Netlify CLI while authenticated in the owner's environment. A manual deploy does not run the build. If Git continuous deployment is connected, its next production-branch push will replace a manual production deployment; prefer publishing the exact reviewed commit through Git.

## Review enforcement

The included GitHub Actions workflow runs the `validate-model` job. Configure a branch ruleset for main requiring pull requests and the `validate-model` status check, and disallow force pushes/deletion. Use an appropriate human reviewer for geometry corrections. Protect baseline/dimension/guardrail edits through review.

These remote branch protections are recommended but have not been configured. GitHub plan restrictions may affect private-repository enforcement. A workflow file and AGENTS.md are not permission enforcement by themselves.

## Release and recovery

1. Start from the accepted baseline and make one scoped branch change.
2. Complete measured-change review if needed; pass `npm run build`.
3. Inspect a preview, merge the exact reviewed commit and verify deployment success.
4. Record release/commit IDs and testing limits in `CHANGELOG.md`.
5. If a published change is faulty, commit a revert, rebuild, and redeploy that corrected state. A failed deploy leaves the prior successful site live.
