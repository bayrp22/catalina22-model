import * as THREE from './vendor/three.module.js';
import { OrbitControls } from './vendor/OrbitControls.js';
import { GLTFExporter } from './vendor/GLTFExporter.js';
import { buildBoat, buildCabinStepCover, restorationGalleyOffset, cabinTrackPosition, SPEC, SOURCES } from './model.js';
import { createInventory } from './inventory.js';
import { buildAuxiliaryPropulsion } from './propulsion.js';
import { buildRestorationEquipment } from './restoration.js';
import { readEquipmentCatalog, showEquipmentDetails } from './equipment-inspector.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const host=$('#canvasHost'),view=$('#viewport');
let renderer;
try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:false});}
catch(e){$('#loader').hidden=true;$('#error').hidden=false;throw e;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor(0xf2f1eb);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;host.appendChild(renderer.domElement);
const scene=new THREE.Scene();scene.add(new THREE.HemisphereLight(0xf8faf5,0x94a89b,2.6));
const key=new THREE.DirectionalLight(0xfff8e7,3.6);key.position.set(2,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:30});key.shadow.bias=-.0004;key.shadow.normalBias=.024;scene.add(key);
const fill=new THREE.DirectionalLight(0xe6f2fa,1.6);fill.position.set(-4,4,-5);scene.add(fill);
const boat=buildBoat({restoration:true});scene.add(boat.root);
const cabinStepCover=buildCabinStepCover(boat.mats.deck);
boat.root.add(cabinStepCover);
boat.parts[cabinStepCover.name]=cabinStepCover;
boat.pickables.push(...cabinStepCover.children);
// Auxiliary fit-out is a separate provisional scene group; accepted hull meshes stay untouched.
const propulsion=buildAuxiliaryPropulsion();scene.add(propulsion.root);
Object.assign(boat.parts,propulsion.parts);boat.pickables.push(...propulsion.pickables);boat.labels.push(...propulsion.labels);
const fitted=buildRestorationEquipment(boat);
Object.assign(boat.parts,fitted.parts);
boat.pickables.push(...fitted.pickables);
const exteriorEquipment=['chartplotter','nav-dashboard','compass','solar-panel','running-rigging'];
let equipment=new Map();
const relatedEquipment={settee:'galley','port-lazarette':'cockpit','starboard-lazarette':'cockpit'};
const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0xf2f1eb,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.65;floor.receiveShadow=true;scene.add(floor);
const grid=new THREE.GridHelper(16,32,0xb6c2b9,0xd7ddd4);grid.position.y=-1.647;grid.material.transparent=true;grid.material.opacity=.46;scene.add(grid);
const perspective=new THREE.PerspectiveCamera(38,1,.01,100);const ortho=new THREE.OrthographicCamera(-5,5,5,-5,.01,100);let camera=perspective;camera.position.set(6,4.7,8);let controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.12,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.22;controls.maxDistance=30;controls.minZoom=.35;controls.maxZoom=35;controls.maxPolarAngle=Math.PI*.98;controls.screenSpacePanning=true;controls.update();
const cabinCamera=new THREE.PerspectiveCamera(62,1,.025,100);
const cabinLook={yaw:0,pitch:-.10,travel:0};
const cabinTarget=new THREE.Vector3();
const hatches=Object.fromEntries(Object.entries(boat.lazaretteLids).map(([side,lid])=>[side,{lid,open:false}]));
const groups=[{name:'Hull shell',ids:['hull'],color:'#c1c7b9'}, {name:'Deck & hardware',ids:['deck','trim'],color:'#ebe6d9'}, {name:'Cabin & windows',ids:['cabin'],color:'#8ba5a3'}, {name:'Cabin roof',ids:['roof'],color:'#d2d8c9'}, {name:'Cockpit & lockers',ids:['cockpit','port-lazarette','starboard-lazarette'],color:'#dedbd1'}, {name:'Cabin entry cover',ids:[cabinStepCover.name],color:'#dedbd1'}, {name:'Interior structure',ids:['sole','vberth','bulkheads','dinette','settee','trunk','companionway'],color:'#b4bfab'}, {name:'Dinette table',ids:['table'],color:'#af8962'}, {name:'Sliding galley',ids:['galley'],color:'#bb9670'}, {name:'Cushions',ids:['cushions'],color:'#688880'}, {name:'Keel & rudder',ids:['keel','rudder'],color:'#57747f'}, {name:'Mast & rigging',ids:['rig','boom'],color:'#9fadb5'}, {name:'Auxiliary propulsion · proposed',ids:['aux-mount','aux-outboard','aux-tank','aux-fuel-line'],color:'#be7b53'}, {name:'Restoration equipment',ids:Object.keys(fitted.parts).filter(id=>id!=='boom'),color:'#648588'}];
const state={mode:'section',view:'perspective',selected:null,labels:true,dimensions:false,wire:false,keel:100,galley:0,lift:100,isolated:false};let savedVisibility=null;let anim=null;
for(const [i,g]of groups.entries()){const label=document.createElement('label');label.className='toggle-row';label.innerHTML=`<span><i class="layer-dot" style="--dot:${g.color}"></i>${g.name}</span><input type="checkbox" data-layer="${i}"><b></b>`;$('#layers').append(label);label.querySelector('input').onchange=e=>{stopIsolation();g.ids.forEach(id=>boat.parts[id].visible=e.target.checked);syncLayers();};}
function syncLayers(){groups.forEach((g,i)=>{$(`[data-layer="${i}"]`).checked=g.ids.some(id=>boat.parts[id].visible);});}
function stopIsolation(){if(savedVisibility){Object.entries(savedVisibility).forEach(([id,val])=>boat.parts[id].visible=val);savedVisibility=null;}state.isolated=false;$('#restoreIsolation').hidden=true;}
function setMode(mode,notify=true){
 const wasInCabin=state.mode==='cabin';
 stopIsolation();state.mode=mode;
 const inCabin=mode==='cabin';
 view.dataset.mode=mode;
 controls.enabled=!inCabin;
 $('#cabinControls').hidden=!inCabin;
 if(inCabin){anim=null;camera=cabinCamera;resetCabinLook();}
 else if(wasInCabin){camera=controls.object;setView('perspective');anim=null;camera.position.copy(defaultPosition);controls.target.copy(defaultTarget);controls.update();}
 Object.values(boat.parts).forEach(p=>p.visible=true);boat.parts.rig.visible=false;boat.parts.boom.visible=false;boat.parts.cushions.visible=false;
 if(mode==='interior'||mode==='section'){for(const id of ['deck','cabin','roof','trim',...exteriorEquipment])boat.parts[id].visible=false;}
 cabinStepCover.visible=mode!=='interior';
 if(inCabin)boat.parts.cushions.visible=true;
 boat.hullUpper[1].visible=mode!=='section';boat.hullUpper[-1].visible=true;
 $$('.viewbar button').forEach(button=>{
  const active=button.dataset.mode===mode;
  button.classList.toggle('active',active);
  button.setAttribute('aria-pressed',String(active));
 });
 $('#footerMode').textContent=mode==='interior'?'OPEN INTERIOR':inCabin?'IN CABIN':mode.toUpperCase();$('#modeDescription').textContent=inCabin?'Drag to turn · scroll to move':mode==='section'?'Starboard shell cut away · interior dimensions provisional':mode==='interior'?'Deck and cabin hidden · restoration layout':'Original 1970s · swing-keel configuration';syncLayers();select(null);
 resize();
 if(wasInCabin&&!inCabin)fitBoat(false);
 if(notify&&!inCabin)toast(mode==='exterior'?'Exterior layers restored':mode==='interior'?'Deck, cabin and roof hidden':'Starboard upper hull removed for access');
}
$$('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$('#showAll').onclick=()=>{setMode(state.mode,false);$('#keelRange').value=100;setKeel(100);$('#galleyRange').value=0;setGalley(0);setLift(100);for(const side of Object.keys(hatches))setHatch(side,false);fitBoat();toast('Default layers and positions restored');};
const defaultPosition=new THREE.Vector3(6.2,4.8,8.5),defaultTarget=new THREE.Vector3(0,.12,0);
function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);perspective.aspect=w/h;perspective.updateProjectionMatrix();cabinCamera.aspect=w/h;cabinCamera.updateProjectionMatrix();ortho.left=-4.7*w/h;ortho.right=4.7*w/h;ortho.top=4.7;ortho.bottom=-4.7;ortho.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();
function switchCamera(next){if(next!==camera){const pos=camera.position.clone(),target=controls.target.clone();camera=next;camera.position.copy(pos);camera.up.set(0,1,0);controls.object=camera;controls.target.copy(target);controls.update();}resize();}
function transition(pos,target,duration=650){anim={start:performance.now(),duration,from:camera.position.clone(),to:pos.clone(),targetFrom:controls.target.clone(),targetTo:target.clone()};}
controls.addEventListener('start',()=>anim=null);
function setView(name){if(state.mode==='cabin')setMode('exterior',false);state.view=name;$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===name));switchCamera(name==='perspective'?perspective:ortho);camera.zoom=1;camera.updateProjectionMatrix();let pos;
 const t=new THREE.Vector3(0,.08,0);camera.up.set(0,1,0);
 if(name==='top'){camera.up.set(1,0,0);pos=new THREE.Vector3(0,12,0);}
 else if(name==='port')pos=new THREE.Vector3(0,.08,-12);
 else if(name==='starboard')pos=new THREE.Vector3(0,.08,12);
 else if(name==='bow')pos=new THREE.Vector3(12,.08,0);
 else if(name==='stern')pos=new THREE.Vector3(-12,.08,0);
 else pos=defaultPosition.clone();
 // Snap axis-aligned views: orbit interpolation can pass through a degenerate up vector.
 if(name!=='perspective'){anim=null;camera.position.copy(pos);controls.target.copy(t);controls.update();fitBoat(false);}else transition(pos,defaultTarget);
 $('#viewName').textContent=name==='perspective'?'PERSPECTIVE / ORBIT':name.toUpperCase()+' / ORTHOGRAPHIC';
}
$$('[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
function visibleBounds(){boat.root.updateMatrixWorld(true);const b=new THREE.Box3();boat.root.traverseVisible(o=>{if(o.isMesh){o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});propulsion.root.updateMatrixWorld(true);propulsion.root.traverseVisible(o=>{if(o.isMesh){o.geometry.computeBoundingBox();b.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});return b;}
function fitBounds(b,smooth=true){if(state.mode==='cabin'||b.isEmpty())return;const center=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3());const direction=camera.position.clone().sub(controls.target).normalize();if(camera.isPerspectiveCamera){const radius=size.length()/2;const angle=Math.min(THREE.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));const distance=radius/Math.sin(angle)*1.12;const p=center.clone().addScaledVector(direction,distance);if(smooth)transition(p,center);else{camera.position.copy(p);controls.target.copy(center);}}
 else{camera.updateMatrixWorld();const corners=[];for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])corners.push(new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));const cb=new THREE.Box3().setFromPoints(corners),s=cb.getSize(new THREE.Vector3());camera.zoom=Math.min((camera.right-camera.left)/Math.max(.01,s.x),(camera.top-camera.bottom)/Math.max(.01,s.y))*.76;camera.updateProjectionMatrix();camera.position.copy(center.clone().addScaledVector(direction,12));controls.target.copy(center);}controls.update();}
function fitBoat(smooth=true){fitBounds(visibleBounds(),smooth);}$('#fit').onclick=()=>fitBoat();
$('#focusPropulsion').onclick=()=>findPart('aux-tank');
$('#focusStern').onclick=()=>{
 if(matchMedia('(max-width:720px)').matches)toggleSidebar(false);
 resize();setMode('exterior',false);setView('perspective');anim=null;
 const sternBox=new THREE.Box3();
 for(const id of ['stern-rail','boarding-ladder','aux-mount','aux-outboard'])sternBox.expandByObject(boat.parts[id]);
 camera.position.set(-8,2.5,2.2);controls.target.copy(sternBox.getCenter(new THREE.Vector3()));
 fitBounds(sternBox,false);select('aux-mount');
};
function zoom(f){if(state.mode==='cabin')return;anim=null;if(camera.isPerspectiveCamera)camera.position.copy(controls.target.clone().add(camera.position.clone().sub(controls.target).multiplyScalar(f)));else{camera.zoom=THREE.MathUtils.clamp(camera.zoom/f,.35,35);camera.updateProjectionMatrix();}controls.update();}
$('#zoomIn').onclick=()=>zoom(.8);$('#zoomOut').onclick=()=>zoom(1.25);
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await view.requestFullscreen();}catch{toast('Fullscreen is not available in this browser');}};
function toggleSidebar(open){$('#sidebar').classList.toggle('collapsed',!open);$('#expand').hidden=open;}
$('#collapse').onclick=()=>toggleSidebar(false);$('#expand').onclick=()=>toggleSidebar(true);if(matchMedia('(max-width:720px)').matches)toggleSidebar(false);
function feet(m){const inches=Math.round(m/.0254);return `${Math.floor(inches/12)}′${inches%12}″`;}
function setKeel(v){state.keel=Number(v);const d=boat.setKeel(state.keel);$('#keelLabel').textContent=v==100?'Lowered':v==0?'Raised':`${Math.round(v)}% down`;$('#draftStatus').textContent=feet(d);}
function setGalley(v){state.galley=Number(v);boat.parts.galley.position.x=restorationGalleyOffset(state.galley);$('#galleyLabel').textContent=v==0?'In cabin':v==100?'Stowed aft':`${Math.round(v)}% aft`;}
$('#keelRange').oninput=e=>setKeel(e.target.value);$('#galleyRange').oninput=e=>setGalley(e.target.value);
function setLift(percent){
 state.lift=Number(percent);propulsion.setLift(state.lift);
 const label=state.lift===0?'Lowered':state.lift===100?'Raised':`${state.lift}% raised`;
 for(const [range,output] of [['liftRange','liftLabel'],['inspectLiftRange','inspectLiftLabel']]){
  $('#'+range).value=state.lift;$('#'+output).textContent=label;
 }
}
for(const range of ['liftRange','inspectLiftRange'])$('#'+range).oninput=e=>setLift(e.target.value);
function updateCabinLook(yaw,pitch){
 cabinLook.yaw=THREE.MathUtils.euclideanModulo(yaw+Math.PI,Math.PI*2)-Math.PI;
 cabinLook.pitch=THREE.MathUtils.clamp(pitch,-.75,.55);
 const {yaw:heading,pitch:tilt}=cabinLook;
 const eye=cabinTrackPosition(cabinLook.travel,cabinCamera.position);
 cabinTarget.set(Math.cos(tilt)*Math.cos(heading),Math.sin(tilt),Math.cos(tilt)*Math.sin(heading));
 cabinCamera.lookAt(cabinTarget.add(eye));
 cabinCamera.updateMatrixWorld();
}
function setCabinTravel(progress){
 cabinLook.travel=THREE.MathUtils.clamp(progress,0,1);
 const track=$('#cabinTravel');
 track.value=cabinLook.travel*1000;
 const position=cabinLook.travel===0?'Cabin entry':cabinLook.travel===1?'V-berth':'Cabin aisle';
 track.setAttribute('aria-valuetext',position);
 $('#viewName').textContent=`IN CABIN / ${position.toUpperCase()}`;
 updateCabinLook(cabinLook.yaw,cabinLook.pitch);
}
function resetCabinLook(){
 cabinLook.yaw=0;cabinLook.pitch=-.10;
 setCabinTravel(0);
}
$('#resetCabinLook').onclick=resetCabinLook;
$('#lookAft').onclick=()=>updateCabinLook(Math.PI,-.14);
$('#cabinTravel').oninput=e=>setCabinTravel(Number(e.target.value)/1000);
function hatchSide(id){return Object.keys(hatches).find(side=>hatches[side].lid.name===id);}
function setHatch(side,open){
 const hatch=hatches[side];
 hatch.open=open;
 $(`[data-hatch="${side}"]`).setAttribute('aria-pressed',String(open));
 if(state.selected===hatch.lid.name)$('#toggleSelectedHatch').textContent=open?'Close hatch':'Open hatch';
}
function toggleHatch(side){setHatch(side,!hatches[side].open);}
for(const button of $$('[data-hatch]'))button.onclick=()=>{
 if(state.mode==='cabin'||!boat.parts.cockpit.visible||!hatches[button.dataset.hatch].lid.visible)setMode('exterior',false);
 toggleHatch(button.dataset.hatch);
};
$('#toggleSelectedHatch').onclick=()=>toggleHatch(hatchSide(state.selected));
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const inventory = createInventory({scene, partIds:Object.keys(boat.parts), download, toast, focus:fitBounds});
function effectiveVisible(o){while(o){if(!o.visible)return false;o=o.parent;}return true;}
function select(id){
 state.selected=id;
 $('#selection').hidden=!id;
 const side=hatchSide(id);
 $('#toggleSelectedHatch').hidden=!side;
 if(side)$('#toggleSelectedHatch').textContent=hatches[side].open?'Close hatch':'Open hatch';
 $('#liftInspector').hidden=id!=='aux-mount'&&id!=='aux-outboard';
 boat.pickables.forEach(m=>{m.material.emissive.setHex(m.userData.partId===id?0x244e3b:0x000000);m.material.emissiveIntensity=.28;});
 if(!id)return;
 const part=boat.parts[id],record=equipment.get(relatedEquipment[id]??id);
 $('#partName').textContent=relatedEquipment[id]?part.userData.name:(record?.name??part.userData.name??id);
 $('#partConfidence').textContent=record?.purpose??part.userData.confidence??'Visual model envelope';
 $('#partDescription').textContent=side?part.userData.description:(record?.notes??part.userData.description??'Equipment reference');
 const bounds=new THREE.Box3().setFromObject(part).getSize(new THREE.Vector3());
 $('#partSize').textContent=record?'':`Model bounds: ${bounds.x.toFixed(2)} × ${bounds.z.toFixed(2)} × ${bounds.y.toFixed(2)} m (L × W × H).`;
 $('#partSize').hidden=Boolean(record);
 const detail=$('#equipmentDetails');detail.hidden=!record;showEquipmentDetails(detail,record);
}
function findPart(id){
 const record=equipment.get(id);
 if(!record||!boat.parts[id])return;
 if(matchMedia('(max-width:720px)').matches)toggleSidebar(false);
 resize();
 const fuelTank=id==='aux-tank';
 setMode(fuelTank?'exterior':record.view==='locker'?'section':record.view,false);
 if(fuelTank)setHatch('port',true);
 else if(record.view==='locker'){
  for(const id of ['cockpit','port-lazarette','starboard-lazarette'])boat.parts[id].visible=false;
 }
 if(id==='galley'){$('#galleyRange').value=0;setGalley(0);}
 if(id==='boom')boat.parts.rig.visible=true;
 boat.parts[id].visible=true;
 syncLayers();
 setView('perspective');anim=null;
 const subject=new THREE.Box3().setFromObject(boat.parts[id]);
 const center=subject.getCenter(new THREE.Vector3());
 const direction=fuelTank?[.20,3,1.15]:id==='vhf'?[2,1.28,1]:record.view==='exterior'?[-2,.95,-1.5]:[1,2,2];
 if(id==='boarding-ladder'||id==='transducer'||id==='stern-rail')direction[2]=1.5;
 if(id==='rudder')direction[2]=.75;
 camera.position.copy(center).add(new THREE.Vector3(...direction));
 controls.target.copy(center);
 // A minimum frame keeps the surrounding mount or compartment visible around small devices.
 fitBounds(subject.union(new THREE.Box3().setFromCenterAndSize(center,new THREE.Vector3(.95,.68,.8))),false);
 if(matchMedia('(max-width:720px)').matches){
  camera.updateMatrixWorld();
  const frameHeight=2*camera.position.distanceTo(controls.target)*Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  const offset=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1).multiplyScalar(-.17*frameHeight);
  camera.position.add(offset);controls.target.add(offset);controls.update();
 }
 select(id);
}
const equipmentPicker=$('#findEquipment');
equipmentPicker.onchange=()=>{findPart(equipmentPicker.value);equipmentPicker.selectedIndex=0;};
readEquipmentCatalog().then(records=>{
 equipment=records;
 for(const [id,record] of records){
  if(!boat.parts[id])continue;
  const option=new Option(record.name,id);equipmentPicker.add(option);
  const part=boat.parts[id];part.userData.name=record.name;
 }
 equipmentPicker.disabled=false;
 if(state.selected)select(state.selected);
 const requested=new URLSearchParams(window.location.search).get('part');
 if(requested)findPart(requested);
}).catch(()=>{equipmentPicker.options[0].textContent='Equipment details unavailable';});
const canvas=renderer.domElement;
let drag=null;
canvas.addEventListener('wheel',e=>{
 if(state.mode!=='cabin'||e.ctrlKey)return;
 e.preventDefault();
 const units=e.deltaMode===1?16:e.deltaMode===2?host.clientHeight:1;
 setCabinTravel(cabinLook.travel+e.deltaY*units/950);
},{passive:false});
canvas.addEventListener('pointerdown',e=>{
 if(!e.isPrimary||e.button!==0)return;
 drag={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:cabinLook.yaw,pitch:cabinLook.pitch};
 if(state.mode==='cabin')canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove',e=>{
 if(state.mode!=='cabin'||drag?.id!==e.pointerId)return;
 updateCabinLook(drag.yaw-(e.clientX-drag.x)*.005,drag.pitch+(e.clientY-drag.y)*.005);
});
canvas.addEventListener('pointercancel',e=>{if(drag?.id===e.pointerId)drag=null;});
canvas.addEventListener('pointerup',e=>{
 if(!drag||drag.id!==e.pointerId)return;
 const start=drag;drag=null;
 if(Math.hypot(e.clientX-start.x,e.clientY-start.y)>5||e.button!==0)return;
 const rect=canvas.getBoundingClientRect();
 pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects([...boat.pickables,...inventory.pickables].filter(effectiveVisible),false)[0];
 if(hit?.object.userData.inventoryId){select(null);inventory.select(hit.object.userData.inventoryId);return;}
 inventory.select(null);
 const id=hit?.object.userData.partId;
 const side=hatchSide(id);
 if(side)toggleHatch(side);
 select(id??null);
});
$('#clearSelection').onclick=()=>{stopIsolation();syncLayers();select(null);};$('#focusPart').onclick=()=>{if(state.selected)fitBounds(new THREE.Box3().setFromObject(boat.parts[state.selected]));};$('#hidePart').onclick=()=>{if(state.selected){boat.parts[state.selected].visible=false;select(null);syncLayers();toast('Part hidden. Restore it with the layer controls.');}};
$('#isolatePart').onclick=()=>{if(!state.selected)return;stopIsolation();savedVisibility=Object.fromEntries(Object.entries(boat.parts).map(([id,g])=>[id,g.visible]));Object.entries(boat.parts).forEach(([id,g])=>g.visible=id===state.selected);state.isolated=true;$('#restoreIsolation').hidden=false;syncLayers();fitBounds(new THREE.Box3().setFromObject(boat.parts[state.selected]));};$('#restoreIsolation').onclick=()=>{stopIsolation();syncLayers();fitBoat();};
boat.labels.push({id:'chartplotter',text:'Garmin chartplotter',position:new THREE.Vector3(-.045,.075,0)},
 {id:'toilet',text:'Marine toilet',position:new THREE.Vector3(0,.38,0)});
const labelItems=[];for(const item of boat.labels){const b=document.createElement('button');b.className='part-label';b.textContent=item.text;b.onclick=()=>select(item.id);$('#labelLayer').append(b);labelItems.push({...item,element:b});}
const dims=new THREE.Group();scene.add(dims);dims.visible=false;
function dimension(a,b,title,offset){const mat=new THREE.LineBasicMaterial({color:0x719283,transparent:true,opacity:.85});const points=[new THREE.Vector3(...a),new THREE.Vector3(...b)];dims.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),mat));const dir=points[1].clone().sub(points[0]).normalize();for(const p of points){const off=new THREE.Vector3(...offset);dims.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([p.clone().sub(off),p.clone().add(off)]),mat));}const el=document.createElement('span');el.className='part-label';el.style.pointerEvents='none';el.textContent=title;$('#labelLayer').append(el);return {element:el,position:points[0].clone().lerp(points[1],.5)};}
const dimensionLabels=[dimension([-3.2766,-.02,1.65],[3.2766,-.02,1.65],'HULL 6.55 m / 21′6″',[0,0,.10]),dimension([-3.95,-.02,-1.1684],[-3.95,-.02,1.1684],'BEAM 2.34 m / 7′8″',[.1,0,0]),dimension([-.3,0,-1.50],[-.3,-1.524,-1.50],'LOWERED DRAFT 1.52 m / 5′0″',[.10,0,0])];
const waterline=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-3.20,0,-1.46),new THREE.Vector3(-3.20+SPEC.waterline,0,-1.46)]),new THREE.LineDashedMaterial({color:0x61998e,dashSize:.12,gapSize:.08}));waterline.computeLineDistances();dims.add(waterline);
$('#labelsToggle').onchange=e=>state.labels=e.target.checked;$('#dimsToggle').onchange=e=>{state.dimensions=e.target.checked;dims.visible=state.dimensions;};$('#gridToggle').onchange=e=>grid.visible=e.target.checked;$('#wireToggle').onchange=e=>{state.wire=e.target.checked;boat.pickables.forEach(m=>m.material.wireframe=state.wire);};
let lastLabelTime=0;function updateLabels(t){if(t-lastLabelTime<75)return;lastLabelTime=t;camera.updateMatrixWorld();const w=host.clientWidth,h=host.clientHeight;const auxLabels=['aux-mount','aux-outboard','aux-tank'];const allowed=state.mode==='exterior'?['cabin','cockpit','chartplotter','keel','rudder',...auxLabels]:['vberth','dinette','settee','galley','toilet','trunk','cockpit',...auxLabels];const used=[];
 const project=(p)=>p.clone().project(camera);
 for(const it of labelItems){let visible=state.mode!=='cabin'&&state.labels&&boat.parts[it.id].visible&&(allowed.includes(it.id)||state.selected===it.id);const point=it.position.clone().add(boat.parts[it.id].position);const p=project(point);const x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;
 visible=visible&&p.z<1&&p.z>-1&&x>40&&x<w-55&&y>130&&y<h-115;
 if(visible&&!state.isolated){const dir=point.clone().sub(camera.position),distance=dir.length();raycaster.set(camera.position,dir.normalize());const hit=raycaster.intersectObjects(boat.pickables.filter(effectiveVisible),false)[0];if(hit&&hit.distance<distance-(it.id==='aux-tank'?.025:.23)&&hit.object.userData.partId!==it.id)visible=false;}
 if(visible){for(const u of used)if(Math.abs(x-u.x)<110&&Math.abs(y-u.y)<31)visible=false;}
 it.element.hidden=!visible;if(visible){it.element.style.left=x+'px';it.element.style.top=y+'px';used.push({x,y});}
 }
 for(const it of dimensionLabels){const p=project(it.position);it.element.hidden=state.mode==='cabin'||!state.dimensions||p.z< -1||p.z>1;it.element.style.left=(p.x*.5+.5)*w+'px';it.element.style.top=(-p.y*.5+.5)*h+'px';}
}
let toastTimer;function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2800);}
for(const source of SOURCES){const li=document.createElement('li'),a=document.createElement('a');a.textContent=source.title;a.href=source.url;a.target='_blank';a.rel='noopener';li.append(a);$('#sourcesList').append(li);}
$('#sourcesBtn').onclick=$('#accuracyBtn').onclick=()=>$('#notesDialog').showModal();$('#downloadBtn').onclick=()=>$('#exportDialog').showModal();$$('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
function download(data,name,type){const blob=data instanceof Blob?data:new Blob([data],{type});const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),30000);}
$('#exportCurrent').onclick=async()=>{const btn=$('#exportCurrent');btn.disabled=true;try{select(null);const copy=boat.root.clone(true);copy.add(propulsion.root.clone(true));copy.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.wireframe=false;}});const data=await new GLTFExporter().parseAsync(copy,{binary:true,onlyVisible:true});download(data,'Catalina22_Outfitted_Reference_View.glb','model/gltf-binary');toast('Visible model exported');}catch(e){toast('Export failed: '+e.message);}finally{btn.disabled=false;}};
function serialize(){return {format:'catalina22-model-view',version:1,mode:state.mode,view:state.view,camera:{position:camera.position.toArray(),target:(state.mode==='cabin'?cabinTarget:controls.target).toArray(),zoom:camera.zoom},visible:Object.fromEntries(Object.entries(boat.parts).map(([id,g])=>[id,g.visible])),keel:state.keel,galley:state.galley,lift:state.lift,hatches:Object.fromEntries(Object.entries(hatches).map(([side,hatch])=>[side,hatch.open])),cabinLook:{...cabinLook},labels:state.labels,dimensions:state.dimensions,grid:grid.visible,wire:state.wire};}
$('#saveView').onclick=()=>{download(JSON.stringify(serialize(),null,2),'Catalina22_View.json','application/json');toast('View settings saved');};
$('#importView').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>100000)throw Error('File too large');const d=JSON.parse(await file.text());if(d.format!=='catalina22-model-view'||d.version!==1)throw Error('This is not a saved 3D viewer file');if(!['exterior','interior','section','cabin'].includes(d.mode)||!['perspective','top','port','starboard','bow','stern'].includes(d.view))throw Error('Invalid view mode');const vec=v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<1000);if(!vec(d.camera?.position)||!vec(d.camera?.target)||!Number.isFinite(d.camera.zoom)||d.camera.zoom<=0||d.camera.zoom>100)throw Error('Invalid camera');for(const v of [d.keel,d.galley,d.lift??100])if(!Number.isFinite(v)||v<0||v>100)throw Error('Invalid moving-part setting');setMode(d.mode,false);if(d.mode==='cabin'){
 const {yaw,pitch,travel}=d.cabinLook??{};
 if(Number.isFinite(travel))setCabinTravel(travel);
 if(Number.isFinite(yaw)&&Number.isFinite(pitch))updateCabinLook(yaw,pitch);
 }else{
 setView(d.view);anim=null;camera.position.fromArray(d.camera.position);controls.target.fromArray(d.camera.target);camera.zoom=d.camera.zoom;camera.updateProjectionMatrix();controls.update();
 }
 for(const side of Object.keys(hatches))setHatch(side,d.hatches?.[side]===true);Object.entries(d.visible||{}).forEach(([id,v])=>{if(boat.parts[id]&&typeof v==='boolean')boat.parts[id].visible=v;});setKeel(d.keel);setGalley(d.galley);setLift(d.lift??100);$('#keelRange').value=d.keel;$('#galleyRange').value=d.galley;for(const [key,id]of [['labels','labelsToggle'],['dimensions','dimsToggle'],['grid','gridToggle'],['wire','wireToggle']]){if(typeof d[key]==='boolean'){const input=$('#'+id);input.checked=d[key];input.dispatchEvent(new Event('change'));}}syncLayers();$('#exportDialog').close();toast('View restored');}catch(err){toast(err.message);}finally{e.target.value='';}};
window.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||$('dialog[open]'))return;if(e.key.toLowerCase()==='f')fitBoat();if(e.key==='Escape'){stopIsolation();syncLayers();select(null);}if(e.key==='1')setMode('exterior');if(e.key==='2')setMode('interior');if(e.key==='3')setMode('section');if(e.key==='4')setMode('cabin');});
setMode('section',false);setKeel(100);setGalley(0);resize();fitBoat(false);$('#loader').hidden=true;
function animate(t){if(anim){const a=Math.min(1,(t-anim.start)/anim.duration),k=1-Math.pow(1-a,3);camera.position.lerpVectors(anim.from,anim.to,k);controls.target.lerpVectors(anim.targetFrom,anim.targetTo,k);if(a>=1)anim=null;}if(state.mode!=='cabin')controls.update();
 for(const [side,{lid,open}] of Object.entries(hatches)){
  const target=open?(side==='port'?-1:1)*1.42:0;
  const delta=target-lid.rotation.x;
  lid.rotation.x=Math.abs(delta)<.003?target:lid.rotation.x+delta*.20;
 }
 updateLabels(t);renderer.render(scene,camera);requestAnimationFrame(animate);}requestAnimationFrame(animate);
