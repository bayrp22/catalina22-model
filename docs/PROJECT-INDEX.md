# Catalina 22 Project Index — release handoff

The public generic project hub is served at **/project/** on the same Netlify site as the existing Three.js viewer. The viewer root **/** remains unchanged except for a link to the index. The home page doesn't switch to the hub until the owner approves.

## Modules
- Embedded existing 3D viewer and link to its full-window interface.
- A **proportional concept 2D plan** with explicit reconstruction caveats and links to the 1977/1987 Catalina factory manuals.
- Locally selected plan image (the earlier private annotated v02 PNG/SVG).
- Proposed 12 V electrical architecture and fuel/engine conceptual diagrams — explicitly unverified and not construction documentation.
- Mast-stepping and sail-setup research with a two-choice YouTube iframe player and direct watch fallback, plus a ten-item field checklist.
- Private owner report PDF opened with the browser's local File API; no upload/persistence.
- Links to original manuals, class association technical compendium, equipment manufacturer support and source repository.

## Privacy
Do **not** commit owner-specific photo files, 2D annotated layout with private equipment locations, the private inventory JSON, the owner report, private Drive IDs or measurements to this public repository. The hub does not send locally opened files to any service or store them. Object URLs are scoped to the current page and are revoked when a file is replaced.

Note that Netlify's visitor-password control applies to site visitors but **does not** make files safe to commit to a public GitHub repository. An eventually completed owner bundle should be kept separately in private document storage and, if published, served by a genuinely access-controlled private document service.

## Sources and review constraints
- 1977 Catalina 22 manual: https://www.catalina22.org/documents/files_pdf/1977-owner_manual.pdf
- 1987 Catalina 22 manual: https://www.catalina22.org/documents/files_pdf/1987-owner_manual.pdf
- Mast stepping written reference: https://22catalina.com/2012/01/15/55/
- C22 class technical manual: https://www.catalina22.org/index.php/technical-manual
- Two independent Catalina 22 mast-raising demonstrations: https://www.youtube.com/watch?v=C5WdqdlB8Nc and https://www.youtube.com/watch?v=l81rwc6-8SM

**Factory documents take precedence over informal videos**. Do not use the manual or video in place of inspecting this hull's mast-step/tabernacle, rigging, chainplates, hardware and nearby electrical hazards. The actual year and modifications are unknown. The mast, shrouds, stays, headsail hardware and sail condition must be inspected before setup.

The 2D plan is illustrative, not a Catalina factory CAD file. Electrical/fuel schematics are conceptual and still lack circuit schedules, battery charging decisions, fuel storage verification, outboard bracket ratings and sign-offs. No full-scale CG/stability claim is made.

## Verification
Run `npm run build` with pinned Node 24.19.0. `scripts/check-hub.mjs` verifies presence of expected sections and privacy controls but does not exercise WebGL or external YouTube embeds.

For visual review on the Deploy Preview:
1. Load `/project/` at desktop and mobile widths, navigate anchor sections and open root viewer.
2. Confirm the iframe shows the original model and the full viewer remains usable.
3. Select an external video, confirm playback or use the YouTube fallback; video availability/embedding is controlled by the video owners.
4. Import a local PDF and annotated 2D image; verify these files aren't uploaded and no persistent copies appear in the repository.
5. Print the field checklist and review the rigging, inventory and fuel warnings.
6. Confirm no owner-specific equipment records or private images have been committed to public GitHub or packaged in `dist`.

Do not merge before the owner reviews the hub and the mast setup advice.
