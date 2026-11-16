import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {buildBoat,buildCabinStepCover} from '../dist/model.js';
import {buildAuxiliaryPropulsion,AUX_REFERENCE} from '../dist/propulsion.js';
const boat=buildBoat(),aux=buildAuxiliaryPropulsion();
assert.equal(Object.keys(boat.parts).length,19,'Accepted boat part count remains 19');
const ids=['aux-mount','aux-outboard','aux-tank','aux-fuel-line'];
assert.deepEqual(Object.keys(aux.parts),ids,'Reference propulsion uses four independent overlay parts');
assert.equal(AUX_REFERENCE.portableTankLiters,12);
assert.deepEqual(AUX_REFERENCE.portableTankOverallMeters,[.363,.230,.265]);
assert.deepEqual(AUX_REFERENCE.engineDryWeightKgRange,[44,49]);
assert.equal(AUX_REFERENCE.provisional,true);
assert(aux.pickables.length>12,'Build real engine/bracket/tank meshes, not only labels');
assert.equal(aux.labels.length,3);
aux.root.updateMatrixWorld(true);
const total=new THREE.Box3().setFromObject(aux.root);
assert(total.min.x< -3.7 && total.max.x < -2.0,'Auxiliary reference must be at the stern');
assert(total.min.z < -.50,'Engine and tank must be on port side as provisional study');
assert(total.max.x < 0,'No propulsion hardware should appear at the bow');
for(const id of ids){
 const g=aux.parts[id],b=new THREE.Box3().setFromObject(g),s=b.getSize(new THREE.Vector3());
 assert(!b.isEmpty(),id+' is empty');
 assert(s.toArray().every(n=>Number.isFinite(n)&&n>0),id+' has nonfinite geometry');
 assert(g.userData.provisional,id+' must be labeled provisional');
 for(const obj of aux.pickables.filter(o=>o.userData.partId===id)){
  assert(obj.material.emissive,'Clickable mesh needs inspector highlighting');
  const p=obj.geometry.getAttribute('position');
  assert([...p.array].every(Number.isFinite),'NaN in '+id);
 }
}
boat.root.updateMatrixWorld(true);
const lockerLid=boat.parts.cockpit.children.find(mesh=>mesh.geometry.parameters.width===1.32 && mesh.position.z<0);
const lockerBounds=new THREE.Box3().setFromObject(lockerLid);
const tankBounds=new THREE.Box3().setFromObject(aux.parts['aux-tank']);
assert(tankBounds.max.y<lockerBounds.min.y,'Tank must sit beneath the closed port locker lid');
for(const axis of ['x','z']){
 assert(tankBounds.min[axis]>=lockerBounds.min[axis] && tankBounds.max[axis]<=lockerBounds.max[axis],
  'Tank footprint must stay beneath the port locker lid');
}
const [internalHose,externalHose,primer]=aux.parts['aux-fuel-line'].children;
assert(new THREE.Box3().setFromObject(internalHose).max.y<lockerBounds.min.y,'Inboard hose must run below the locker lid');
assert(new THREE.Box3().setFromObject(externalHose).max.x< -boat.SPEC.hullLength/2,'External hose tail must stay aft of the transom');
assert(new THREE.Box3().setFromObject(primer).max.y<lockerBounds.min.y,'Primer must remain inboard below the locker lid');
const cover=buildCabinStepCover(boat.mats.deck);
const coverBounds=new THREE.Box3().setFromObject(cover);
assert.equal(cover.children[0].userData.partId,cover.name);
assert(coverBounds.min.y<.34 && coverBounds.max.y>.64 && coverBounds.max.y<.68,'Cover must span below the cockpit sill');
assert.equal(boat.root.getObjectByName(cover.name),undefined,'Cover belongs to the viewer fit-out');
assert.equal(boat.root.getObjectByName('aux-outboard'),undefined,'Do not mutate accepted boat root');
console.log('Auxiliary propulsion overlay: four selectable models, documented reference envelopes and boat geometry separation passed.');
