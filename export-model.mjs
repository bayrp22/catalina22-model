import * as THREE from './dist/vendor/three.module.js';
import {GLTFExporter} from './dist/vendor/GLTFExporter.js';
import {buildBoat,SPEC} from './dist/model.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
globalThis.FileReader=class{async readAsArrayBuffer(b){this.result=await b.arrayBuffer();this.onloadend?.();}async readAsDataURL(b){this.result='data:'+b.type+';base64,'+Buffer.from(await b.arrayBuffer()).toString('base64');this.onloadend?.();}};
fs.mkdirSync('dist/downloads',{recursive:true});
const boat=buildBoat();boat.root.updateMatrixWorld(true);
const hb=new THREE.Box3().setFromObject(boat.parts.hull),size=hb.getSize(new THREE.Vector3());
assert(Math.abs(size.x-SPEC.hullLength)<.0005,'Hull length mismatch');assert(Math.abs(size.z-SPEC.beam)<.0005,'Beam mismatch');
for(const v of [0,25,50,75,100]){const draft=boat.setKeel(v);assert(Number.isFinite(draft));if(v===0)assert(Math.abs(draft-SPEC.draftUp)<.00001);if(v===100)assert(Math.abs(draft-SPEC.draftDown)<.00001);}
let triangles=0,meshes=0;boat.root.traverse(o=>{if(o.isMesh){meshes++;const p=o.geometry.attributes.position;assert([...p.array].every(Number.isFinite),'Nonfinite vertex '+o.name);assert(o.userData.partId in boat.parts,'Mesh without part metadata');triangles+=(o.geometry.index?.count??p.count)/3;}});
boat.setKeel(100);const glb=await new GLTFExporter().parseAsync(boat.root,{binary:true,onlyVisible:false});fs.writeFileSync('dist/downloads/Catalina22_Original.glb',Buffer.from(glb));
const data=Buffer.from(glb);assert(data.toString('ascii',0,4)==='glTF');const jsonLen=data.readUInt32LE(12),json=JSON.parse(data.toString('utf8',20,20+jsonLen));assert(json.nodes.length>20);assert(json.meshes.length===meshes);fs.writeFileSync('geometry-checks.json',JSON.stringify({hullMeters:size.toArray(),published:SPEC,meshes,triangles,parts:Object.keys(boat.parts),glbBytes:data.length},null,2));
console.log(JSON.stringify({meshes,triangles,hull:size.toArray(),glbBytes:data.length,checks:'passed'}));
