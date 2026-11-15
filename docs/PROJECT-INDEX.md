# Catalina 22 — Multi-page project library

The owner-facing reference site is an independent multi-page project workspace. Its **table of contents** is at `/project/`. The original accepted Three.js model remains at `/`; clicking **3D Model** in the navigation uses a normal same-tab link directly to the full existing viewer, with no embedded iframe or launch dialog.

| Navigation | URL | Purpose |
| --- | --- | --- |
| Contents | `/project/` | Clean, clickable table of contents |
| 3D Model | `/` | Full-page existing Three.js model |
| Inventory | `/project/inventory/` | Private catalog importer, equipment dossiers, manufacturer manuals, outstanding checks |
| Systems | `/project/systems/` | Provisional 12V charging, distribution and fuel/propulsion concepts |
| Mast & Sails | `/project/rigging/` | Catalina 22 setup guidance, checklists and YouTube demonstrations |
| References | `/project/references/` | Original Catalina and manufacturer source library |

The previous embedded 3D model, the **2D Plans** page (including its route and navigation) and the **Deliverables / Private Files** section have been removed. The existing 3D viewer links back to Contents and its optional fullscreen toggle is hidden; the viewer itself uses its complete standalone page.

## Private inventory and documentation

The Inventory page is deliberately blank until the owner opens the **separate private** `catalina22-inventory-layer` v1 JSON. It displays all catalog records and proposed elements, details, mass/placement information where documented, photo/video evidence labels, manual links and manufacturer references. It also renders the imported `outstanding` unresolved-check list, supports checking issues for further review, and exports the updated JSON locally. The separately updated private owner file has 20 photographed catalog entries, 6 fit-out proposals (including the reference tank and external bracket) and 15 open verification items; **none of these are embedded in Git or Netlify assets**.

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

## Auxiliary propulsion — model and drawing coverage

The 3D model now includes **four independent provisional scene groups** in `dist/propulsion.js`: transom mounting bracket/clamp board, generic 15 HP outboard, an approximately manufacturer-sized 12 L portable fuel tank and an illustrative hose. They are separately selectable and togglable through **Auxiliary propulsion · proposed**. A stern-focus control reveals them from the port side. The original accepted 19-part Catalina hull geometry, accepted hashes, original boat GLB and model-data dimensions are unchanged; the visible-view GLB export now adds the auxiliary groups, and the offline viewer bundles the additional JavaScript module.

The engine family is represented with a documented overall reference envelope of ~662 × 336 × 1,220 mm (long-shaft example), and a **44–49 kg dry-weight range** across starting/shaft variants. No actual engine mass center is claimed. The reference portable tank is 12 L and ~363 × 265 × 230 mm, an OEM-compatible style; its actual presence, connector and safe location are unverified. The tank is shown on the aft port cockpit seat only for scale review, not as an approved stowage arrangement. Bracket plate geometry and hose routing are purely illustrative.

**Important:** the 1977 Catalina 22 manual recommends 3–6 HP; the documented 15 HP engine must not be treated as compatible until the actual transom structure and bracket rating are inspected by a qualified marine professional. Manufacturer instructions and safe fuel storage/ventilation govern. The engine is photographed off-vessel, and this 3D model does not assert installation.

Original sources: https://www.globalsuzuki.com/marine/lineup/df20a-15a-9_9b/index.html ; https://www.suzuki.ca/product/fuel-tank/ ; https://www.catalina22.org/documents/files_pdf/1977-owner_manual.pdf . The owner-specific manufacturer/part records are maintained in separate exported JSON, not the public repository.
