import assert from 'node:assert/strict';
import {buildBoat} from '../dist/model.js';
import {parseInventory,validateInventory,emptyInventory,blankRecord,hasDimensions,loadcaseSummary} from '../dist/inventory-data.js';
const parts=Object.keys(buildBoat().parts), fresh=()=>{const d=emptyInventory();d.catalog=[blankRecord()];return d;};
const rejects=mutate=>{const d=fresh();mutate(d);assert.throws(()=>validateInventory(d,parts));};
assert.deepEqual(parseInventory(JSON.stringify(emptyInventory()),parts),emptyInventory());
const d=fresh();d.catalog[0].extraEvidence={privateReference:'retained locally'};d.placementProposals=[{id:'proposal',positionMeters:null}];
assert.deepEqual(parseInventory(JSON.stringify(d),parts),d,'Metadata/proposals roundtrip');
rejects(d=>d.catalog.push({...d.catalog[0]}));rejects(d=>d.units='feet');rejects(d=>d.axes='wrong frame');
rejects(d=>d.catalog[0].quantity=0);rejects(d=>d.catalog[0].massKg.min=-1);rejects(d=>d.catalog[0].massKg={min:3,max:2});
rejects(d=>d.catalog[0].dimensionsMeters.length=-.1);rejects(d=>d.catalog[0].modelPlacement.positionMeters=[1,2,Infinity]);
rejects(d=>d.catalog[0].modelPlacement.parentPartId='imaginary');rejects(d=>d.catalog[0].centerOfMassMeters=[1,2]);
assert.throws(()=>parseInventory('{"format":"catalina22-inventory-layer","version":1,"units":"meters","axes":"+X bow, +Y up, +Z starboard, Y=0 nominal waterline","catalog":[],"__proto__":{}}'));
assert.throws(()=>parseInventory(' '.repeat(1000001)));
const a=blankRecord();a.id='A';a.includedInLoadcase=true;a.massKg={min:10,max:10,basis:'measured'};a.centerOfMassMeters=[-2,1,-1];a.centerOfMassBasis='survey';
const b=structuredClone(a);b.id='B';b.massKg.min=b.massKg.max=30;b.centerOfMassMeters=[2,0,1];
const doc=emptyInventory();doc.catalog=[a,b];const report=loadcaseSummary(doc);assert.equal(report.massKg,40);assert.deepEqual(report.centerOfMassMeters,[1,.25,.5]);
b.includedInLoadcase=false;assert.equal(loadcaseSummary(doc).massKg,10);b.includedInLoadcase=true;b.massKg.max=31;assert.equal(loadcaseSummary(doc).excluded.length,1);
b.massKg.max=30;b.centerOfMassMeters=null;assert.equal(loadcaseSummary(doc).excluded.length,1);
b.centerOfMassMeters=[2,0,1];b.quantity=4;delete b.massScope;assert.equal(loadcaseSummary(doc).massKg,10,'Ambiguous quantity cannot silently multiply mass');
b.massScope='record-total';assert.equal(loadcaseSummary(doc).massKg,40);b.massScope='per-unit';assert.equal(loadcaseSummary(doc).massKg,130);
b.quantity=null;b.massScope='per-unit';assert.equal(loadcaseSummary(doc).massKg,10,'Unknown quantity excluded');b.massScope='record-total';assert.equal(loadcaseSummary(doc).massKg,40);validateInventory(doc,parts);
assert.equal(loadcaseSummary(emptyInventory()).centerOfMassMeters,null);
a.dimensionsMeters={length:.3,width:.2,height:.1,basis:'documented',source:'datasheet'};assert.equal(hasDimensions(a),true);a.dimensionsMeters.source='';assert.equal(hasDimensions(a),false);
console.log('Inventory guards passed: private roundtrip, schema, quantities, unknowns, subset mass moments.');

// Exercise the actual overlay controller without a browser renderer or dependencies.
// This is a DOM contract test, not a WebGL/touch smoke test.
import * as THREE from '../dist/vendor/three.module.js';
import fs from 'node:fs';
import {createInventory} from '../dist/inventory.js';
class Element {
  constructor(tag='div') {this.tag=tag;this.children=[];this.value='';this.checked=false;this.attributes={};this.textContent='';}
  append(...children){this.children.push(...children);} prepend(...children){this.children.unshift(...children);}
  replaceChildren(...children){this.children=[...children];this.textContent='';}
  setAttribute(key,value){this.attributes[key]=value;} add(option){this.append(option);}
  showModal(){this.open=true;} close(){this.open=false;}
}
const ids=['inventoryMessage','inventoryDetail','inventoryToggle','inventoryList','inventorySearch','inventorySystem','inventoryCount','inventoryMass','inventoryEditor','inventoryEditorError','inventoryEditDialog','inventorySaveRecord','inventoryAdd','inventoryTemplate','inventoryImport','inventoryExport','inventoryClear'];
const html=fs.readFileSync('dist/index.html','utf8');for(const id of ids)assert(html.includes(`id="${id}"`),'HTML missing '+id);
const elements=new Map(ids.map(id=>['#'+id,new Element()]));elements.get('#inventoryToggle').checked=true;
globalThis.document={querySelector:selector=>elements.get(selector),createElement:tag=>new Element(tag)};
globalThis.Option=class extends Element{constructor(label,value){super('option');this.textContent=label;this.value=value;}};
const scene=new THREE.Scene(),boat=buildBoat();scene.add(boat.root);let saved,focused;
const controller=createInventory({scene,partIds:parts,download:content=>saved=JSON.parse(content),toast:()=>{},focus:bounds=>focused=bounds});
const el=id=>elements.get('#'+id);
el('inventoryExport').onclick();assert.equal(saved.catalog.length,0);
const fixture=emptyInventory();const unit=blankRecord();unit.id='TEST-DEVICE';unit.name='<img src=x onerror=alert(1)>';unit.dimensionsMeters={length:.3,width:.2,height:.1,basis:'synthetic test',source:'synthetic'};unit.modelPlacement.positionMeters=[-1,.5,-.4];unit.modelPlacement.rotationRadians=[0,0,0];fixture.catalog=[unit];fixture.privateExtras={value:'preserved'};
const importText=async text=>el('inventoryImport').onchange({target:{files:[{size:text.length,text:async()=>text}],value:'fixture.json'}});
await importText(JSON.stringify(fixture));assert.equal(controller.pickables.length,1);assert.equal(controller.pickables[0].geometry.type,'BoxGeometry');assert.deepEqual(controller.pickables[0].position.toArray(),[-1,.5,-.4]);
assert.equal(controller.pickables[0].geometry.parameters.width,.3);assert.equal(controller.pickables[0].geometry.parameters.height,.1);assert.equal(controller.pickables[0].geometry.parameters.depth,.2);
assert.equal(boat.root.getObjectByName('TEST-DEVICE'),undefined,'Inventory must not enter boat export root');
controller.select(unit.id);assert.equal(el('inventoryDetail').children[0].textContent,unit.name,'Private text remains literal');
el('inventoryDetail').children.find(e=>e.textContent==='Focus equipment').onclick();assert(!focused.isEmpty());
el('inventoryToggle').onchange({target:{checked:false}});assert.equal(scene.getObjectByName('private-equipment-overlay').visible,false);assert.equal(boat.root.visible,true);
el('inventoryExport').onclick();assert.deepEqual(saved,fixture);await importText('{"invalid":true}');el('inventoryExport').onclick();assert.deepEqual(saved,fixture,'Failed imports retain prior document');
el('inventoryDetail').children.find(e=>e.textContent==='Edit record').onclick();const modified=JSON.parse(el('inventoryEditor').value);modified.description='synthetic edit';el('inventoryEditor').value=JSON.stringify(modified);el('inventorySaveRecord').onclick();el('inventoryExport').onclick();assert.equal(saved.catalog[0].description,'synthetic edit');assert.deepEqual(saved.privateExtras,fixture.privateExtras);
el('inventoryClear').onclick();assert.equal(controller.pickables.length,0);el('inventoryExport').onclick();assert.equal(saved.catalog.length,0);
delete globalThis.document;delete globalThis.Option;
console.log('Overlay controller passed: HTML contract, actual scene/proxy, private text, import/edit/export, failed-import retention, toggle/clear.');
