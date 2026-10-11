import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
import * as THREE from '../dist/vendor/three.module.js';
import {equipmentMesh,EQUIPMENT_KINDS,setEquipmentXray} from '../dist/equipment-mesh.js';
import {decodeProjectFragment} from '../dist/project-link.js';
import {emptyInventory,blankRecord,validateInventory,massCoverage,MAX_BYTES} from '../dist/inventory-data.js';
const hash=text=>'#inventory='+gzipSync(text).toString('base64url');
const doc=emptyInventory();doc.catalog=[blankRecord()];doc.catalog[0].massKg={min:2,max:3,basis:'synthetic range'};doc.catalog[0].modelPlacement.positionMeters=[-1,.5,-.5];
const other=blankRecord();other.id='OTHER';doc.catalog.push(other);
doc.placementProposals=[{id:'PROPOSAL',label:'Synthetic proposed structure',massKg:{min:100,max:100,basis:'synthetic'},positionMeters:[0,0,0]}];
assert.deepEqual(await decodeProjectFragment(hash(JSON.stringify(doc))),doc);
assert.equal(await decodeProjectFragment('#other'),null);await assert.rejects(()=>decodeProjectFragment('#inventory=invalid!'));
await assert.rejects(()=>decodeProjectFragment(hash(' '.repeat(MAX_BYTES+1))),/1 MB/);
await assert.rejects(()=>decodeProjectFragment(hash('{"format":"invalid"}')));
const c=massCoverage(doc);assert.deepEqual([c.min,c.max,c.known,c.unknown.length,c.sides.port.min,c.sides.starboard.max],[2,3,1,1,2,0]);
assert.equal(c.placed.unknown.length,0);assert.equal(c.placed.known,1,'No proposal mass in actual equipment accounting');
doc.catalog[0].quantity=null;assert.equal(massCoverage(doc).known,0,'Unknown quantities are not assumed one');doc.catalog[0].massScope='record-total';assert.equal(massCoverage(doc).known,1);
for(const kind of EQUIPMENT_KINDS){
 const mesh=equipmentMesh(kind,{length:.4,height:.3,width:.2});const b=new THREE.Box3().setFromObject(mesh),size=b.getSize(new THREE.Vector3());
 assert(size.x<=.400001&&size.y<=.300001&&size.z<=.200001,kind+' must fit its declared proxy envelope');
 mesh.traverse(o=>{if(o.isMesh){assert(o.geometry.attributes.position.array.every(Number.isFinite));assert(o.material.color);}});
 setEquipmentXray(mesh,true);mesh.traverse(o=>{if(o.isMesh)assert(!o.material.depthTest);});setEquipmentXray(mesh,false);mesh.traverse(o=>{if(o.isMesh)assert(o.material.depthTest);});
}
const bad=structuredClone(doc);bad.catalog[0].visualProxy={kind:'battery',basis:'synthetic',dimensionsMeters:{length:Infinity,height:.2,width:.3}};assert.throws(()=>validateInventory(bad));
console.log('Equipment passed: bounded fragment decoding, private roundtrip, non-averaged mass ranges/coverage, proposed-mass exclusion, finite bounded device proxies and X-ray toggling.');
