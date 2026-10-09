# Using the model

## Camera

| Action | Mouse / keyboard | Touch |
| --- | --- | --- |
| Rotate | Left-drag | One-finger drag |
| Zoom | Scroll or + / − buttons | Pinch |
| Pan | Right-drag | Two-finger drag |
| Fit visible model | Fit button or F | Fit button |
| Inspect part | Click geometry or a label | Tap geometry or label |
| Clear selection / isolation | Escape or inspector close | Inspector close |

`3D` uses a perspective camera. Top, port, starboard, bow and stern use orthographic views. Dragging after an axis view lets you rotate away from that view. Fit includes the visible rig if you turn it on.

## Visibility

- Exterior restores the deck, cabin and roof.
- Open interior removes the deck, cabin, roof and hardware to expose the arrangement from above.
- Cutaway also removes the starboard upper hull. It is a visualization cut, not a physical modification.
- Layer switches toggle structural/furniture groups. Labels, grid, dimension guides and wireframe are display options.
- Reset restores the current mode's layers, lowers the keel, brings the galley into the cabin and fits the model.

Keys 1, 2 and 3 select exterior, open interior and cutaway respectively.

## Part inspection

Click a part to highlight it and read its basis/limitations. Focus moves the camera close to the selected part. Isolate temporarily hides all other parts; Show whole boat restores prior visibility. Hide removes the selected part until its layer is restored. Model bounds shown in the inspector are generated mesh extents, not independently measured component dimensions.

## Moving parts

The keel slider interpolates an inferred pivoting blade between the published nominal raised and lowered keel drafts. The modeled pivot and blade outline are provisional. The slider is illustrative and is not an operational instruction for the boat.

The galley slider moves the optional aft-starboard galley toward its under-cockpit stow position. Its footprint, travel and clearances need boat-specific measurements. Slider percentage does not establish mechanism clearance.

## Export and save

| Export | Contents |
| --- | --- |
| Complete GLB | All named model parts, keel lowered, full scale in meters |
| Current visible GLB | Only visible parts at their current positions |
| Offline HTML | Standalone interactive viewer; no server or CDN required |
| Source ZIP | Editable source, documentation and generated GLB/offline viewer |
| View JSON | Camera, layer visibility, mode, keel/galley values and display settings |

View JSON does not contain geometry edits. Import it through Restore saved view. A JSON exported by the earlier 2D Layout Studio is a different format and must not be imported as a 3D view.

For Blender, import the GLB through File → Import → glTF 2.0. Preserve scale and coordinate conventions. Editing only the GLB does not update the web viewer: durable changes belong in `dist/model.js` and must follow the repository editing rules.

The viewer needs WebGL 2. If it fails to render, use a current browser with hardware acceleration and consult browser console messages. Do not assume that a file download proves the viewer rendered correctly.
