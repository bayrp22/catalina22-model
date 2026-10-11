// Private inventory document format. No boat-specific records are shipped with this app.
export const INVENTORY_FORMAT = 'catalina22-inventory-layer';
const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const validVector = v => v === null || (Array.isArray(v) && v.length === 3 && v.every(n => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) <= 100));
export function validateInventory(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source) || source.format !== INVENTORY_FORMAT || source.version !== 1) throw Error('Not a Catalina 22 inventory layer v1 file.');
  if (!Array.isArray(source.catalog) || !Array.isArray(source.placementProposals || [])) throw Error('Inventory catalog/proposals must be lists.');
  const proposals = source.placementProposals || [];
  if (source.catalog.length + proposals.length > 1500) throw Error('Too many inventory records (limit 1500).');
  const seen = new Set();
  for (const [entry, proposal] of [...source.catalog.map(x=>[x,false]),...proposals.map(x=>[x,true])]) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof entry.id !== 'string' || !ID.test(entry.id)) throw Error('Invalid or missing inventory ID.');
    if (seen.has(entry.id)) throw Error('Duplicate inventory ID: ' + entry.id);
    seen.add(entry.id);
    if (typeof (proposal ? entry.label : entry.name) !== 'string') throw Error('Missing item name: ' + entry.id);
    const placement = proposal ? entry : (entry.modelPlacement || {});
    if (placement.positionMeters !== undefined && !validVector(placement.positionMeters)) throw Error('Invalid coordinates for ' + entry.id);
    if (placement.localPositionMeters !== undefined && !validVector(placement.localPositionMeters)) throw Error('Invalid local anchor for ' + entry.id);
    if (placement.parentPartId != null && typeof placement.parentPartId !== 'string') throw Error('Invalid host part for ' + entry.id);
  }
  return JSON.parse(JSON.stringify(source));
}
export function rows(document) {
  return [...document.catalog.map((entry) => ({id:entry.id,entry,proposal:false,placement:entry.modelPlacement || {}})),
          ...(document.placementProposals || []).map(entry => ({id:entry.id,entry,proposal:true,placement:entry}))];
}
export function findRecord(document,id) {return rows(document).find(item => item.id === id) || null;}
export function editRecord(document,id,apply) {
  const next = validateInventory(document);
  const found = findRecord(next,id);
  if (!found) throw Error('Record not found: ' + id);
  apply(found.entry,found.placement,found.proposal);
  return validateInventory(next);
}
export function newInventory() {
  return {format:INVENTORY_FORMAT,version:1,units:'meters',axes:'+X bow, +Y up, +Z starboard, Y=0 nominal waterline',
    privacy:'Private working file; do not publish in the public repository.',
    catalog:[],placementProposals:[]};
}
