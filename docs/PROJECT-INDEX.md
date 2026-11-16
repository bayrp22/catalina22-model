# Catalina 22 — Owner reference library

The owner-facing project index is at `/project/`. It contains **four independent destinations**:

| Destination | Path | Purpose |
| --- | --- | --- |
| Contents | `/project/` | Clean table of contents |
| 3D Model | `/` | Full-page viewer with shared project navigation and provisional fit-out details |
| Inventory & Manuals | `/project/inventory/` | Simple pre-populated catalogue of 28 equipment and reference topics with documentation links and what still needs checking |
| Mast & Sails | `/project/rigging/` | Factory rigging guidance, checks, Catalina 22-specific videos |
| References | `/project/references/` | Original factory and manufacturer source links |

The formerly requested **2D Plans**, **Systems & Schematics** and **Deliverables / Private Files** pages have all been deleted. There are no dead navigation links to them. `3D Model` opens the full-page viewer in the same project shell and highlights the active navigation link.

## Inventory page design

The equipment page intentionally opens already populated. There are **no** user-facing file pickers, JSON import/export actions, blank state, filters, dashboards or private evidence screens. Each item is one compact line with:
- manufacturer and model where known;
- the functional description;
- the main remaining verification issue;
- one or more externally hosted manuals, product guides or general manufacturer resources where available.

Items are organized under navigation/communications, electrical/power, engine/fuel, audio, rigging/sails/deck, and interior/fit-out. All known topics from the photo catalog and subsequent proposal review are represented; some assemblies and replacement candidates are listed separately. A line is a *technical reference*, not evidence of current installation.

Because this GitHub repository is **public**, the page includes public-facing product categories and already-discussed manufacturer references only. It does **not** contain the owner's separate private inventory JSON, photographs, frame timestamps, serials, exact 3D placements, unique IDs or vessel-specific weight records. No server upload or browser local storage is involved. The private detailed inventory still exists separately for restoration work.

## Viewer fit-out

`dist/propulsion.js` creates a provisional reference-scale outboard, external transom bracket, 12 L portable tank and illustrative fuel hose independent of the accepted hull mesh. The original 19-part model remains geometry-regression protected. The marked port lazarette location informs the new internal tank and hose placement. **Inspect port fuel locker** opens the port hatch to show the tank and inboard hose. The fuel hose inventory entry opens a cutaway of the route to the motor. The separate cabin entry cover closes the marked opening below the companionway sill. The current-view GLB includes these parts when visible. The original factory-layout GLB remains unchanged.

**Safety:** The 1977 Catalina 22 manual recommends 3–6 HP, while the reference outboard is Suzuki DF15A (15 HP). A real installation requires professional checking of transom strength, mount/bracket rating, fasteners, shaft height, tilting and rudder clearances. The illustrated fuel routing and compartment geometry remain provisional, including ventilation, restraint and the transom exit.

The restoration cabin uses the modeled inner shell to fit the V-berth perimeter. The cabin windows are framed surfaces visible from both inside and outside, and the speakers sit inboard of the deck liner. The galley’s **Fully deployed** stop clears the cockpit return. Travel and fit are based on the model envelope.

## Cockpit lazarettes and cabin viewpoint

Each bench has one outward-opening lid on its aft half. Click the lid in 3D or use **Port hatch** or **Starboard hatch** in the sidebar. **Inspect port fuel locker** opens the port lid and frames the tank inside the locker. The hatch outline and compartment geometry follow the supplied visual reference, with dimensions inferred.

**In cabin** starts at a seated viewpoint near the companionway. Scroll down or use the position slider to move forward along the bounded aisle track, ending beside the toilet in the V-berth. Drag for 360° horizontal turning and use **Look aft** to face the galley and companionway. **Reset view** returns to the starting position. Saved views retain both the position and look direction.

## Stern hardware and motion

The stern photos guide the boarding cutout, transverse rail and coiled fitting, starboard slatted boarding platform and port outboard bracket. The transverse bar resembles the original Catalina 22 mainsheet traveler. The backstay attachment on this boat is unconfirmed. **Inspect stern hardware** frames these parts. **Outboard lift** moves the paired links, keeps the wooden clamp board upright and carries the Suzuki model along with the external fuel connection. The photos show the raised pose. Lowered travel and hardware dimensions are inferred in model coordinates.

## Restoration equipment in 3D

Each of the 28 inventory rows links to its onboard item. Click on the model or use **Find onboard equipment** to inspect placement, available size and weight references, and manuals. Below-deck entries switch the viewer into the relevant interior or locker view. Loose equipment and unconfirmed mounting points use labeled illustrative placements. Published device masses and comparable listings are reference values and do not contribute to the private equipment load case.

The current-view export includes the restoration geometry and visible equipment. The factory-layout export remains the protected reference. The standalone viewer carries a copy of the same public documentation. Private inventory data and media remain outside both packages.

## Rigging references
- 1977 Catalina factory manual: https://www.catalina22.org/documents/files_pdf/1977-owner_manual.pdf
- 1987 Catalina manual: https://www.catalina22.org/documents/files_pdf/1987-owner_manual.pdf
- Catalina 22 mast stepping write-up: https://22catalina.com/2012/01/15/55/
- Mast demonstrations: https://www.youtube.com/watch?v=C5WdqdlB8Nc and https://www.youtube.com/watch?v=l81rwc6-8SM
- Sail setup example: https://www.youtube.com/watch?v=eiuZQyS6eXM

Video examples are supplemental and must not replace inspection of the actual mast-step, standing rigging, chainplates or weather/utility clearance.

## Review

Pinned Node 24.19.0 / Python 3 validation and Netlify preview checks must pass before release. The project index CI asserts that deleted routes are absent, manual list is present and has no uploads, the 3D model and propulsion overlay remain accessible and the rigging player still works. Browser and mobile visual review remain separate acceptance steps. Do not merge to production without owner review.
