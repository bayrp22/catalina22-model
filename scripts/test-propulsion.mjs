import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {buildBoat,buildCabinStepCover,restorationGalleyOffset} from '../dist/model.js';
import {buildRestorationEquipment} from '../dist/restoration.js';
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
const bracket=aux.parts['aux-mount'];
const board=bracket.getObjectByName('outboard-clamp-board');
const motor=aux.parts['aux-outboard'];
const boardToMotor=motor.position.clone().sub(board.getWorldPosition(new THREE.Vector3()));
const motorUp=motor.position.clone();
for(const lift of [0,25,50,75,100]){
 aux.setLift(lift);
 const fixedToBoard=motor.position.clone().sub(board.getWorldPosition(new THREE.Vector3()));
 assert(fixedToBoard.distanceTo(boardToMotor)<1e-9,'The motor must translate with the upright board');
 assert.equal(board.rotation.z,0,'The parallelogram must keep the board upright');
 const engineInlet=motor.position.clone().add(new THREE.Vector3(.142,.291,-.091));
 assert(externalHose.geometry.parameters.path.getPoint(1).distanceTo(engineInlet)<1e-8,'Hose must end at the moving motor');
 assert(new THREE.Box3().setFromObject(externalHose).max.x< -boat.SPEC.hullLength/2,'External hose must stay aft of the transom');
}
aux.setLift(0);
assert(motor.position.y<motorUp.y-.25 && motor.position.x<motorUp.x,'The lowered motor travels down and out');
assert(motorUp.y-.445>0 && motor.position.y-.445<0,'Propeller hub should cross the nominal model waterline');
aux.setLift(100);
console.log('Auxiliary propulsion overlay: four selectable models, documented reference envelopes and boat geometry separation passed.');

const restoration=buildBoat({restoration:true});
const {parts:fittings}=buildRestorationEquipment(restoration);
const locker=new THREE.Box3().setFromObject(restoration.parts.cockpit.children.find(mesh=>mesh.geometry.parameters.width===1.32 && mesh.position.z<0));
const battery=new THREE.Box3().setFromObject(fittings['house-battery']);
assert(battery.max.y<locker.min.y && battery.max.x<=locker.max.x && battery.min.z>=locker.min.z && battery.max.z<=locker.max.z);
assert(battery.min.x>tankBounds.max.x,'Battery and tank envelopes should be separated fore-and-aft in the study');
const facing=part=>new THREE.Vector3(1,0,0).applyQuaternion(part.quaternion).x;
assert(facing(fittings.chartplotter)<-.98 && facing(fittings.vhf)>.98,'The instruments must face opposite directions');
assert(fittings.chartplotter.position.y>fittings.vhf.position.y);
assert(fittings.chartplotter.position.z<0 && fittings.vhf.position.z<0);
const rec=restoration.parts.vberth.children;
const opening=fittings.toilet.position.clone().add(new THREE.Vector3(0,1,0));
const down=new THREE.Raycaster(opening,new THREE.Vector3(0,-1,0));
restoration.root.updateMatrixWorld(true);
assert(Math.abs(down.intersectObjects(rec)[0].point.y-.045)<1e-6,'The liner under the toilet should be recessed');
const galley=restoration.parts.galley;
const seat=restoration.parts.cockpit.children.find(mesh=>mesh.geometry.type==='ExtrudeGeometry');
const seatBounds=new THREE.Box3().setFromObject(seat);
for(const percent of [0,25,50,75,100]){
 galley.position.x=restorationGalleyOffset(percent);
 const b=new THREE.Box3().setFromObject(galley);
 assert(b.min.x<seatBounds.max.x && b.max.y<seatBounds.min.y,'Galley must slide below the seat');
 assert(percent===100?b.max.x<seatBounds.max.x:b.max.x>seatBounds.max.x,'Forward stop partly exposes the galley, aft stop stows it');
}
assert(restoration.parts.deck.children.length>boat.parts.deck.children.length,'Restoration deck must include seam closures');
assert(restoration.parts.cockpit.children.length>boat.parts.cockpit.children.length,'Restoration cockpit must include the forward returns');
console.log('Restoration coordinates, toilet recess, galley travel and cockpit closure checks passed.');

const rail=new THREE.Box3().setFromObject(fittings['stern-rail']);
const boardingStep=new THREE.Box3().setFromObject(fittings['boarding-ladder']);
assert(rail.min.z<0 && rail.max.z>0 && rail.max.y>.8,'Transverse rail spans the stern above the opening');
assert(boardingStep.min.z>0 && boardingStep.min.y<0 && boardingStep.min.x<-3.65,'Boarding platform and lower step belong on the starboard stern');
restoration.root.updateMatrixWorld(true);
const aftRay=z=>new THREE.Raycaster(new THREE.Vector3(-3.6,.61,z),new THREE.Vector3(1,0,0),0,.4);
assert.equal(aftRay(-.08).intersectObjects(restoration.parts.hull.children).length,0,'Transom boarding cutout should be open');
assert(aftRay(.46).intersectObjects(restoration.parts.hull.children).length>0,'Transom remains beside the cutout');
