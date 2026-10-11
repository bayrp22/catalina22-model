# Private inventory layer (v1)

The model viewer can open a **user-supplied local JSON inventory** without bundling actual boat records in this public repository. The accepted boat geometry remains untouched.

## Using the inventory panel

1. Open the 3D viewer and select **Inventory** in the header.
2. Select **Import JSON**, and choose a local file of format `catalina22-inventory-layer`, version `1`. The previously prepared private seed with `catalog` and `placementProposals` is supported.
3. Search records, inspect names/models and notes, and use **Place on visible boat** to put a *provisional* pin on a part of the model. First select Exterior/Open interior/Cutaway as needed, then click a visible boat surface.
4. Alternatively enter approximate coordinates in meters and select **Set XYZ (provisional)**. Coordinates refer to the model: +X bow, +Y up, +Z starboard, Y=0 nominal waterline.
5. Choose **Export JSON** after changing inventory. Upload that exported JSON to your collaborator/ChatGPT session for review or correction.

Pins display **only when the inventory panel is open**. Unplaced records appear in the list without a 3D pin. Camera/view JSON remains a separate export and cannot be used to restore inventory records. Existing GLB export contains only the boat's original geometry, not pins or inventory metadata.

## Privacy and storage

- No owner-specific equipment records, private photographs, serial numbers, Drive URLs or inventory JSON are included in Git or in Netlify build assets.
- The viewer imports local JSON using browser file APIs. No inventory file is uploaded, no backend/database exists and no server persistence is provided.
- Records remain in browser memory until refresh **unless** the user explicitly checks **Save a private copy on this device**; this uses unencrypted, origin-scoped `localStorage` and is unsuitable for shared/untrusted devices.
- Export JSON frequently, and store backups privately. Clearing browser site data may delete a local copy. Disabling persistence removes the stored copy, not previously exported files.
- The deployed site is password-gated at Netlify, but the repository is public. Never commit actual boat-specific JSON records; keep them in a private file or future independently secured backend.

## Data contract

```json
{
  "format": "catalina22-inventory-layer",
  "version": 1,
  "units": "meters",
  "catalog": [
    {
      "id": "EXAMPLE-001",
      "name": "Generic item",
      "modelPlacement": {
        "positionMeters": null,
        "status": "planned",
        "confidence": "unknown",
        "reviewed": false
      }
    }
  ],
  "placementProposals": []
}
```

Each item has an immutable ID. A position is a finite three-number model-space `positionMeters`, or `null`. Clicking a model surface also records `parentPartId` and `localPositionMeters` to follow that part when it moves in the viewer. Both are explicitly provisional; they do not prove actual installation or measurement. A status is not changed to “installed” automatically.

The editor preserves other imported attributes (product details, quantities, evidence references, weight ranges, etc.). Those fields may require external editorial review or updating in the exported JSON if not exposed in v1's basic inspector.

## Development and checks

Implementation: `dist/inventory-data.js` for pure schema validation and editing; `dist/inventory.js` for UI, scene overlay and local file operations; `dist/inventory.css` for scoped styling. Only `dist/app.js` initialization and `dist/index.html` stylesheet reference were extended.

Run `npm run build` with Node **24.19.0** and Python 3.13. The build runs inventory data tests and the unchanged model geometry-hash checks, then packages both inventory modules into the offline HTML. Open the site in a browser and test mobile, marker picking, file export/import, and airplane/offline-mode where possible. A passing automated build does not prove that a physical mounting coordinate is correct.

## Non-goals

No measured center of gravity or weight distribution, equipment proxies, automatic 3D dimension estimation, photo hosting, user accounts, cloud synchronization or modifications to factory-geometry baselines.
