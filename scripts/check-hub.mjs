import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildBoat} from '../dist/model.js';
import {buildAuxiliaryPropulsion} from '../dist/propulsion.js';
import {buildRestorationEquipment} from '../dist/restoration.js';

const read=p=>fs.readFileSync(p,'utf8');
const home=read('dist/project/index.html');
const viewer=read('dist/index.html');
const inv=read('dist/project/inventory/index.html');
const rig=read('dist/project/rigging/index.html');
const refs=read('dist/project/references/index.html');
const js=read('dist/project/project.js');
const css=read('dist/project/project.css');

for(const [name,html] of [['home',home],['inventory',inv],['rigging',rig],['references',refs]]){
  assert(html.includes('href="/project/project.css"'),'Stylesheet missing on '+name);
  assert(html.includes('href="/"'),'Full-page 3D route missing on '+name);
  assert(!html.includes('/project/plans/')&&!html.includes('/project/systems/'),'Deleted page route remains linked on '+name);
  assert(!html.includes('<iframe class="viewer"'),'Embedded 3D must be gone on '+name);
}
for(const route of ['/', '/project/inventory/', '/project/rigging/', '/project/references/']){
  assert(home.includes('href="'+route+'"'),'Table of contents missing '+route);
}
for(const path of ['dist/project/plans/index.html','dist/project/systems/index.html'])
  assert(!fs.existsSync(path),'Retired route must be entirely deleted: '+path);

assert(!inv.includes('type="file"')&&!inv.includes('inventoryFile')&&!inv.includes('inventoryExport'),'Inventory page must not require any uploads, downloads, or private JSON');
assert(inv.includes('Garmin ECHOMAP UHD2 63sv'),'Garmin record missing');
assert(inv.includes('Uniden UM725G'),'VHF reference missing');
assert(inv.includes('Renogy Rover 20 A'),'Solar controller missing');
assert(inv.includes('HIXIMI LiFePO₄'),'Battery reference missing');
assert(inv.includes('Suzuki DF15A'),'Outboard reference missing');
assert(inv.includes('12 L portable fuel tank'),'Tank reference missing');
assert(inv.includes('Ritchie Helmsman HF-743'),'Compass missing');
assert(inv.includes('BOSS MR632UAB'),'Stereo missing');
assert(inv.includes('Marine toilet / head'),'Plumbing reference missing');
assert(inv.includes('Mast and boom')||inv.includes('boom'),'Rigging references missing');
assert(inv.includes('www.uniden.info/download/ompdf/UM725om.pdf'),'VHF manual missing');
assert(inv.includes('renogy.com/content/RNG-CTRL-RVR20'),'MPPT manual missing');
assert(inv.includes('www.globalsuzuki.com/marine/'),'Suzuki model support missing');
assert(inv.includes('www8.garmin.com/manuals'),'Garmin manual missing');
assert((inv.match(/class="equipment-line"/g)||[]).length>=25,'Too few populated equipment references');
assert((inv.match(/class="equipment-category"/g)||[]).length===6,'Expected six organized equipment groups');
assert(!inv.includes('IMG_9079')&&!inv.includes('EL-001')&&!inv.includes('PROP-001'),'Owner-only inventory IDs or evidence must not be published');

const navigation=html=>html.match(/<header>.*?<\/header>/)?.[0].replaceAll(' aria-current="page"','').replaceAll(' >','>');
assert.equal(navigation(viewer),navigation(home),'3D viewer must use the project navigation');
assert(viewer.includes('href="/" aria-current="page"'),'3D navigation must mark the active route');
assert(viewer.includes('href="/project/project.css"'),'3D viewer must use the project shell styles');
assert(viewer.includes('id="focusPropulsion"'),'3D propulsion review control missing');
assert(viewer.includes('id="fullscreen" hidden'),'Fullscreen shortcut must remain hidden');
const app=read('dist/app.js');
assert(app.includes('buildAuxiliaryPropulsion()')&&app.includes('boat.pickables.push(...propulsion.pickables)'),'Selectable propulsion missing');
assert(app.includes('copy.add(propulsion.root.clone(true))'),'Visible-view GLB must include reference propulsion');
assert(css.includes('.equipment-line'),'Clean equipment styles missing');

for(const id of ['C5WdqdlB8Nc','l81rwc6-8SM','eiuZQyS6eXM'])
  assert(rig.includes('data-video="'+id+'"'),'Rigging video missing '+id);
assert(js.includes('www.youtube-nocookie.com/embed/'),'YouTube player missing');
assert(!js.includes('inventoryInput')&&!js.includes('FileReader')&&!js.includes('localStorage')&&!js.includes('fetch('),'No inventory data handling should remain');
assert(refs.includes('1977-owner_manual.pdf')&&refs.includes('1987-owner_manual.pdf'),'Factory references missing');
for(const [name,html] of [['home',home],['inventory',inv],['rigging',rig],['references',refs]]){
  for(const bad of ['IMG_9079.MOV','/mnt/data/','drive.google.com/drive/folders/','Catalina22_Private_Owner_Inventory'])
    assert(!html.includes(bad),'Private project data leaked into '+name);
}
console.log('Owner library tests passed: pre-populated manual list, no upload workflow, Systems/2D fully deleted, original 3D and rigging retained.');

const restoration=buildBoat({restoration:true});
const fitted=buildRestorationEquipment(restoration);
const selectable=new Set([...restoration.pickables,...fitted.pickables,...buildAuxiliaryPropulsion().pickables].map(mesh=>mesh.userData.partId));
const entries=[...inv.matchAll(/<article class="equipment-line" id="([a-z-]+)" data-view="(exterior|interior|section|locker)">([\s\S]*?)<\/article>/g)];
assert.equal(entries.length,27);
assert.equal(new Set(entries.map(([,id])=>id)).size,entries.length,'Every equipment entry needs a unique ID');
const offline=read('dist/downloads/Catalina22_Viewer_Offline.html');
for(const [entry,id,,content] of entries){
  assert(selectable.has(id),`No selectable 3D geometry for ${id}`);
  assert(content.includes(`href="/?part=${id}"`),`No model link for ${id}`);
  assert(offline.includes(entry),`Offline documentation missing for ${id}`);
}
console.log('All 27 inventory entries link to unique selectable parts, including in the standalone viewer.');
