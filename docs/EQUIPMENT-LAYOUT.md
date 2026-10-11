# Visible private equipment and mass coverage

The hosted viewer contains generic device renderers; it contains no owner's catalog, locations, evidence or weights. A private project link carries gzip-compressed version-1 inventory JSON in `#inventory=...`. The browser decodes it locally, validates it using the import schema and asks before replacing an existing working inventory. The fragment is not sent in the HTTP request. Anyone possessing the link can decode the records; keep the link private. Browser history and copied URLs may retain it. It is not encryption or an account access control.

Opening a prepared project link loads the records automatically, starts a port-aft exterior view and shows equipment labels with weights. The visible status button opens the Inventory drawer. Select a shape or label to inspect its complete record, size basis, mass basis and planned location. Use Focus equipment for close inspection. Switch to Interior or hide boat layers to inspect the inward-facing hardware. X-ray equipment starts enabled to expose devices inside opaque lockers; disable it for normal occlusion. Export JSON after edits. Local-device persistence is optional and unencrypted.

## Representation contract

`visualProxy` supplies a generic `kind`, positive bounded `dimensionsMeters` (`length` along local X, `height` along Y, `width` along Z), and mandatory `basis`. Supported kinds are battery, outboard, display, radio, switch-panel and dashboard. Device faces point along local -X; rotation `[0, Math.PI, 0]` turns the face toward +X. Shapes are simplified, recognizable proxies. Their mesh details are illustrative even when the outer envelope is documented.

Keep authoritative `dimensionsMeters` separate from the visual proxy dimensions. Never fill authoritative dimensions from a plausible-looking drawing, another SKU or an uncalibrated photo. A proxy of unknown size must say illustrative/unverified in its basis. Keep measured/documented values, units, source, accessories and uncertainties in the record. An envelope can be documented while its installation coordinate remains provisional. Visual fit in this reconstructed boat is not proof of fit in the physical boat.

Use `modelPlacement.positionMeters`, `rotationRadians`, `positionKind: "envelope-center"`, existing `parentPartId`, planned `status`, confidence, method and `reviewed: false` for a provisional layout. The base boat remains untouched. Moving an item by clicking a surface produces a location pin, since a clicked surface is not an envelope center. It never updates actual installation state, dimensions, mass or mass center. Known local anchors follow their host; fixed world coordinates do not.

Proposed replacement hardware belongs in `placementProposals`; preserve removed or off-boat catalog entries separately to prevent double counting. Do not invent an engine mounting side when the evidence only shows an engine on a stand. A side chosen for a review must be explicitly described as proposed/unconfirmed.

## Weight accounting and physical limits

Catalog coverage sums documented mass ranges using explicit quantities/mass scope, without averaging ranges or assuming unknown quantities. It reports unknown records and distinguishes all catalog equipment from equipment at planned coordinates. Catalog totals may include boxed, removed or off-boat equipment. Planned-coordinate subtotals are a fit-out scenario, not an installed load case. Proposals, including custom dashboard structure and replacement hardware, are excluded and must be weighed separately. Unknown weights are never silently set to zero.

Port/starboard/centerline allocation uses planned coordinates for known equipment weights only. It is a placement accounting aid, not a physical center of mass, hull balance, trim or stability result. The separate explicit mass-center load case still requires checked equipment, a documented positive point mass and a physical mass center/basis in the existing meter frame. No physical mass center is derived from proxy centers. Dry engine weights exclude any fluids, fuel tank, fuel and mount not covered by their basis. Whole-vessel weight also needs the boat/lightship basis and all omitted loads.

## Change and review guardrails

1. Back up the private JSON before changing it. Retain stable IDs, source evidence, observed states and original mass bases.
2. Modify only named equipment/proposals. Record why each position or dimension changed and whether it is measured, documented, reconstructed or illustrative.
3. Confirm actual mounting side, opening clearance, bracket envelope and access against physical measurements before claiming a fit or fabrication readiness.
4. Never substitute a nearby SKU's mass or a mesh centroid for a measured mass center. Identify omitted accessories explicitly.
5. Run `npm run build`. Device/proposal changes must leave all accepted boat hashes and principal dimensions unchanged. Generic test fixtures must never contain owner's inventory.
6. Check the private view in a desktop and touch browser: labels, X-ray toggle, both dashboard faces, battery locker, motor/rudder clearance, selection/focus, private export/re-import and device persistence. Automated checks do not prove WebGL rendering or physical accuracy.
7. Publish generic code on a branch/preview through authorized native GitHub/Netlify integrations. Do not commit project links, private files, evidence or owner-specific records, including in generated offline/source downloads. Release only after the owner reviews the visible layout and outstanding uncertainties.

The bounded fragment loader uses browser `DecompressionStream`; unsupported browsers can import the private JSON instead. Oversized, malformed or invalid data leaves the current working inventory intact. URL loading does not change production boat geometry or embed private records in GLB exports. The standalone viewer includes the generic loader and renderers.
