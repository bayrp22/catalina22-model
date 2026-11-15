# Catalina 22 — Multi-page project library

The owner-facing reference site is an independent multi-page project workspace. Its **table of contents** is at `/project/`. The original accepted Three.js model remains at `/`; clicking **3D Model** in the navigation uses a normal same-tab link directly to the full existing viewer, with no embedded iframe or launch dialog.

| Navigation | URL | Purpose |
| --- | --- | --- |
| Contents | `/project/` | Clean, clickable table of contents |
| 3D Model | `/` | Full-page existing Three.js model |
| 2D Plans | `/project/plans/` | Proportional overview and original Catalina manuals |
| Inventory | `/project/inventory/` | Private catalog importer, equipment dossiers, manufacturer manuals, outstanding checks |
| Systems | `/project/systems/` | Provisional 12V charging, distribution and fuel/propulsion concepts |
| Mast & Sails | `/project/rigging/` | Catalina 22 setup guidance, checklists and YouTube demonstrations |
| References | `/project/references/` | Original Catalina and manufacturer source library |

The previous embedded 3D model and the **Deliverables / Private Files** section have been removed. The existing 3D viewer links back to Contents and its optional fullscreen toggle is hidden; the viewer itself uses its complete standalone page.

## Private inventory and documentation

The Inventory page is deliberately blank until the owner opens the **separate private** `catalina22-inventory-layer` v1 JSON. It displays all catalog records and proposed elements, details, mass/placement information where documented, photo/video evidence labels, manual links and manufacturer references. It also renders the imported `outstanding` unresolved-check list, supports checking issues for further review, and exports the updated JSON locally. The current prepared private owner file has 20 photographed catalog entries, 4 distinct fit-out proposals and 14 open verification items; **none of these are embedded in Git or Netlify assets**.

Public code contains general manufacturer manual URLs as a reference desk, but no user-specific record IDs, positions, photographs, file IDs or serials. A manual link is not proof of installation or of compatibility with this hull. The fuel-tank model and Suzuki engine variant must be verified separately.

Privacy: imported JSON is handled in browser memory; there is no server fetch, storage API, form submission, backend, cloud persistence, or automatic localStorage. Changes must be exported before refresh. A Netlify site password does not protect a public GitHub repository; owner-specific records remain separate.

## Manuals and method references

- Catalina 1977: https://www.catalina22.org/documents/files_pdf/1977-owner_manual.pdf
- Catalina 1987: https://www.catalina22.org/documents/files_pdf/1987-owner_manual.pdf
- Catalina 22 mast stepping: https://22catalina.com/2012/01/15/55/
- C22 technical manual: https://www.catalina22.org/index.php/technical-manual
- Mast-raising videos: https://www.youtube.com/watch?v=C5WdqdlB8Nc and https://www.youtube.com/watch?v=l81rwc6-8SM
- Mainsail and jib example: https://www.youtube.com/watch?v=eiuZQyS6eXM
- Garmin UHD2 install: https://www8.garmin.com/manuals/webhelp/GUID-B4327979-40C0-487D-8117-A36D7AD0FA51/EN-US/ECHOMAP_UHD2_6_7_9xsv_%28Touch%29_Install_EN-US.pdf
- Renogy Rover Li: https://www.renogy.com/content/RNG-CTRL-RVR20/RVR203040-Manual.pdf
- Uniden UM725G: https://www.uniden.info/download/ompdf/UM725om.pdf
- Ritchie compass: https://www.ritchienavigation.com/compass-manuals-addendums/
- BOSS MR632UAB: https://bossaudio.com/collections/marine/products/791489124300
- Suzuki DF15A: https://www.suzukimarine.com/technical-manual-library/

**Sources and videos are references, not a hull-specific engineering approval.** Inspect mast-step, standing rigging, electrical conductors, battery charging hardware, engine/transom bracket and fuel storage before operation.

## Review / release

Run `npm run build` using pinned Node 24.19.0 and Python 3.13. `scripts/check-hub.mjs` asserts the page structure, no embedded 3D frame, direct 3D route, documentation links, local-only importer and source privacy. Browser smoke checks remain required:

1. Check home contents and each independent navigation route on desktop and mobile.
2. Click **3D Model** from any page; ensure full-page view and return via Contents without opening a new tab.
3. Import private JSON, verify record/proposal counts and per-item manuals and missing items.
4. Mark an unresolved item and export revised private JSON; confirm upload is not attempted.
5. Confirm the rigging YouTube player and original manual references, and inspect 2D/system disclaimers.
6. Confirm accepted boat geometry, slider interactions and original exports unchanged.

Do not merge without owner visual review. This is a documentation index, not an as-built, measured installation or a stability calculation.
