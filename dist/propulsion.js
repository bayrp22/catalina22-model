import * as THREE from './vendor/three.module.js';

// Generic optional auxiliary-propulsion study — not part of accepted factory boat mesh.
// This is a reference-scale external outboard plus a portable tank. Actual equipment
// identification, mounting approval, fuel storage and measured placement remain private.
export const AUX_REFERENCE = Object.freeze({
  engineClassHp: 15,
  engineOverallMeters: [0.662,1.220,0.336], // length X, overall height Y (long reference), width Z
  engineDryWeightKgRange: [44,49], // shaft/starting variants; NOT a measured mass or CoM
  portableTankLiters: 12,
  portableTankOverallMeters: [0.363,0.230,0.265], // L x H x W; OEM family example
  provisional: true
});

const mat=(color,metalness=0,roughness=.55)=>new THREE.MeshStandardMaterial({
  color,roughness,metalness,emissive:0x000000,emissiveIntensity:.28
});
export function buildAuxiliaryPropulsion(){
  const root=new THREE.Group();
  root.name='Optional auxiliary propulsion (provisional installation)';
  root.userData.notFactoryGeometry=true;
  const parts={},pickables=[],labels=[];
  const steel=mat(0xb1bfbe,.76,.33),darkSteel=mat(0x5a6b70,.65,.36),wood=mat(0x9e8968,.06,.69),
    cowling=mat(0x1f313b,.14,.27),cowlingTop=mat(0x334953,.13,.34),
    shaft=mat(0x6f7a83,.32,.36),propMetal=mat(0x83969a,.72,.27),
    fuelRed=mat(0xb95345,.06,.59),fuelBlack=mat(0x232d2d,.09,.70),hoseRubber=mat(0x354b44,.03,.9);
  function part(id,name,confidence,description,position){
    const group=new THREE.Group();group.name=id;group.userData={id,name,confidence,description,provisional:true};
    group.position.set(...position);root.add(group);parts[id]=group;return group;
  }
  function mesh(group,geometry,material,xyz=[0,0,0],rotation=null){
    const m=new THREE.Mesh(geometry,material);m.position.set(...xyz);if(rotation)m.rotation.set(...rotation);
    m.castShadow=true;m.receiveShadow=true;group.add(m);m.userData.partId=group.userData.id;pickables.push(m);return m;
  }
  const box=(group,dim,material,xyz,rotation=null)=>mesh(group,new THREE.BoxGeometry(...dim),material,xyz,rotation);
  function rod(group,a,b,r,material){
    const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
    const m=mesh(group,new THREE.CylinderGeometry(r,r,v.length(),10),material);
    m.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;
  }
  const bracket=part('aux-mount','Proposed transom motor bracket','Not surveyed • reinforcement and load rating unknown',
    'Illustrative adjustable-style external mounting bracket at the port aft transom. No bracket model, fastener design, reinforcement, dynamic-load rating, shaft height or transom capacity has been verified. DO NOT build or mount to this geometry.',
    [-3.265,.50,-.77]);
  // Small backplate, 2 struts and isolated outer wooden clamp board.
  box(bracket,[.040,.32,.32],steel,[.012,0,0]);
  box(bracket,[.068,.28,.31],wood,[-.405,-.025,0]);
  for(const z of [-.112,.112]){
    rod(bracket,[-.015,.118,z],[-.385,.075,z],.022,steel);
    rod(bracket,[-.015,-.110,z],[-.385,-.100,z],.022,darkSteel);
    rod(bracket,[-.015,-.110,z],[-.385,.075,z],.014,steel);
    for(const y of [-.102,.105])mesh(bracket,new THREE.SphereGeometry(.025,12,8),darkSteel,[.032,y,z]);
  }
  // Separate visible motor; shaft variant and attachment geometry are illustrative.
  const motor=part('aux-outboard','Reference 15 HP four-stroke outboard','Envelope reference • actual variant unverified',
    '15 HP external outboard represented by a generic mesh. Published model family overall dimensions approx. 0.662 L × 0.336 W × 1.220 H m (long-shaft example), dry mass 44–49 kg across variants excluding fluids/accessories. Actual shaft, electric/manual start, motor mass center, tilt travel, prop/rudder clearance and mounting location require inspection.',
    [-3.685,.14,-.77]);
  // Mesh fits the reference class envelope but is not original manufacturer CAD.
  const cowl=mesh(motor,new THREE.SphereGeometry(1,20,12),cowling,[-.02,.425,0]);
  cowl.scale.set(.270,.175,.163);
  box(motor,[.440,.225,.317],cowling,[-.018,.345,0]);
  box(motor,[.424,.020,.314],cowlingTop,[-.014,.474,0]);
  box(motor,[.115,.045,.292],darkSteel,[-.018,.243,0]); // cowling seam
  box(motor,[.30,.09,.18],shaft,[.024,.185,0]);
  rod(motor,[.02,.14,0],[.045,-.37,0],.068,shaft);
  mesh(motor,new THREE.SphereGeometry(1,16,12),shaft,[.030,-.364,0]).scale.set(.12,.12,.118);
  // Lower gear housing, anti-ventilation plate and skeg.
  box(motor,[.305,.023,.315],propMetal,[-.042,-.355,0]);
  const gear=mesh(motor,new THREE.SphereGeometry(1,14,9),shaft,[-.060,-.439,0]);
  gear.scale.set(.171,.067,.082);
  const skeg=mesh(motor,new THREE.ConeGeometry(.075,.16,3),shaft,[-.030,-.535,0]);
  skeg.rotation.set(0,0,Math.PI); // illustrative fin, not an OEM shape
  const hub=mesh(motor,new THREE.CylinderGeometry(.035,.035,.11,12),propMetal,[-.225,-.445,0],[0,0,Math.PI/2]);
  for(let i=0;i<3;i++){
    const a=i*2*Math.PI/3;
    const blade=box(motor,[.018,.124,.048],propMetal,[-.259,-.445+Math.cos(a)*.070,Math.sin(a)*.070],[a,0,0]);
  }
  // Tiller points into the cockpit; check real steering swing clearance.
  rod(motor,[.13,.15,0],[.328,.03,0],.022,darkSteel);
  rod(motor,[.29,.05,0],[.33,.025,0],.030,fuelBlack);
  // Standard 12 L portable tank dimensions: 0.363 × 0.265 × 0.230 m (L × W × H).
  // Placement on aft port cockpit seat is only a VISIBLE staging position, NOT approved storage.
  const tank=part('aux-tank','Reference 12 L portable gasoline tank','Size documented • physical tank not verified',
    'Representative manufacturer 12 L portable tank envelope 363 × 265 × 230 mm; placed temporarily on the aft port cockpit seat for visibility. Actual tank, connector, fuel cap, venting, restraint, spill containment and safe storage location are UNCONFIRMED; this is not an approved fuel-system installation.',
    [-2.45,.745,-.74]);
  // Overall outer envelope exactly height .230 including cap. Red body height .165.
  box(tank,[.363,.163,.265],fuelRed,[0,.0815,0]);
  box(tank,[.331,.028,.241],fuelRed,[0,.174,0]);
  box(tank,[.155,.022,.038],fuelBlack,[.012,.207,0]);
  for(const x of [-.060,.060])box(tank,[.018,.045,.042],fuelBlack,[x,.184,0]);
  mesh(tank,new THREE.CylinderGeometry(.035,.035,.025,16),fuelBlack,[-.110,.200,-.045]);
  // Hose is a conceptual open-deck centerline only, and not an approved route.
  const fuel=part('aux-fuel-line','Conceptual detachable fuel hose','Illustrative only • routing unverified',
    'Diagrammatic hose between a temporary above-deck reference tank location and the engine. The actual hose, primer, fittings, fuel-tank vent, chafe protection and safe routing are not identified or tested.',
    [0,0,0]);
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.57,.953,-.79),
    new THREE.Vector3(-2.79,.94,-.82),
    new THREE.Vector3(-3.05,.83,-.95),
    new THREE.Vector3(-3.35,.66,-.98),
    new THREE.Vector3(-3.64,.53,-.82)
  ]);
  mesh(fuel,new THREE.TubeGeometry(curve,32,.011,8,false),hoseRubber);
  const bulb=mesh(fuel,new THREE.SphereGeometry(.035,12,8),fuelBlack,[-3.05,.83,-.95]);
  bulb.scale.set(1.7,.75,.85);
  // Each part remains named, togglable and inspectable independently of the hull model.
  labels.push({id:'aux-outboard',text:'15 HP outboard · proposed',position:new THREE.Vector3(0,.78,0)});
  labels.push({id:'aux-mount',text:'Bracket · unverified',position:new THREE.Vector3(-.23,.36,0)});
  labels.push({id:'aux-tank',text:'12 L tank · provisional',position:new THREE.Vector3(0,.32,0)});
  return {root,parts,pickables,labels,reference:AUX_REFERENCE};
}
