import fs from 'node:fs';
import assert from 'node:assert/strict';
const p=f=>fs.readFileSync('dist/project/'+f+'/index.html','utf8');
const home=fs.readFileSync('dist/project/index.html','utf8');
const viewer=fs.readFileSync('dist/index.html','utf8');
const js=fs.readFileSync('dist/project/project.js','utf8');
const css=fs.readFileSync('dist/project/project.css','utf8');
const pages=['inventory','systems','rigging','references'];
for(const page of pages){
 const source=p(page);
 assert(source.includes('href="/project/project.css"'),'Missing shared style on '+page);
 assert(source.includes('src="/project/project.js"'),'Missing shared JS on '+page);
 assert(source.includes('href="/"'),'3D model must link to direct full viewer in same tab on '+page);
 assert(!source.includes('<iframe class="viewer"'),'No embedded 3D viewer on '+page);
}
for(const path of ['/','/project/inventory/','/project/systems/','/project/rigging/','/project/references/'])
 assert(home.includes('href="'+path+'"'),'Missing home table-of-contents link: '+path);
assert(!home.includes('<iframe'),'Table of contents must not embed the boat');
assert(!home.includes('id="documents"')&&!home.includes('ownerPdf'),'Deliverables/private files section must be removed');
assert(!home.includes('/project/plans/'),'No 2D page entry on contents');
assert(viewer.includes('href="/project/"'),'3D viewer should link back to contents');
assert(viewer.includes('id="fullscreen" hidden'),'Fullscreen shortcut must remain hidden');
assert(viewer.includes('id="focusPropulsion"'),'Missing physical 3D propulsion control');
const app=fs.readFileSync('dist/app.js','utf8');
assert(app.includes('buildAuxiliaryPropulsion()')&&app.includes('boat.pickables.push(...propulsion.pickables)'),'3D propulsion must be selectable and visible');
assert(app.includes('copy.add(propulsion.root.clone(true))'),'Current-view GLB must include visible proposed motor/tank');
const inv=p('inventory');
assert(inv.includes('id="inventoryFile"')&&inv.includes('id="inventoryRows"')&&inv.includes('id="inventoryMissing"'),'Inventory dossier sections missing');
assert(inv.includes('www.uniden.info/download/ompdf/UM725om.pdf'),'Product manuals must be linked');
assert(js.includes("catalina22-inventory-layer")&&js.includes('docsFor('),'Missing private JSON / manual processing');
assert(js.includes('URL.createObjectURL(f)')&&js.includes('downloadJSON('),'Local import/export must be present');
assert(!js.includes('fetch(')&&!js.includes('localStorage'),'Private inventory must not upload or persist on server or browser automatically');
const rig=p('rigging');
for(const id of ['C5WdqdlB8Nc','l81rwc6-8SM','eiuZQyS6eXM'])assert(rig.includes('data-video="'+id+'"'),'Rigging video missing: '+id);
assert(js.includes('www.youtube-nocookie.com/embed/'),'Video player missing');
assert(p('references').includes('1977-owner_manual.pdf')&&p('references').includes('1987-owner_manual.pdf'),'Factory document references missing');
assert(!fs.existsSync('dist/project/plans/index.html'),'Retired 2D route must be deleted entirely');
for(const file of ['dist/project/index.html',...pages.map(x=>'dist/project/'+x+'/index.html'),'dist/project/project.css','dist/project/project.js']){
 const s=fs.readFileSync(file,'utf8');
 for(const privateName of ['IMG_9079.MOV','Catalina22_Private_Owner_Inventory','/mnt/data/','https://drive.google.com/drive/folders/'])
 assert(!s.includes(privateName),'Private project artifact accidentally included in '+file);
}
assert(css.includes('.toc-item')&&css.includes('.inv-record'),'Multi-page styles not available');
const sys=p('systems');
assert(sys.includes('12 L reference')&&sys.includes('transom bracket')&&sys.includes('3–6 HP'),'Systems page must cover real fuel/reference and historic engine warning');
const inventory=p('inventory');
assert(inventory.includes('www.suzuki.ca/product/fuel-tank'),'Tank technical documents missing');
for(const page of [home,...pages.map(p),js])assert(!page.includes('/project/plans/'),'Obsolete 2D page still linked');
assert(!js.includes('planFile')&&!js.includes('planImage'),'Obsolete 2D image importer still included');
console.log('Owner library checks passed: 2D page deleted; full 3D model with proposed propulsion; independent inventory, systems, mast and references pages.');
