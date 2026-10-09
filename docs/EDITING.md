# Editing the model carefully

Read `AGENTS.md` first. The goal is to improve a specific, documented part while preserving accepted geometry elsewhere.

## 1. Classify the change

| Type | Files normally edited | Geometry baseline |
| --- | --- | --- |
| Wording/docs | Markdown, `dist/index.html`, metadata text | Must remain identical |
| Styling/layout | `dist/style.css`, `dist/index.html` | Must remain identical |
| Camera/interactions | `dist/app.js` | Must remain identical |
| Materials | Materials in `dist/model.js` | Geometry must remain identical; inspect exports |
| Measured part correction | The specific part block in `dist/model.js` | Reviewed record required |
| Hull/reference-vessel change | `SPEC`, stations or principal dimensions | Owner must explicitly approve a new reference and evidence; not a routine edit |

Do not restructure geometry functions during an unrelated task. A cleanup that changes floating-point vertices or parenting is a model change even if it appears visually similar.

## 2. Establish evidence before a geometry edit

Record the actual boat's year/hull/keel configuration if known. Identify the stable part ID and the exact attribute being changed: for example bulkhead fore/aft position or berth-platform height.

Use a named reference origin and record the measurement method and uncertainty. Convert to meters once. Keep both original units and converted value in the evidence. Perspective photographs may explain placement but cannot supply accurate dimensions without a calibrated reference. The 2D restoration layout's diagram units are not centimeters.

Useful correction records include a measured distance from the aft face of the companionway to the bulkhead, platform height relative to a fixed cabin datum, or beam measured at a specific station. Do not combine measurements taken from different datums without an explicit transformation.

## 3. Make one focused change

Create a branch, then change only the specified geometry block. The current model constructs meshes directly; no separate UI geometry editor is provided. Keep part IDs, units, axis conventions and parent transforms stable.

| Part ID | Content |
| --- | --- |
| `hull` | Shell and transom; drawing-derived stations and inferred sections |
| `deck`, `trim` | Deck surfaces and hardware |
| `cabin`, `roof` | Cabin trunk/windows and removable roof |
| `cockpit` | Footwell, seats and locker lids |
| `sole`, `vberth`, `bulkheads` | Cabin floor, forward berth and partial bulkheads |
| `dinette`, `table`, `settee` | Port dinette, table and starboard berth |
| `galley` | Sliding galley geometry |
| `trunk`, `companionway` | Keel housing and cabin-entry step |
| `cushions` | Optional cushions |
| `keel`, `rudder`, `rig` | Appendages and mast/boom/standing rigging |

`part(...)` creates a named group and metadata; `mesh(...)` creates selectable geometry. `box`, `polygon`, `panel` and `tube` are helper constructors. World coordinates use meters. The keel is under `keelPivot`; the moving galley offset is applied by `setGalley()` in `dist/app.js`. Update labels only when their affected part moves. Do not globally scale the root, move unrelated parts, or distort the hull to accommodate one fitting.

Berth bases are tapered to the inferred inner hull envelope. Changes to hull stations can therefore affect multiple interior parts; the per-part hashes must disclose every resulting change. This dependency must not be hidden by a bulk baseline update.

## 4. Inspect before accepting

Run `npm run validate`. A deliberate geometry change should initially fail on the affected part hash. Review the actual model and create `changes/<descriptive-name>.json` using `changes/TEMPLATE.json` as a schema example. Do not leave the template's placeholders as evidence or review.

The record must identify exactly all changed parts, evidence references, before/after meter measurements, datum, method, confidence and the actual reviewer. Once review really occurred:

```bash
npm run baseline:record -- --change changes/<reviewed-change>.json
npm run build
```

Recording rejects unlisted geometry changes, changes to principal dimensions, and changed component IDs. This is a deliberate acceptance operation, not a normal build step. Never run it automatically in CI or to silence an unexplained failure. No script can verify that a named person actually reviewed a change; repository review rules must enforce that human step.

## 5. Release checks

Automated build checks syntax, protected principal dimensions, shell envelopes, finite geometry/normals, valid indices, stable IDs, all 101 keel slider values, budgets, accepted per-part geometry hashes, GLB structure and offline packaging.

Manually verify:

- Exterior, open interior and cutaway from top, both sides, bow and stern.
- Orbit, zoom, pan, fit, selecting labels/geometry, focus, hide, isolate and restore.
- All layer switches; rig visible and hidden; raw and cushioned arrangement.
- Keel at both endpoints and intermediate positions; galley in/stowed; nearby intersections.
- Full and current-visible GLB imports, named groups, scale and orientation.
- Offline HTML and saved-view JSON round trip.
- Desktop and phone/touch usability, or document an unperformed check.

Checks do not solve hydrostatics, stability, physical mechanism clearance, watertightness or structural strength. Write measured confidence separately from numerical code tolerances.

Update accuracy notes and `CHANGELOG.md`, include evidence and review in the PR, and publish only the validated commit. For a faulty published change, use a focused revert commit and rebuild; do not overwrite release history.
