import * as THREE from './vendor/three.module.js';
import {validateInventory,newInventory,rows,findRecord,editRecord} from './inventory-data.js';

// Inventory is deliberately separate from the accepted 19-part procedural boat.
// Nothing here uploads files, calls an API, or modifies model geometry / GLB output.
const STORAGE_KEY = 'c22-private-inventory-v1';
const clone = v => JSON.parse(JSON.stringify(v));
const text = (tag, value, className='') => {const el=document.createElement(tag);el.textContent=String(value ?? '');if(className)el.className=className;return el;};
const download = (value,name) => {const blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);};

export function mountInventory({scene,boat,renderer,getCamera,controls}) {
  let documentData = newInventory(), selected=null, placing=false, persistent=false, visible=true, search='';
  const knownParts = Object.keys(boat.parts);
  const drawer=document.createElement('section');
  drawer.id='inventoryDrawer';
  drawer.hidden=true;
  drawer.setAttribute('aria-label','Private boat equipment inventory');
  drawer.innerHTML = [
    '<div class="inv-head"><div><small>LOCAL INVENTORY</small><h2>Boat equipment</h2></div><button id="invClose" aria-label="Close inventory">×</button></div>',
    '<div class="inv-privacy">Private working layer · imports stay in this browser. Export JSON to back up or share edits.</div>',
    '<div class="inv-tools"><button id="invImport">Import JSON</button><button id="invExport">Export JSON</button><input hidden type="file" accept=".json,application/json" id="invFile"></div>',
    '<div class="inv-tools"><button id="invNew">+ Add equipment</button><button id="invErase">Clear session</button></div>',
    '<label class="inv-persist"><input type="checkbox" id="invRemember"> Save a private copy on this device <small>(not encrypted)</small></label>',
    '<div id="invMessage" role="status" aria-live="polite"></div>',
    '<div class="inv-lookup"><input id="invSearch" type="search" placeholder="Search equipment, model or ID" aria-label="Search inventory"><select id="invSystem" aria-label="Filter by system"><option value="">All systems</option></select></div>',
    '<div id="invSummary" class="inv-summary"></div><div id="invRecords" class="inv-records"></div>',
    '<div id="invInspector" class="inv-inspector" hidden></div>'
  ].join('');
  document.body.appendChild(drawer);
  const toolbar=document.createElement('button');toolbar.id='inventoryButton';toolbar.textContent='Inventory';toolbar.setAttribute('aria-expanded','false');
  const header=document.querySelector('.header-actions');
  if(header)header.insertBefore(toolbar,header.firstChild);
  const $=id=>drawer.querySelector('#'+id);
  const message=(value,error=false)=>{$('invMessage').textContent=value;$('invMessage').classList.toggle('error',error);};
  const modalOpen=()=>{
    drawer.hidden=false;toolbar.setAttribute('aria-expanded','true');
    markerGroup.visible=true;labels.hidden=false;
    // Compact viewport conflicts with the original part inspector, so keep it hidden behind inventory.
    drawer.scrollTop=0;
    render();
  };
  const modalClose=()=>{cancelPlacement();drawer.hidden=true;toolbar.setAttribute('aria-expanded','false');markerGroup.visible=false;labels.hidden=true;};
  toolbar.addEventListener('click',()=>drawer.hidden?modalOpen():modalClose());
  $('invClose').addEventListener('click',modalClose);
  $('invSearch').addEventListener('input',e=>{search=e.target.value.toLowerCase();renderList();});
  $('invSystem').addEventListener('change',renderList);
  $('invImport').addEventListener('click',()=>$('invFile').click());
  $('invFile').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try {
      if(file.size>2000000)throw Error('Inventory JSON exceeds 2 MB.');
      const d=validateInventory(JSON.parse(await file.text()));
      documentData=d;selected=null;cancelPlacement();persist();render();
      message('Imported '+rows(d).length+' items on this device. No data uploaded.');
    } catch(err){message(err.message,true);} finally{e.target.value='';}
  });
  $('invExport').addEventListener('click',()=>{download(documentData,'Catalina22_Private_Inventory.json');message('Inventory JSON downloaded. Keep the file somewhere safe.');});
  $('invNew').addEventListener('click',()=>{
    const id=window.prompt('Unique equipment ID (e.g. ELE-NEW-01):');if(!id)return;
    if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(id)){message('Use letters, numbers, dots, dashes or underscores in IDs.',true);return;}
    if(findRecord(documentData,id)){message('This equipment ID already exists.',true);return;}
    const name=window.prompt('Equipment name:');if(!name?.trim())return;
    const d=clone(documentData);d.catalog.push({id,name:name.trim(),system:'Uncategorized',brand:'',model:'',quantity:1,
      observationState:'To review',modelPlacement:{parentPartId:null,status:'unplaced-or-unverified',
      confidence:'unknown',reviewed:false,positionMeters:null,rotationRadians:null,locationDescription:''}});
    try{documentData=validateInventory(d);selected=id;persist();render();message('Created '+id+'. Select Place to mark an approximate position.');}
    catch(err){message(err.message,true);}
  });
  $('invErase').addEventListener('click',()=>{
    if(!window.confirm('Clear the current inventory from this browser session? Export first to keep a backup.'))return;
    documentData=newInventory();selected=null;cancelPlacement();persistent=false;
    $('invRemember').checked=false;try{localStorage.removeItem(STORAGE_KEY);}catch{}
    render();message('Local inventory cleared. No GitHub or Netlify data changed.');
  });
  $('invRemember').addEventListener('change',e=>{
    persistent=e.target.checked;
    if(persistent){persist();message('Saved in this browser only. Browser storage is NOT encrypted.');}
    else{try{localStorage.removeItem(STORAGE_KEY);}catch{}message('Browser persistence disabled. Export JSON before leaving.');}
  });
  function persist() {
    if(!persistent)return;
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(documentData));}
    catch {message('Browser storage unavailable or full: export your JSON.',true);}
  }
  // Restore only data explicitly saved to this browser on an earlier visit.
  try {
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved){documentData=validateInventory(JSON.parse(saved));persistent=true;$('invRemember').checked=true;}
  }catch{message('Could not restore browser copy. Import a backup JSON file.',true);}

  const markerGroup=new THREE.Group();markerGroup.name='Inventory markers (viewer-only)';scene.add(markerGroup);markerGroup.visible=false;
  const labels=document.createElement('div');labels.id='inventoryLabels';document.querySelector('#viewport').appendChild(labels);labels.hidden=true;
  const markerMeshes=[],labelButtons=[];
  function positionFor(item) {
    const p=item.placement;
    if(!Array.isArray(p.positionMeters))return null;
    if(Array.isArray(p.localPositionMeters)&&boat.parts[p.parentPartId]){
      boat.root.updateMatrixWorld(true);
      return boat.parts[p.parentPartId].localToWorld(new THREE.Vector3(...p.localPositionMeters));
    }
    return new THREE.Vector3(...p.positionMeters);
  }
  function refreshMarkers() {
    markerMeshes.forEach(o=>{o.geometry.dispose();o.material.dispose();});markerMeshes.length=0;
    markerGroup.clear();labels.replaceChildren();labelButtons.length=0;
    for(const item of rows(documentData)) {
      const position=positionFor(item);if(!position)continue;
      const mat=new THREE.MeshBasicMaterial({color:item.id===selected?0xd28c3b:0x24766b,depthTest:false,transparent:true,opacity:.95});
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(.065,12,10),mat);
      mesh.position.copy(position);mesh.renderOrder=15;mesh.userData.inventoryId=item.id;markerGroup.add(mesh);
      markerMeshes.push(mesh);
      const button=text('button',item.id,'inv-marker-label');button.type='button';button.title=(item.proposal?item.entry.label:item.entry.name)+' · provisional equipment marker';
      button.addEventListener('click',()=>{selected=item.id;modalOpen();});
      labels.appendChild(button);labelButtons.push({element:button,item,mesh});
    }
  }
  function render() {renderList();renderInspector();refreshMarkers();}
  function renderList() {
    const entries=rows(documentData);
    const systems=[...new Set(entries.map(r=>r.entry.system||'Proposals'))].sort();
    const filt=$('invSystem'),previous=filt.value;
    filt.replaceChildren(new Option('All systems',''));
    systems.forEach(s=>filt.add(new Option(s,s)));
    filt.value=systems.includes(previous)?previous:'';
    $('invSummary').textContent=entries.length+' records · '+entries.filter(x=>Array.isArray(x.placement.positionMeters)).length+' model pins · '+entries.filter(x=>!Array.isArray(x.placement.positionMeters)).length+' unplaced';
    const filtered=entries.filter(r=>{
      const hay=[r.id,r.entry.name,r.entry.label,r.entry.model,r.entry.brand,r.entry.system,r.placement.locationDescription].join(' ').toLowerCase();
      return (!search||hay.includes(search))&&(!filt.value||(r.entry.system||'Proposals')===filt.value);
    });
    const wrap=$('invRecords');wrap.replaceChildren();
    if(!filtered.length)wrap.append(text('p','No matching equipment. Import your private inventory JSON to begin.','inv-empty'));
    for(const r of filtered){
      const btn=document.createElement('button');btn.type='button';btn.className='inv-record'+(r.id===selected?' active':'');
      btn.append(text('strong',r.entry.name||r.entry.label||'Untitled'),text('span',r.id+' · '+(r.entry.model||r.entry.system||'Proposed fit-out'),'inv-record-sub'));
      btn.append(text('small',Array.isArray(r.placement.positionMeters)?'Pinned · provisional position':'Unplaced / no surveyed coordinates','inv-record-status'));
      btn.addEventListener('click',()=>{selected=r.id;render();});
      wrap.appendChild(btn);
    }
  }
  function field(container,label,value,property,kind='text') {
    const wrap=document.createElement('label');wrap.className='inv-field';
    wrap.append(text('span',label));
    const input=document.createElement(kind==='textarea'?'textarea':'input');
    if(kind!=='textarea')input.type=kind;
    input.value=value ?? '';input.dataset.field=property;wrap.append(input);container.append(wrap);return input;
  }
  function renderInspector() {
    const host=$('invInspector');host.replaceChildren();host.hidden=!selected;if(!selected)return;
    const r=findRecord(documentData,selected);if(!r){selected=null;host.hidden=true;return;}
    const heading=document.createElement('div');heading.className='inv-item-title';
    heading.append(text('strong',r.id),text('span',r.proposal?'PROPOSED FIT-OUT':'EQUIPMENT RECORD'));
    host.append(heading);
    const form=document.createElement('div');form.className='inv-form';
    const nameField=field(form,'Name / label',r.entry.name||r.entry.label,'name');
    const sysField=field(form,'System',r.entry.system||'','system');
    const brandField=field(form,'Brand',r.entry.brand||'','brand');
    const modelField=field(form,'Model / SKU',r.entry.model||'','model');
    const obsField=field(form,'Observation / status',r.entry.observationState||r.placement.status||'','observationState');
    const descField=field(form,'Installation location and notes',r.placement.locationDescription||'','locationDescription','textarea');
    const pos=r.placement.positionMeters;
    const coordinates=document.createElement('div');coordinates.className='inv-coords';
    const x=field(coordinates,'X (bow +)',pos?.[0]?.toFixed(3),'x','number');
    const y=field(coordinates,'Y (up +)',pos?.[1]?.toFixed(3),'y','number');
    const z=field(coordinates,'Z (starboard +)',pos?.[2]?.toFixed(3),'z','number');
    [x,y,z].forEach(el=>{el.step='.001';el.placeholder='Unplaced';});
    form.append(coordinates);
    const buttons=document.createElement('div');buttons.className='inv-form-actions';
    const makeButton=(label,cb)=>{const b=text('button',label);b.type='button';b.addEventListener('click',cb);buttons.append(b);return b;};
    makeButton('Save fields',()=>{
      try{
        documentData=editRecord(documentData,r.id,(entry,placement,proposal)=>{
          if(proposal)entry.label=nameField.value.trim();
          else entry.name=nameField.value.trim();
          entry.system=sysField.value.trim();entry.brand=brandField.value.trim();entry.model=modelField.value.trim();
          if(proposal)placement.status=obsField.value.trim();
          else entry.observationState=obsField.value.trim();
          placement.locationDescription=descField.value.trim();
        });
        persist();render();message('Record '+r.id+' updated locally.');
      }catch(err){message(err.message,true);}
    });
    makeButton('Set XYZ (provisional)',()=>{
      const values=[x.value,y.value,z.value].map(v=>v.trim()===''?NaN:Number(v));
      if(values.some(v=>!Number.isFinite(v)||Math.abs(v)>100)){message('Enter all three coordinates in meters (within ±100).',true);return;}
      updatePosition(r.id,values,null,null);
    });
    makeButton('Place on visible boat',()=>{
      placing=r.id;controls.enabled=false;message('Click a visible model surface to place '+r.id+'. Escape cancels.');
      host.querySelectorAll('button').forEach(b=>{if(b.textContent==='Place on visible boat')b.textContent='Waiting for boat click…';});
    });
    makeButton('Remove pin',()=>{updatePosition(r.id,null,null,null);});
    makeButton('Delete record',()=>{
      if(!window.confirm('Delete '+r.id+' from the current private inventory? Export a backup first.'))return;
      const d=clone(documentData);d.catalog=d.catalog.filter(e=>e.id!==r.id);d.placementProposals=(d.placementProposals||[]).filter(e=>e.id!==r.id);
      documentData=validateInventory(d);selected=null;persist();render();message('Record deleted locally.');
    });
    host.append(form,buttons);
    const caveat=text('p','Coordinates are exploratory model positions, NOT surveyed measurements. Neither location nor installation status is automatically verified.','inv-caveat');host.append(caveat);
  }
  function updatePosition(id,position,parentId,localPosition) {
    documentData=editRecord(documentData,id,(entry,placement)=>{
      placement.positionMeters=position;
      placement.localPositionMeters=localPosition;
      if(parentId)placement.parentPartId=parentId;
      placement.confidence=position?'provisional-viewer-placement':'unknown';
      placement.reviewed=false;
      if(position && (!placement.status||placement.status==='unplaced-or-unverified'))placement.status='planned';
      if(!position)placement.localPositionMeters=null;
    });
    cancelPlacement();persist();render();
    message(position?'Provisional pin saved for '+id+'. Export JSON to share it.':'Removed model pin for '+id+'.');
  }
  function cancelPlacement(){placing=false;controls.enabled=true;}
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&placing){cancelPlacement();message('Placement canceled.');}
  },true);
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerup',e=>{
    if(e.button!==0 || drawer.hidden || (!placing && !visible))return;
    const rect=canvas.getBoundingClientRect();
    pointer.set(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
    raycaster.setFromCamera(pointer,getCamera());
    if(placing){
      const candidates=boat.pickables.filter(obj=>{
        let o=obj;while(o){if(!o.visible)return false;o=o.parent;}return true;
      });
      const hit=raycaster.intersectObjects(candidates,false)[0];
      if(!hit){message('No visible boat surface under the cursor. Try another view.',true);return;}
      const id=placing,partId=hit.object.userData.partId;
      const world=hit.point.clone(),local=partId&&boat.parts[partId]?boat.parts[partId].worldToLocal(world.clone()).toArray():null;
      updatePosition(id,world.toArray().map(n=>Number(n.toFixed(5))),partId,local);
      e.stopImmediatePropagation();e.preventDefault();return;
    }
    const marker=raycaster.intersectObjects(markerMeshes,false)[0];
    if(marker){selected=marker.object.userData.inventoryId;render();e.stopImmediatePropagation();e.preventDefault();}
  },true);
  function tick() {
    if(visible && !drawer.hidden){
      const width=canvas.clientWidth,height=canvas.clientHeight;
      const camera=getCamera();camera.updateMatrixWorld();
      for(const it of labelButtons){
        const point=positionFor(it.item);if(!point){it.element.hidden=true;continue;}
        it.mesh.position.copy(point);
        const projected=point.clone().project(camera);
        const onScreen=projected.z>-1&&projected.z<1&&Math.abs(projected.x)<.97&&Math.abs(projected.y)<.97;
        it.element.hidden=!onScreen;
        if(onScreen){it.element.style.left=((projected.x+1)*.5*width)+'px';it.element.style.top=((1-projected.y)*.5*height-11)+'px';}
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
  render();
  return {getDocument:()=>clone(documentData),loadDocument:d=>{documentData=validateInventory(d);selected=null;persist();render();},toggle:modalOpen};
}
