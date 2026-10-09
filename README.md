# Catalina 22 — Model Studio

An interactive, full-scale Three.js study of the original Catalina 22 arrangement. Rotate and zoom the boat, reveal the interior, inspect named parts, move the swing keel and galley, and export the model.

The accepted boat geometry is preserved. This repository adds reproducible builds, documentation, per-part geometry regression checks and contributor instructions.

## Start locally

Requires Node.js 22+ and Python 3. No npm dependencies need to be downloaded: Three.js r169 and its modules are vendored.

```bash
npm run build
npm run dev
```

Open http://localhost:8000 . The server binds to your own computer. For an offline copy, open `dist/downloads/Catalina22_Viewer_Offline.html` directly in a modern WebGL 2 browser.

## Documentation

| Guide | Purpose |
| --- | --- |
| [Using the viewer](docs/USING.md) | Camera, layers, selection, moving parts and exports |
| [Editing carefully](docs/EDITING.md) | Scope, measurement workflow, code locations and release checks |
| [Accuracy and measurements](docs/ACCURACY.md) | Published dimensions, inferred geometry and measurement records |
| [Netlify and Git](docs/DEPLOYMENT.md) | Build configuration, review workflow, deployment and recovery |
| [Contributor/agent rules](AGENTS.md) | Mandatory guardrails for people and coding agents |
| [Change log](CHANGELOG.md) | Baseline and subsequent releases |

## Files and ownership

- `dist/model.js`: authoritative model geometry, parts, materials and coordinate conventions.
- `dist/app.js`: viewer interactions. `dist/index.html` and `dist/style.css`: interface.
- `dist/vendor/`: pinned Three.js r169 dependencies and MIT license.
- `model-data/published-dimensions.json`: protected principal dimensions and provenance.
- `model-data/accepted-geometry.json`: accepted per-part geometry hashes.
- `scripts/`: development server, validation, baseline recording and artifact checks.
- `export-model.mjs` and `package.py`: reproducible GLB, offline HTML and source ZIP generation.
- `netlify.toml`: `npm run build`, publish `dist`.

Generated downloads are ignored by Git and rebuilt at deployment. There are 19 stable component groups, 104 meshes and 80,809 triangles in the current model. The GLB uses meters: +X bow, +Y up, +Z starboard; Y=0 nominal waterline.

## Accuracy

Hull length, beam, nominal waterline, keel draft endpoints and mast length use the scanned 1977 factory brochure. Hull surfaces and interior dimensions are reconstructed. Exact year, keel configuration and alterations of the actual boat remain unconfirmed. Numerical regression tolerances validate code output, not manufacturing accuracy.

Read [accuracy notes](docs/ACCURACY.md) before using the model to make a restoration decision.

## Change workflow

For a viewer or documentation change, geometry hashes must stay identical. For a measured boat correction, document the evidence and exact affected parts, inspect the proposed change, obtain real review, then intentionally update the accepted baseline. Run `npm run build` before merging or publishing.

See [editing instructions](docs/EDITING.md). The baseline mechanism catches accidental changes; it is not an access-control system. Remote branch protections must also be configured to enforce review.

## Deployment status

The original viewer remains at https://catalina-22-model-studio.bay627037.chatgpt.site .

Source repository: [bayrp22/catalina22-model](https://github.com/bayrp22/catalina22-model), default branch `main`. The owner created this repository as public; personal boat media and credentials are excluded.

The Netlify project [catalina22-model-studio](https://app.netlify.com/projects/catalina22-model-studio) exists in `SWS Ops`. Its first deployment is pending the owner's Git connection. Select this repository, production branch `main`, build command `npm run build`, and publish directory `dist`, with the repository root as the base directory. Browser-based sign-in by coding agents is prohibited by the owner; use authorized native connectors for subsequent repository operations.
