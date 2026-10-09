import crypto from 'node:crypto';
import * as THREE from '../dist/vendor/three.module.js';
import {buildBoat,SPEC} from '../dist/model.js';
export function snapshot(){
 const boat=buildBoat();boat.setKeel(100);boat.root.updateMatrixWorld(true);
 const parts={};let meshes=0,triangles=0;
 for(const [id,group] of Object.entries(boat.parts)){
  const records=[];group.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position,idx=o.geometry.index;triangles+=(idx?.count??p.count)/3;
   records.push({positions:Array.from(p.array),indices:idx?Array.from(idx.array):null,matrix:o.matrixWorld.toArray(),material:o.material.type});});
  const b=new THREE.Box3().setFromObject(group);
  parts[id]={geometrySha256:crypto.createHash('sha256').update(JSON.stringify(records)).digest('hex'),meshes:records.length,min:b.min.toArray(),max:b.max.toArray()};
 }
 return {version:1,units:'meters',axes:'+X bow; +Y up; +Z starboard; Y=0 nominal waterline',spec:SPEC,meshes,triangles,parts};
}
