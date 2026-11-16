## Unreleased — Simplified owner inventory and removed Systems page

- Replaced the import-first inventory screen with a populated, static list of 27 equipment/reference topics in six categories, each with manuals and verification notes.
- Removed all inventory JSON upload/export controls, status widgets, empty inspector panels and obsolete private-data client code.
- Deleted the Systems & Schematics route and removed its navigation and table-of-contents links.
- Kept the 3D viewer, its separate provisional propulsion shapes, mast setup and references intact.
- Protected owner-only photographs, serials, catalog IDs and exact locations from public source. Updated CI checks for simpler owner navigation.

## Unreleased — Cabin movement and VHF contrast

- Added full horizontal turning and a bounded cabin track from the companionway to the V-berth, with wheel and slider controls.
- Refined the VHF case, screen bezel, controls and speaker grille for contrast against the light cabin liner.

## Unreleased — Working lazarettes and cabin viewpoint

- Added one hinged hatch and an opening on the aft half of each cockpit bench. The port hatch reveals the fuel tank.
- Added a fixed seated **In cabin** viewpoint with limited drag-to-look. Saved views retain hatch states and cabin look direction.

## Unreleased — Photo-based stern hardware

- Added the stern cutout and transverse stainless bar, provisionally identified as a mainsheet traveler.
- Rebuilt the starboard boarding platform with slatted wood, stainless side rails and a lower tread.
- Modeled the port motor-board linkage and its range of motion, with synchronized motor and external fuel hose.

## Unreleased — Onboard restoration layout and equipment documentation

- Recessed the port forward cabin liner for the compact toilet and adjusted the galley stop so it stays partly under the cockpit.
- Closed modeled exterior seams at the forward cockpit and deck-to-sheer junctions.
- Linked all 27 inventory rows to selectable onboard geometry with placement notes, available specifications and manuals.

## Unreleased — Port lazarette, cabin entry cover and 3D navigation

- Moved the 12 L reference tank and inboard fuel line beneath the port lazarette. Added a cutaway shortcut to inspect them.
- Fitted a selectable cover below the companionway sill in the interactive viewer and current-view export.
- Applied the project navigation to the full-page 3D viewer and kept the standalone download self-contained.

## Unreleased — 3D auxiliary propulsion and retirement of 2D page

- Deleted `dist/project/plans/index.html` and removed the 2D Plans links, script and drawing preview styles.
- Added a selectable, inspectable, optional 3D propulsion assembly in `dist/propulsion.js`: provisional port stern motor bracket, generic 15 HP four-stroke outboard, manufacturer-reference 12 L portable tank and conceptual detachable fuel hose.
- Added a one-click port-stern view and included visible propulsion shapes in the current-view GLB export, leaving original boat-only GLB and accepted factory boat meshes unchanged.
- Updated Systems and Inventory/manuals with reference dimensions, motor/tank documents and explicit structural/fuel-storage warnings.
- Updated external private owner inventory separately; no private records or media are committed to GitHub.
- Expanded model and offline artifact CI checks. No physical installation or fuel location has been approved.

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
