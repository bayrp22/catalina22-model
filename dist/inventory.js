import * as THREE from './vendor/three.module.js';
import {emptyInventory, blankRecord, parseInventory, validateInventory, hasDimensions, loadcaseSummary, MAX_BYTES, inventoryRows, findInventoryRow, updatedInventory, provisionalPosition} from './inventory-data.js';

export const STORAGE_KEY = 'c22-private-inventory-v1'; // Same key as PR #2; restore only explicit device copies.
export function createInventory({scene, partIds, parts = {}, download, toast, focus, setPlacementMode = ()=>{}, confirmAction = message=>window.confirm(message), storage = null}) {
  let doc=emptyInventory(), selected=null, editingId=null, editingProposal=false, placing=null, persistent=false, previousFilter='';
  const root=new THREE.Group();root.name='private-equipment-overlay';scene.add(root);
  const objects=new Map(),pickables=[];
  const $=s=>document.querySelector(s);
  const text=(tag,content)=>{const el=document.createElement(tag);el.textContent=content;return el;};
  const message=msg=>{$('#inventoryMessage').textContent=msg;};
  const detail=$('#inventoryDetail');
  function persist() {
    if(!persistent)return;
    try {storage?.setItem(STORAGE_KEY,JSON.stringify(doc));}
    catch {message('Device save failed. Your changes remain in this tab; Export JSON now.');}
  }
  function commit(next,id=selected) {validateInventory(next,partIds);doc=next;selected=id;persist();updateSystems();rebuild();}
  function cancelPlacement() {if(placing)setPlacementMode(false);placing=null;$('#inventoryCancelPlacement').hidden=true;}
  function beginPlacement(id) {cancelPlacement();placing=id;setPlacementMode(true);$('#inventoryCancelPlacement').hidden=false;message('Click a visible boat surface for a provisional pin. Escape cancels. This does not set dimensions, mass center or installed status.');}
  function positionFor(row) {
    const p=row.placement;if(!p.positionMeters)return null;
    if(p.localPositionMeters && parts[p.parentPartId]) {parts[p.parentPartId].updateWorldMatrix(true,false);return parts[p.parentPartId].localToWorld(new THREE.Vector3(...p.localPositionMeters));}
    return new THREE.Vector3(...p.positionMeters);
  }
  function rebuild() {
    for(const child of [...root.children]){child.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});root.remove(child);}
    objects.clear();pickables.length=0;
    for(const row of inventoryRows(doc)) {
      const {entry:i,placement:p,proposal}=row,position=positionFor(row);if(!position)continue;
      const dimensioned=!proposal && i.quantity===1 && hasDimensions(i) && p.rotationRadians!=null && p.positionKind!=='surface-anchor' && !p.localPositionMeters;
      const d=i.dimensionsMeters;
      const geometry=dimensioned ? new THREE.BoxGeometry(d.length,d.height,d.width) : new THREE.OctahedronGeometry(.055);
      const material=new THREE.MeshStandardMaterial({color:proposal?0x9370a7:p.reviewed?0x287c71:0xd2913d,transparent:true,opacity:dimensioned?.55:.95,depthTest:true,roughness:.6});
      const mesh=new THREE.Mesh(geometry,material);mesh.position.copy(position);
      if(dimensioned)mesh.rotation.set(...p.rotationRadians,'XYZ');
      mesh.userData.inventoryId=i.id;mesh.name=i.id;root.add(mesh);objects.set(i.id,mesh);pickables.push(mesh);
    }
    root.visible=$('#inventoryToggle').checked;
    renderList();renderDetail();renderSummary();
  }
  function renderList() {
    const list=$('#inventoryList');list.replaceChildren();
    const query=$('#inventorySearch').value.toLowerCase(),system=$('#inventorySystem').value,all=inventoryRows(doc);
    const filtered=all.filter(r=>(!system||(r.proposal?'Proposals':r.entry.system)===system) && [r.entry.id,r.entry.name,r.entry.label,r.entry.brand,r.entry.model,r.entry.system,r.placement.locationDescription].join(' ').toLowerCase().includes(query));
    for(const row of filtered) {
      const {entry:i,placement:p,proposal}=row;
      const button=text('button',`${i.id} · ${proposal?i.label:i.name}`);button.className='inventory-item';button.setAttribute('aria-pressed',String(i.id===selected));
      button.append(text('small',`${proposal?'Proposal':'Equipment'} · ${p.positionMeters?'Pinned (see confidence)':'Unplaced'} · ${proposal?p.status||'concept':i.observationState||'state unknown'}`));
      button.onclick=()=>select(i.id);list.append(button);
    }
    if(!filtered.length)list.append(text('p',all.length?'No matching records.':'Import your private inventory JSON to begin. No equipment is supplied in this deployment.'));
    $('#inventoryCount').textContent=`${doc.catalog.length} equipment · ${(doc.placementProposals||[]).length} proposals · ${all.filter(r=>!r.placement.positionMeters).length} unplaced`;
  }
  function action(label,callback){const b=text('button',label);b.type='button';b.onclick=callback;detail.append(b);}
  function renderDetail() {
    detail.replaceChildren();const row=findInventoryRow(doc,selected);if(!row)return;
    const {entry:i,placement:p,proposal}=row;
    detail.append(text('h3',proposal?i.label:i.name),text('p',[i.id,proposal?'PROPOSED FIT-OUT':i.brand,i.model].filter(Boolean).join(' · ')));
    for(const [label,value] of [
      ['Description',i.description],['State',proposal?p.status:i.observationState],['Identification',i.identificationConfidence],
      ['Location',p.locationDescription],['Confidence',p.confidence||'unknown'],['Dimensions',JSON.stringify(i.dimensionsMeters||null)],
      ['Mass (kg)',JSON.stringify(i.massKg||null)],['Mass scope',i.massScope],['Mass center (m)',JSON.stringify(i.centerOfMassMeters||null)],
      ['Mass-center basis',i.centerOfMassBasis],['Next verification',i.verificationNext]
    ]) if(value!=null){const paragraph=text('p',value);paragraph.prepend(text('strong',label+': '));detail.append(paragraph);}
    const complete=document.createElement('details');complete.append(text('summary','Full record and source information'),text('pre',JSON.stringify(i,null,2)));detail.append(complete);
    if(!proposal){const inclusion=text('label',' Include in this equipment load case '),checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=i.includedInLoadcase===true;
      checkbox.onchange=()=>{commit(updatedInventory(doc,i.id,e=>e.includedInLoadcase=checkbox.checked,partIds));};inclusion.prepend(checkbox);detail.append(inclusion);}
    else detail.append(text('p','Proposal only. Excluded from equipment mass calculations.'));
    action('Edit fields',()=>editFields(row));action('Edit full JSON',()=>editRecord(row));
    action('Place provisional pin',()=>beginPlacement(i.id));
    if(objects.has(i.id)){action('Focus equipment',()=>focus(new THREE.Box3().setFromObject(objects.get(i.id))));action('Remove pin',()=>{cancelPlacement();commit(provisionalPosition(doc,i.id,null,null,null,partIds));message('Pin removed. Equipment information and mass center are unchanged.');});}
    action('Delete record',()=>{if(!confirmAction('Delete '+i.id+' from this private working inventory? Export a backup first.'))return;cancelPlacement();const next=structuredClone(doc);next.catalog=next.catalog.filter(e=>e.id!==i.id);next.placementProposals=(next.placementProposals||[]).filter(e=>e.id!==i.id);commit(next,null);message('Record removed from the working inventory.');});
    const shape=objects.get(i.id);detail.append(text('p',!shape?'No physical/model coordinates supplied yet.':shape.geometry.type==='BoxGeometry'?'Dimensioned envelope only; not an exact device mesh.':'Location pin only. A surface pin does not establish a box center or mass center.'));
  }
  function renderSummary() {
    const summary=loadcaseSummary(doc),el=$('#inventoryMass');el.replaceChildren();
    el.append(text('strong',`Calculated subset: ${summary.massKg.toFixed(3)} kg · ${summary.included} records`));
    el.append(text('p',summary.centerOfMassMeters?`Fixed-coordinate equipment mass center [X,Y,Z]: ${summary.centerOfMassMeters.map(n=>n.toFixed(3)).join(', ')} m`:'No mass center calculated yet.'));
    for(const e of summary.excluded)el.append(text('p',`${e.id}: excluded — ${e.reason}.`));
    el.append(text('p','Only checked equipment with a point mass and explicit mass center qualifies. Pins and proposals do not supply mass centers. These fixed coordinates do not follow galley/keel sliders. This is not whole-boat CG, stability, trim or a safe loading limit.'));
  }
  function select(id){selected=id;for(const [key,mesh]of objects){mesh.material.emissive.setHex(key===id?0x765124:0);mesh.material.emissiveIntensity=.5;}renderList();renderDetail();}
  function editRecord(row=null,proposal=false) {
    cancelPlacement();editingId=row?.entry.id||null;editingProposal=row?.proposal??proposal;
    const record=row?.entry||(editingProposal?{id:'PROPOSAL-001',label:'New proposed fitting',status:'concept',positionMeters:null,rotationRadians:null,parentPartId:null,reviewed:false}:blankRecord());
    $('#inventoryEditor').value=JSON.stringify(record,null,2);$('#inventoryEditorError').textContent='';$('#inventoryEditDialog').showModal();
  }
  const formFields=[['name','Name / proposal label','text'],['system','System','text'],['brand','Brand','text'],['model','Exact model / SKU','text'],['quantity','Quantity (blank = unknown)','number'],['observationState','Observed equipment state','text'],['description','Technical description','textarea'],['evidenceFiles','Evidence file/page references','text'],['verificationNext','Next verification','textarea'],['locationDescription','Location notes','textarea'],['status','Placement status','text'],['massMin','Mass min (kg)','number'],['massMax','Mass max (kg)','number'],['massBasis','Mass basis and included accessories','text']];
  let fieldsId=null,fieldsInputs=new Map();
  function editFields(row) {
    cancelPlacement();fieldsId=row.entry.id;fieldsInputs.clear();const wrap=$('#inventoryFields');wrap.replaceChildren();
    const {entry:i,placement:p,proposal}=row;
    const values={...i,name:proposal?i.label:i.name,locationDescription:p.locationDescription,status:p.status,massMin:i.massKg?.min,massMax:i.massKg?.max,massBasis:i.massKg?.basis};
    for(const [key,title,kind]of formFields){if(proposal&&!['name','description','locationDescription','status','verificationNext'].includes(key))continue;
      const label=document.createElement('label');label.className='inventory-field';label.append(text('span',title));const input=document.createElement(kind==='textarea'?'textarea':'input');if(kind!=='textarea')input.type=kind;if(kind==='number')input.step=key==='quantity'?'1':'any';input.value=values[key]??'';label.append(input);wrap.append(label);fieldsInputs.set(key,{input,original:input.value});}
    $('#inventoryFieldsError').textContent='';$('#inventoryFieldsDialog').showModal();
  }
  $('#inventorySaveFields').onclick=()=>{try {
    const next=updatedInventory(doc,fieldsId,(i,p,proposal)=>{
      for(const[key,{input,original}]of fieldsInputs){if(input.value===original)continue;const value=input.value.trim();
        if(key==='name')i[proposal?'label':'name']=value;
        else if(key==='locationDescription'||key==='status')p[key]=value;
        else if(key==='quantity')i.quantity=value===''?null:Number(value);
        else if(key.startsWith('mass')){i.massKg||={min:null,max:null,basis:''};if(key==='massBasis')i.massKg.basis=value;else i.massKg[key==='massMin'?'min':'max']=value===''?null:Number(value);}
        else i[key]=value;
      }
    },partIds);commit(next);$('#inventoryFieldsDialog').close();message('Fields saved privately. Unknown values and unedited evidence are preserved.');
  }catch(e){$('#inventoryFieldsError').textContent=e.message;}};
  function updateSystems(){const el=$('#inventorySystem');previousFilter=el.value;el.replaceChildren(new Option('All systems',''));const systems=[...new Set(inventoryRows(doc).map(r=>r.proposal?'Proposals':r.entry.system).filter(s=>typeof s==='string'&&s))].sort();systems.forEach(s=>el.add(new Option(s,s)));el.value=systems.includes(previousFilter)?previousFilter:'';}
  $('#inventorySaveRecord').onclick=()=>{try {
    const item=JSON.parse($('#inventoryEditor').value),candidate=structuredClone(doc),list=editingProposal?(candidate.placementProposals||=[]):candidate.catalog;
    if(editingId && item.id!==editingId)throw Error('Keep the existing stable ID unchanged. Add a new record for a different item.');
    const index=list.findIndex(i=>i.id===editingId);if(index<0)list.push(item);else list[index]=item;
    parseInventory(JSON.stringify(candidate),partIds);commit(candidate,item.id);$('#inventoryEditDialog').close();message('Record saved privately. Export JSON for a backup.');
  }catch(e){$('#inventoryEditorError').textContent=e.message;}};
  $('#inventoryAdd').onclick=()=>editRecord();$('#inventoryAddProposal').onclick=()=>editRecord(null,true);
  $('#inventoryTemplate').onclick=()=>{const template=emptyInventory();template.catalog.push(blankRecord());download(JSON.stringify(template,null,2),'Catalina22_Inventory_Template.json','application/json');};
  $('#inventoryImport').onchange=async e=>{try {
    const file=e.target.files[0];if(!file)return;if(file.size>MAX_BYTES)throw Error('Maximum 1 MB; media must remain separate.');
    const candidate=parseInventory(await file.text(),partIds);
    if(inventoryRows(doc).length&&!confirmAction('Replace the current working inventory? Export a backup first.'))return;
    cancelPlacement();commit(candidate,null);message('Private import complete. '+candidate.catalog.length+' equipment records and '+(candidate.placementProposals||[]).length+' proposals.');
  }catch(e){message('Import failed; previous inventory retained. '+e.message);}finally{e.target.value='';}};
  $('#inventoryExport').onclick=()=>{validateInventory(doc,partIds);download(JSON.stringify(doc,null,2),'Catalina22_Private_Inventory.json','application/json');toast('Private inventory downloaded');};
  $('#inventoryClear').onclick=()=>{
    if(!confirmAction('Clear this working inventory and its saved device copy? Export JSON first.'))return;
    cancelPlacement();persistent=false;$('#inventoryRemember').checked=false;
    try{storage?.removeItem(STORAGE_KEY);}catch{message('Could not erase the device copy. Clear this site’s browser storage manually.');return;}
    commit(emptyInventory(),null);message('Working inventory and saved device copy cleared. Exported files are unchanged.');
  };
  $('#inventoryRemember').onchange=e=>{
    if(e.target.checked){try{if(!storage)throw Error('Browser storage is unavailable.');storage.setItem(STORAGE_KEY,JSON.stringify(doc));persistent=true;message('Saved on this device only, unencrypted. Anyone with this browser profile may access it.');}catch(err){persistent=false;e.target.checked=false;message('Device save failed. Export JSON instead.');}}
    else{persistent=false;try{storage?.removeItem(STORAGE_KEY);message('Device copy removed. Export JSON before closing this tab.');}catch{message('Could not remove the saved device copy. Clear this site’s browser storage manually.');}}
  };
  $('#inventorySearch').oninput=renderList;$('#inventorySystem').onchange=renderList;
  $('#inventoryToggle').onchange=e=>{root.visible=e.target.checked;if(!e.target.checked)cancelPlacement();};
  $('#inventoryCancelPlacement').onclick=()=>{cancelPlacement();message('Placement canceled.');};
  // Restore a previously opted-in PR #2/consolidated copy without exposing it to network calls.
  try{const saved=storage?.getItem(STORAGE_KEY);if(saved){doc=parseInventory(saved,partIds);persistent=true;$('#inventoryRemember').checked=true;message('Restored the private copy saved on this device.');}}catch{message('Saved device copy is invalid. Import a backup; no stored data was overwritten.');}
  updateSystems();rebuild();
  return {
    pickables,select,cancelPlacement,
    get placing(){return placing!==null;},
    handleSurfaceClick(raycaster){if(!placing)return false;const visible=o=>{while(o){if(!o.visible)return false;o=o.parent;}return true;};
      const hit=raycaster.intersectObjects(Object.values(parts).flatMap(part=>{const meshes=[];part.traverse(o=>{if(o.isMesh&&visible(o))meshes.push(o);});return meshes;}),false)[0];
      if(!hit){message('No visible boat surface hit. Change view or cancel placement.');return true;}
      const id=placing,host=hit.object.userData.partId,local=host&&parts[host]?parts[host].worldToLocal(hit.point.clone()).toArray():null;
      cancelPlacement();commit(provisionalPosition(doc,id,hit.point.toArray(),host||null,local,partIds));message('Provisional surface pin saved. No physical measurement or mass center was inferred.');return true;
    },
    update(){for(const row of inventoryRows(doc)){if(row.placement.localPositionMeters&&objects.has(row.entry.id)){const position=positionFor(row);if(position)objects.get(row.entry.id).position.copy(position);}}}
  };
}
