## Unreleased — Multi-page project library and private inventory documentation

- Replaced the previous single-page overview with a concise table of contents and independent pages.
- Routed **3D Model** directly to the accepted full-page viewer in the same tab, removed the embedded preview and hidden the redundant fullscreen control.
- Removed the owner-irrelevant Deliverables / Private Files section.
- Added dedicated 2D Plans, Inventory & Manuals, Systems & Schematics, Mast & Sails, and References routes.
- Added an in-memory private JSON inventory dossier with 20 recorded devices/assemblies, 4 proposed fit-out elements and 14 owner-only verification checks in the separately supplied private file; no actual boat data committed.
- Linked verified public manufacturer manual sources and retained the mast-raising/sail-setup video library.
- Extended CI checks for navigation, privacy boundaries and project-library script syntax. Accepted geometry remains unchanged.

# Change log

## 2026-10-11 — Private inventory intake preparation

- Added a separate runtime-only equipment overlay, searchable catalog, record editor and private JSON import/export/template. No actual inventory was published.
- Added documented dimensions/placement proxies and explicit subset mass moments with unknown/range/quantity guards.
- Preserved all accepted boat geometry and existing model export behavior; offline packaging includes the new generic modules.
- Added intake/measurement/privacy documentation and automated inventory validation tests.

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
