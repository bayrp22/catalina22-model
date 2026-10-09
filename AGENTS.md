# Mandatory instructions for contributors and coding agents

These rules preserve the boat model accepted by the owner. The owner's explicit current instructions take precedence. Read this file and `docs/EDITING.md` before making any change.

1. Scope each change. Hosting, documentation, styling, camera and UI tasks must leave all geometry unchanged. Do not opportunistically improve, simplify, smooth or redesign the hull, interior or layout.
2. Work in meters using the existing axes: +X bow, +Y up, +Z starboard; Y=0 nominal waterline. Keep component IDs and parenting stable. Do not apply a global rescale or transform to make a local part fit.
3. Keep `SPEC` and `model-data/published-dimensions.json` unchanged unless the owner explicitly changes the reference vessel/model and supplies authoritative dimensional evidence. `baseline:record` deliberately cannot override these dimensions.
4. Preserve the accepted geometry in `model-data/accepted-geometry.json`. A geometry change is incomplete until its affected parts, measurements, datum, method, uncertainty, evidence and review are recorded under `changes/`. Never rewrite a baseline solely to make a test pass.
5. Do not claim review occurred or invent a reviewer. Record a replacement baseline only after the actual reviewer has inspected the proposed change. If authorized evidence already exists in the task, use it; do not ask again for authorization already given.
6. Change only the named affected parts. Use the per-part hash checks to confirm unrelated parts remain unchanged. Preserve both keel endpoint drafts, original arrangement, selection/layers, GLB exports and saved-view compatibility.
7. Classify unmeasured dimensions as reconstructed/provisional. Photos without a calibrated reference and the earlier layout's diagram coordinates do not establish physical dimensions. Never invent measurements, installed equipment, weight distribution, strength or stability claims.
8. Do not edit generated GLB/HTML/ZIP artifacts directly. Regenerate with `npm run build`. Do not edit vendored Three.js files without an explicitly scoped dependency upgrade.
9. Before release, run `npm run build` and the manual checks in `docs/EDITING.md`. Report checks that could not be performed; automated geometry checks are not proof of real-boat accuracy or browser behavior.
10. Use a branch and a focused pull request for future changes. Include evidence for geometry edits. Do not weaken tests, remove evidence requirements, force-push main or silently change access/visibility to complete a task.
11. Keep credentials, `.netlify/`, `.openai/`, runtime environment files and personal boat media out of Git and downloadable source archives. Only use the owner's authorized integrations; do not use browser sign-in for GitHub or Netlify.
12. On a bad published release, fix forward using a revert commit, then validate and redeploy. Do not mutate an old release or bypass failed checks.

Current accepted baseline: initial interactive original-design model, 2026-10-09. It is a reconstruction, not a surveyed digital twin.
