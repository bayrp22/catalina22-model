# Private equipment intake and placement

The Equipment inventory section accepts `catalina22-inventory-layer`, version 1, including the earlier restoration handoff. Actual equipment records, photos and private source links must never be committed to this public repository. The released app contains only generic code and a blank template. Inventory lives in memory in the current browser tab: there is no upload, server save, local-storage persistence or cross-device sync. Refreshing/closing loses changes; Export JSON first. Exported inventory may contain private information. Keep it in your own private storage. The existing GLB, source ZIP, offline viewer and saved-view JSON exclude runtime inventory. An offline viewer supports importing inventory separately.

## What to send next

A spreadsheet, JSON, text inventory, manuals, photographs or video can be reviewed for normalization. For each component supply whatever is known:

| Field | Required interpretation |
| --- | --- |
| Stable ID, name, brand, exact model/SKU, quantity | Separate variants and individual units with different locations |
| Installation state | Installed, planned, removed, spare, off-vessel, or unknown; distinguish proposals |
| Dimensions | External length/width/height, original units, source/model applicability and uncertainty; mounting holes, brackets and clearance envelopes separately |
| Mass | Measured or documented value/range, units, dry/wet condition, included accessories/fluids; per-unit versus combined set |
| Position/orientation | Physical datum, measured offsets, method, uncertainty and status; a narrated location is provisional |
| Mass center | Separately measured/documented/explicitly approximated position and basis; external box center is not automatically CG |
| Evidence/specifications | Source file/page/URL, full technical information and remaining verification tasks |

Missing measurements stay null. Keep conflicting sources and distinguish manufacturer information from a measured individual unit. Photos and video alone cannot establish scale without calibrated references. We can retain all supplied technical metadata even when placement or dimensions are not ready.

## Browser workflow

1. Choose Blank template, fill its example record or replace the catalog with your normalized records. Add record opens the same schema in a JSON editor. Unique IDs use letters/numbers, hyphens, dots or underscores. Quantity may be null when not known; never silently treat that as one.
2. Import JSON replaces the current inventory only after validation; export current work first. Failed imports retain the current data. Search by ID/name/model/system, select records and review their details. Edit record preserves other records and root metadata. Unknown metadata fields roundtrip without loss. The editor provides access to full specifications and source fields even if they are not summarized in the detail panel.
3. Equipment overlay is independent of the boat layers. Unknown locations remain unplaced. A supplied location gets a small amber marker; reviewed placement is green. Color records the supplied `reviewed` flag and does not authenticate a reviewer. Dimensioned boxes require all three positive dimensions, dimension basis/source, explicit rotation and a single item. Boxes are transparent envelope proxies, not detailed product meshes. A multi-unit record stays a marker; split units to render each device.
4. Select a visible equipment marker/box or its catalog entry and use Focus equipment. Boat orbit/zoom/pan/cutaway remain available. Surface-based drag placement and detailed device meshes are future work; edit explicit coordinates now. Do not assign a guessed position to make an unplaced item appear installed.
5. Check Include in this equipment load case only for records intended in that scenario. See the mass rules below. Export JSON after editing; imports/edits are not saved automatically. Clear tab removes in-memory records; downloaded files remain.

## Coordinate and size convention

Positions and sizes use meters. The fixed boat frame is +X toward the bow, +Y upward, +Z starboard; Y=0 nominal model waterline, X=0 model hull-length midpoint, Z=0 model centerline. This is a model frame, not a measured on-board datum. Establish actual reference landmarks and document the mapping before entering physical readings. Do not treat a drawing pixel/diagram coordinate as a meter reading.

`modelPlacement.positionMeters` is the envelope center in that fixed frame. `rotationRadians` is `[rx,ry,rz]` using Three.js XYZ Euler order. In the unrotated frame dimensions length, height, width map to X, Y, Z. A dimensioned envelope requires an explicitly supplied rotation, including `[0,0,0]` when aligned; missing rotation does not assume device orientation. `parentPartId` is descriptive only: the independent overlay does not attach to a moving galley/keel or inherit hidden boat layers. Positions do not change when boat parts move. Reconfirm placement when evaluating a different mechanism configuration.

The existing boat geometry is reconstructed between protected principal dimensions; importing a precisely sized equipment box does not validate its physical fit inside an unmeasured compartment. Brackets, shaft-length variants, terminals, cable bends, operating/service clearances and asymmetric shapes need separate evidence and later detailed modeling. No hull/interior geometry changes are authorized by inventory intake.

## Mass and distribution rules

`massKg` contains `min`, `max` and `basis`. Values describe either a single unit (`massScope: "per-unit"`) or the complete record (`"record-total"`). Multiple quantities require an explicit scope; unknown quantity excludes per-unit mass but permits explicitly stated record-total mass; avoid double-counting a kit and its components. Tanks, fuel, fresh water, people, spares and battery accessories must be explicit scenario records with their conditions. A battery capacity, displacement specification or engine horsepower does not supply its mass.

Calculation includes only checked records with equal positive min/max mass, nonempty mass basis, explicit `centerOfMassMeters: [x,y,z]` and nonempty `centerOfMassBasis`. Ranges, unknown masses and missing centers are excluded with reasons. No midpoint is substituted for a range and no box center is silently substituted for CG. For multiple units the stated mass center must represent the aggregate, or split records by unit. Estimates are allowed only with an honest basis and remain estimates; a calculated result has no higher physical certainty than its inputs.

For the qualifying subset, total mass is the sum of masses (multiplying per-unit mass by quantity); moments are the sum of mass × coordinate; mass center is each moment divided by total mass. Empty subsets report no mass center. The displayed result describes **only that subset of equipment**, not the entire vessel. The hull, ballast, original fittings, people and fluids are not supplied automatically. This release does not calculate hydrostatics, heel, trim, righting moments, stability, safe load or structural suitability. Whole-vessel assessment requires a verified complete mass model and appropriate specialist validation.

## Generic record example (unknown values)

```json
{
  "id": "ITEM-001",
  "name": "Equipment name",
  "system": "Electrical",
  "brand": "",
  "model": "",
  "quantity": 1,
  "observationState": "unconfirmed",
  "dimensionsMeters": {"length": null, "width": null, "height": null, "basis": "", "source": "", "uncertaintyMeters": null},
  "massKg": {"min": null, "max": null, "basis": ""},
  "massScope": "per-unit",
  "includedInLoadcase": false,
  "centerOfMassMeters": null,
  "centerOfMassBasis": "",
  "modelPlacement": {"parentPartId": null, "positionMeters": null, "rotationRadians": null, "status": "unplaced-or-unverified", "confidence": "unknown", "reviewed": false},
  "verificationNext": "Obtain dimensions, mass, datum and placement evidence"
}
```

Wrap records in a root object with `format: "catalina22-inventory-layer"`, `version: 1`, `units: "meters"`, `axes: "+X bow, +Y up, +Z starboard, Y=0 nominal waterline"` and `catalog: [...]`. Blank template supplies this wrapper. `placementProposals` and additional source/specification fields are retained verbatim but proposals are not rendered as installed equipment. Imports are limited to 1 MB/500 records; media remains separate. Finite coordinate components are bounded to ±100 m; physical envelope dimensions must be positive and ≤20 m. These software bounds are not boat-fit acceptance criteria.

## Contributor guardrails

Do not commit real inventory, source links, serials or private media. Do not place real records in `dist/` or model-data directories: both are public and packaged. This task adds separate runtime scene objects and does not modify `dist/model.js`, protected dimensions or geometry baseline. Use a branch and focused PR, retain geometry checks, run `npm run build`, and verify valid/invalid imports, edit/export/reimport, marker visibility, subset mass exclusion and offline imports. Automated import/mass tests are in `scripts/test-inventory.mjs`. Use authenticated review for actual geometry corrections; never rewrite the baseline to accept equipment.
