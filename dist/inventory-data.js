// Private inventory documents are supplied at runtime, never bundled with the boat.
export const FORMAT = 'catalina22-inventory-layer';
export const AXES = '+X bow, +Y up, +Z starboard, Y=0 nominal waterline';
export const MAX_BYTES = 1000000;
const EQUIPMENT_KINDS=['battery','outboard','display','radio','switch-panel','dashboard'];
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const number = v => typeof v === 'number' && Number.isFinite(v);
const vector = v => Array.isArray(v) && v.length === 3 && v.every(n => number(n) && Math.abs(n) <= 100);
const fail = message => { throw new Error(message); };
function checkUnsafeKeys(value) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) fail('Unsafe key: ' + key);
    checkUnsafeKeys(child);
  }
}
export function validateInventory(doc, partIds = null) {
  if (!object(doc) || doc.format !== FORMAT || doc.version !== 1) fail('Expected a version 1 inventory-layer JSON.');
  if (doc.units !== 'meters' || doc.axes !== AXES) fail('Use the documented meter coordinate frame. Convert source units first.');
  if (!Array.isArray(doc.catalog) || doc.catalog.length > 500) fail('Catalog must be an array of at most 500 records.');
  checkUnsafeKeys(doc);
  if (doc.placementProposals != null && !Array.isArray(doc.placementProposals)) fail('placementProposals must be an array.');
  if (doc.catalog.length + (doc.placementProposals || []).length > 500) fail('Maximum 500 combined records/proposals.');
  const ids = new Set();
  for (const row of inventoryRows(doc)) {
    const {entry:item, proposal} = row;
    if (!object(item)) fail('Each catalog entry must be an object.');
    const label = item.id || 'Record';
    if (typeof item.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/.test(item.id) || ids.has(item.id)) fail('IDs must be unique, short letters/numbers/hyphens.');
    ids.add(item.id);
    const name = proposal ? item.label : item.name;
    if (typeof name !== 'string' || !name.trim() || name.length > 500) fail(label + ': provide a name.');
    if (item.quantity != null && (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000)) fail(label + ': quantity must be null (unknown) or 1–1000.');
    if (item.includedInLoadcase != null && typeof item.includedInLoadcase !== 'boolean') fail(label + ': includedInLoadcase must be boolean.');
    const m = item.massKg;
    if (m != null) {
      if (!object(m)) fail(label + ': massKg must contain min/max/basis.');
      for (const k of ['min', 'max']) if (m[k] != null && (!number(m[k]) || m[k] < 0 || m[k] > 10000)) fail(label + ': invalid mass in kg.');
      if (m.min != null && m.max != null && m.min > m.max) fail(label + ': mass min exceeds max.');
    }
    if (item.massScope != null && !['per-unit', 'record-total'].includes(item.massScope)) fail(label + ': invalid massScope.');
    const p = row.placement;
    if (p != null) {
      if (!object(p)) fail(label + ': modelPlacement must be an object.');
      for (const k of ['positionMeters', 'localPositionMeters', 'rotationRadians']) if (p[k] != null && !vector(p[k])) fail(label + ': ' + k + ' must be a finite [x,y,z] vector.');
      if (p.parentPartId != null && partIds && !partIds.includes(p.parentPartId)) fail(label + ': unknown parentPartId.');
      if (p.localPositionMeters != null && (!p.parentPartId || p.positionMeters == null)) fail(label + ': local anchor requires host part and world-position snapshot.');
      if (p.positionKind != null && !['surface-anchor','envelope-center','location-marker'].includes(p.positionKind)) fail(label + ': invalid positionKind.');
      if (p.reviewed != null && typeof p.reviewed !== 'boolean') fail(label + ': reviewed must be boolean.');
    }
    const proxy=item.visualProxy;
    if(proxy!=null){
      if(!object(proxy)||!EQUIPMENT_KINDS.includes(proxy.kind))fail(label+': unknown visual proxy type.');
      if(typeof proxy.basis!=='string'||!proxy.basis.trim())fail(label+': visual proxy needs an explicit basis.');
      if(!object(proxy.dimensionsMeters)||!['length','width','height'].every(k=>number(proxy.dimensionsMeters[k])&&proxy.dimensionsMeters[k]>0&&proxy.dimensionsMeters[k]<=20))fail(label+': invalid visual proxy dimensions.');
    }
    if (item.centerOfMassMeters != null && !vector(item.centerOfMassMeters)) fail(label + ': invalid centerOfMassMeters.');
    const d = item.dimensionsMeters;
    if (d != null) {
      if (!object(d)) fail(label + ': dimensionsMeters must be an object.');
      for (const k of ['length', 'width', 'height']) if (d[k] != null && (!number(d[k]) || d[k] <= 0 || d[k] > 20)) fail(label + ': invalid ' + k + ' in meters.');
    }
  }
  return doc; // Preserve unknown metadata and proposals without lossy migrations.
}
export function parseInventory(text, partIds = null) {
  if (new TextEncoder().encode(text).length > MAX_BYTES) fail('Inventory JSON exceeds 1 MB. Keep media in separate private files.');
  return validateInventory(JSON.parse(text), partIds);
}
export function emptyInventory() {
  return {format: FORMAT, version: 1, units: 'meters', axes: AXES, catalog: [], placementProposals: []};
}
export function blankRecord() {
  return {id: 'ITEM-001', name: 'New equipment — replace this name', system: '', brand: '', model: '', quantity: 1,
    observationState: 'unconfirmed', description: '', identificationConfidence: 'unknown',
    dimensionsMeters: {length: null, width: null, height: null, basis: '', source: '', uncertaintyMeters: null},
    massKg: {min: null, max: null, basis: ''}, massScope: 'per-unit', includedInLoadcase: false,
    centerOfMassMeters: null, centerOfMassBasis: '',
    modelPlacement: {parentPartId: null, positionMeters: null, rotationRadians: null, status: 'unplaced-or-unverified', confidence: 'unknown', reviewed: false, locationDescription: null},
    verificationNext: 'Confirm exact model, dimensions, mass, installation state and placement datum.'};
}
export function hasDimensions(item) {
  const d = item.dimensionsMeters;
  return !!(d && ['length','width','height'].every(k => number(d[k]) && d[k] > 0) && typeof d.basis === 'string' && d.basis.trim() && typeof d.source === 'string' && d.source.trim());
}
export function loadcaseSummary(doc) {
  const result = {included: 0, excluded: [], massKg: 0, momentKgMeters: [0,0,0], centerOfMassMeters: null};
  for (const i of doc.catalog) {
    if (i.includedInLoadcase !== true) continue;
    const m = i.massKg;
    let reason = null;
    if (!m || !number(m.min) || !number(m.max) || m.min !== m.max || m.min <= 0 || typeof m.basis !== 'string' || !m.basis.trim()) reason = 'needs a positive point mass and its basis (ranges are not averaged)';
    else if (i.quantity == null && i.massScope !== 'record-total') reason = 'needs a known quantity for per-unit mass';
    else if (i.quantity > 1 && !['per-unit','record-total'].includes(i.massScope)) reason = 'needs explicit massScope for multiple units';
    else if (!vector(i.centerOfMassMeters) || typeof i.centerOfMassBasis !== 'string' || !i.centerOfMassBasis.trim()) reason = 'needs an explicit mass center and basis in the model frame';
    if (reason) { result.excluded.push({id:i.id, reason}); continue; }
    const mass = m.min * (i.massScope === 'record-total' ? 1 : i.quantity);
    result.included++;
    result.massKg += mass;
    i.centerOfMassMeters.forEach((p, axis) => result.momentKgMeters[axis] += mass * p);
  }
  if (result.massKg > 0) result.centerOfMassMeters = result.momentKgMeters.map(m => m / result.massKg);
  return result;
}

// Proposals remain distinct from equipment and are excluded from equipment mass totals.
export function inventoryRows(doc) {
  return [...doc.catalog.map(entry=>({entry, proposal:false, placement:entry?.modelPlacement || {}})),
    ...(doc.placementProposals || []).map(entry=>({entry, proposal:true, placement:entry}))];
}
export function findInventoryRow(doc,id) {return inventoryRows(doc).find(r=>r.entry.id===id) || null;}
export function updatedInventory(doc,id,apply,partIds=null) {
  const next=JSON.parse(JSON.stringify(doc)),row=findInventoryRow(next,id);
  if(!row) fail('Record not found: '+id);
  if(!row.proposal) row.entry.modelPlacement ||= {};
  apply(row.entry,row.proposal ? row.entry : row.entry.modelPlacement,row.proposal);
  return parseInventory(JSON.stringify(next),partIds);
}
export function provisionalPosition(doc,id,position,parentPartId=null,localPosition=null,partIds=null) {
  return updatedInventory(doc,id,(entry,p)=>{
    p.positionMeters=position; p.localPositionMeters=position ? localPosition : null;
    if(parentPartId) p.parentPartId=parentPartId;
    p.positionKind=position ? 'surface-anchor' : 'location-marker';
    p.confidence=position ? 'provisional-viewer-placement' : 'unknown'; p.reviewed=false;
    p.placementMethod=position ? 'Click on reconstructed model surface; not a physical measurement' : null;
    // Never infer installation state, mass center or a dimensional envelope from a click.
  },partIds);
}

// Inventory accounting accepts documented ranges, independently of physical CG.
// Presence at a planned coordinate never claims installed or a measured mass center.
export function massCoverage(doc) {
  const result={known:0,unknown:[],min:0,max:0,placed:{known:0,unknown:[],min:0,max:0},sides:{port:{min:0,max:0},starboard:{min:0,max:0},center:{min:0,max:0}}};
  for(const i of doc.catalog){
    const m=i.massKg,p=i.modelPlacement||{},placed=vector(p.positionMeters);
    const quantity=i.massScope==='record-total'?1:i.quantity;
    const valid=m&&number(m.min)&&number(m.max)&&m.min>=0&&m.max>=m.min&&typeof m.basis==='string'&&m.basis.trim()&&Number.isInteger(quantity)&&quantity>0&&(quantity===1||['per-unit','record-total'].includes(i.massScope));
    if(!valid){result.unknown.push(i.id);if(placed)result.placed.unknown.push(i.id);continue;}
    const min=m.min*quantity,max=m.max*quantity;result.known++;result.min+=min;result.max+=max;
    if(placed){result.placed.known++;result.placed.min+=min;result.placed.max+=max;const side=p.positionMeters[2]<-.01?'port':p.positionMeters[2]>.01?'starboard':'center';result.sides[side].min+=min;result.sides[side].max+=max;}
  }
  return result;
}
export function massLabel(item) {
  const doc=emptyInventory();doc.catalog=[item];const c=massCoverage(doc);
  return c.known?(c.min===c.max?`${c.min.toFixed(3)} kg`:`${c.min.toFixed(3)}–${c.max.toFixed(3)} kg`):'weight unknown';
}
