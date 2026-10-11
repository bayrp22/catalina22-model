## Unreleased — Private equipment inventory overlay

- Added an optional local-only inventory drawer with JSON import/export, search, record editing and provisional 3D pins.
- Inventory records and boat-specific evidence are **not** checked into the public GitHub repository or deployed as site assets.
- Boat model geometry, accepted part IDs, hash baseline and dimensional specifications are unchanged.
- Added schema round-trip tests and offline viewer bundling support. Requires owner review and browser smoke checks before merging.

# Change log

## Deployment setup — 2026-10-09

- Published the documented source to the owner's GitHub repository through the native connector; all 32 uploaded source files matched local Git blob hashes.
- Confirmed the owner connected the Netlify project to GitHub on `main`.
- Pinned Node.js 24.19.0 in local validation, GitHub Actions and Netlify after Node 22 failed exact procedural geometry hashes remotely. Geometry code, accepted hashes and protected dimensions remain unchanged.
- Verification: local model and export checks passed. Browser/WebGL interaction verification and remote branch protection remain unperformed.

## 1.0.0 — 2026-10-09

- Preserved the accepted original-design interactive boat geometry.
- Added a repeatable Node/Python build and portable local development server.
- Added published-dimension locks and per-part accepted geometry signatures.
- Added geometry validation, controlled reviewed-baseline recording and artifact checks.
- Added usage, accuracy, editing and deployment guides, mandatory AGENTS.md rules, PR/change templates and a GitHub Actions validation workflow.
- Prepared Netlify configuration and created the empty project in SWS Ops. GitHub creation and the Git connection were pending owner setup at the initial handoff.
- Verification: geometry and package checks run locally. Browser/WebGL interaction verification and remote branch protection remain unperformed.
