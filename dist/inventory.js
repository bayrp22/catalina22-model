import * as THREE from './vendor/three.module.js';
import {emptyInventory, blankRecord, parseInventory, validateInventory, hasDimensions, loadcaseSummary, MAX_BYTES} from './inventory-data.js';

export function createInventory({scene, partIds, download, toast, focus}) {
  let doc = emptyInventory(), selected = null, editingId = null;
  const root = new THREE.Group(); root.name = 'private-equipment-overlay'; scene.add(root);
  const objects = new Map(), pickables = [];
  const $ = s => document.querySelector(s);
  const text = (tag, content) => { const el = document.createElement(tag); el.textContent = content; return el; };
  const message = msg => { $('#inventoryMessage').textContent = msg; };
  const detail = $('#inventoryDetail');
  function rebuild() {
    for (const child of [...root.children]) { child.traverse(o => { o.geometry?.dispose(); if (o.material) o.material.dispose(); }); root.remove(child); }
    objects.clear(); pickables.length = 0;
    for (const item of doc.catalog) {
      const p = item.modelPlacement;
      if (!p?.positionMeters) continue;
      const dimensioned = item.quantity === 1 && hasDimensions(item) && p.rotationRadians != null;
      const d = item.dimensionsMeters;
      const geometry = dimensioned ? new THREE.BoxGeometry(d.length, d.height, d.width) : new THREE.OctahedronGeometry(.055);
      const material = new THREE.MeshStandardMaterial({color: p.reviewed ? 0x287c71 : 0xd2913d, transparent: true, opacity: dimensioned ? .55 : .95, depthTest: true, roughness: .6});
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.fromArray(p.positionMeters);
      if (p.rotationRadians) mesh.rotation.set(...p.rotationRadians, 'XYZ');
      mesh.userData.inventoryId = item.id; mesh.name = item.id;
      root.add(mesh); objects.set(item.id, mesh); pickables.push(mesh);
    }
    root.visible = $('#inventoryToggle').checked;
    renderList(); renderDetail(); renderSummary();
  }
  function renderList() {
    const list = $('#inventoryList'); list.replaceChildren();
    const query = $('#inventorySearch').value.toLowerCase(), system = $('#inventorySystem').value;
    for (const i of doc.catalog.filter(i => (!system || i.system === system) && [i.id,i.name,i.brand,i.model,i.system].join(' ').toLowerCase().includes(query))) {
      const button = text('button', `${i.id} · ${i.name}`); button.className = 'inventory-item';
      button.setAttribute('aria-pressed', String(i.id === selected));
      button.append(text('small', `${i.modelPlacement?.positionMeters ? 'Placed' : 'Unplaced'} · ${i.observationState || 'state unknown'}`));
      button.onclick = () => select(i.id); list.append(button);
    }
    if (!doc.catalog.length) list.append(text('p', 'Ready for your inventory. Import a private JSON or add a record. No equipment has been assumed.'));
    $('#inventoryCount').textContent = `${doc.catalog.length} records · ${doc.catalog.filter(i=>!i.modelPlacement?.positionMeters).length} unplaced`;
  }
  function renderDetail() {
    detail.replaceChildren(); const i = doc.catalog.find(i=>i.id === selected); if (!i) return;
    detail.append(text('h3', i.name), text('p', [i.id,i.brand,i.model].filter(Boolean).join(' · ')));
    for (const [label, value] of [
      ['Description', i.description], ['State', i.observationState], ['Identification', i.identificationConfidence],
      ['Placement', JSON.stringify(i.modelPlacement || null)], ['Dimensions', JSON.stringify(i.dimensionsMeters || null)],
      ['Mass (kg)', JSON.stringify(i.massKg || null)], ['Mass scope', i.massScope], ['Mass center (m)', JSON.stringify(i.centerOfMassMeters || null)],
      ['Mass-center basis', i.centerOfMassBasis], ['Next verification', i.verificationNext]
    ]) if (value != null) { const row=text('p', value); row.prepend(text('strong', label + ': ')); detail.append(row); }
    const inclusion = text('label', ' Include in this equipment load case '), checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.checked = i.includedInLoadcase === true;
    checkbox.onchange=()=>{i.includedInLoadcase=checkbox.checked;renderSummary();}; inclusion.prepend(checkbox); detail.append(inclusion);
    const edit = text('button','Edit record'); edit.onclick=()=>editRecord(i); detail.append(edit);
    if (objects.has(i.id)) {const button = text('button','Focus equipment'); button.onclick=()=>focus(new THREE.Box3().setFromObject(objects.get(i.id))); detail.append(button);}
    const shape = objects.get(i.id); detail.append(text('p', !shape ? 'No 3D placement yet.' : shape.geometry.type === 'BoxGeometry' ? 'Dimensioned envelope only; not an exact device mesh.' : 'Location marker only. Size/orientation or individual placements are incomplete.'));
  }
  function renderSummary() {
    const summary = loadcaseSummary(doc), el=$('#inventoryMass'); el.replaceChildren();
    el.append(text('strong', `Calculated subset: ${summary.massKg.toFixed(3)} kg · ${summary.included} records`));
    el.append(text('p', summary.centerOfMassMeters ? `Equipment mass center [X,Y,Z]: ${summary.centerOfMassMeters.map(n=>n.toFixed(3)).join(', ')} m` : 'No mass center calculated yet.'));
    for (const e of summary.excluded) el.append(text('p', `${e.id}: excluded — ${e.reason}.`));
    el.append(text('p', 'Includes only checked records with a point mass and explicit mass center. Omits unchecked and incomplete items. This is not whole-boat CG, stability, trim or a safe loading limit.'));
  }
  function select(id) { selected=id; for (const [key, mesh] of objects) {mesh.material.emissive.setHex(key===id ? 0x765124 : 0);mesh.material.emissiveIntensity=.5;} renderList();renderDetail(); }
  function editRecord(i=null) {
    editingId=i?.id || null; $('#inventoryEditor').value=JSON.stringify(i || blankRecord(),null,2);
    $('#inventoryEditorError').textContent=''; $('#inventoryEditDialog').showModal();
  }
  function updateSystems() {
    const el=$('#inventorySystem'); el.replaceChildren(new Option('All systems',''));
    [...new Set(doc.catalog.map(i=>i.system).filter(i=>typeof i==='string' && i))].sort().forEach(s=>el.add(new Option(s,s)));
  }
  $('#inventorySaveRecord').onclick=()=>{
    try {
      const item=JSON.parse($('#inventoryEditor').value), candidate=JSON.parse(JSON.stringify(doc));
      const index=candidate.catalog.findIndex(i=>i.id===editingId);
      if(index<0)candidate.catalog.push(item);else candidate.catalog[index]=item;
      parseInventory(JSON.stringify(candidate),partIds);doc=candidate;selected=item.id;updateSystems();rebuild();$('#inventoryEditDialog').close();message('Record updated in this tab. Export JSON to keep your changes.');
    }catch(e){$('#inventoryEditorError').textContent=e.message;}
  };
  $('#inventoryAdd').onclick=()=>editRecord();
  $('#inventoryTemplate').onclick=()=>{const template=emptyInventory(); template.catalog.push(blankRecord());download(JSON.stringify(template,null,2),'Catalina22_Inventory_Template.json','application/json');};
  $('#inventoryImport').onchange=async e=>{
    try {const file=e.target.files[0];if(!file)return;if(file.size>MAX_BYTES)throw Error('Maximum 1 MB; media must remain separate.');const candidate=parseInventory(await file.text(),partIds);doc=candidate;selected=null;updateSystems();rebuild();message('Imported privately into this tab. Export before refreshing or closing.');}
    catch(e){message('Import failed; previous inventory retained. '+e.message);}finally{e.target.value='';}
  };
  $('#inventoryExport').onclick=()=>{validateInventory(doc,partIds);download(JSON.stringify(doc,null,2),'Catalina22_Private_Inventory.json','application/json');toast('Private inventory downloaded');};
  $('#inventoryClear').onclick=()=>{doc=emptyInventory();selected=null;updateSystems();rebuild();message('Inventory cleared from this tab. Your downloaded files are unchanged.');};
  $('#inventorySearch').oninput=renderList;$('#inventorySystem').onchange=renderList;
  $('#inventoryToggle').onchange=e=>root.visible=e.target.checked;
  rebuild();
  return {pickables,select};
}
