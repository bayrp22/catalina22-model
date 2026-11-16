import * as THREE from './vendor/three.module.js';

// Photo-based lift bracket with reference outboard and fuel hardware.
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
    const m=new THREE.Mesh(geometry,material.clone());m.position.set(...xyz);if(rotation)m.rotation.set(...rotation);
    m.castShadow=true;m.receiveShadow=true;group.add(m);m.userData.partId=group.userData.id;pickables.push(m);return m;
  }
  const box=(group,dim,material,xyz,rotation=null)=>mesh(group,new THREE.BoxGeometry(...dim),material,xyz,rotation);
  function rod(group,a,b,r,material){
    const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));
    const m=mesh(group,new THREE.CylinderGeometry(r,r,v.length(),10),material);
    m.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;
  }
  const bracket=part('aux-mount','Adjustable outboard lift bracket','Photo-based • travel inferred',
    'Port transom lift bracket with twin pivoting links, a locking plate and a vertical wood motor board. The photos show the raised position. Lowered travel, detents and load rating are unverified.',
    [-3.2766,.23,-.61]);
  const board=new THREE.Group();board.name='outboard-clamp-board';board.userData.id=bracket.name;bracket.add(board);
  box(board,[.061,.385,.263],wood,[0,.115,0]);
  box(board,[.023,.275,.217],steel,[.036,.064,0]);
  const pivots=[0,.175];
  const armLength=.36;
  const arms=[];
  for(const z of [-.088,.088]){
    box(bracket,[.024,.257,.045],steel,[-.012,.074,z]);
    box(bracket,[.13,.229,.019],steel,[-.062,.077,z]);
    for(const y of [-.027,.203])rod(bracket,[-.047,y,z],[.001,y,z],.014,darkSteel);
    for(const y of pivots){
      const arm=box(bracket,[armLength,.048,.021],steel,[-.072,y,z]);
      arms.push({arm,y,z});
      rod(bracket,[-.072,y,z-.024],[-.072,y,z+.024],.026,darkSteel);
      rod(board,[.027,y,z-.019],[.027,y,z+.019],.018,steel);
    }
    for(const y of [.032,.146])rod(board,[-.041,y,z],[-.023,y,z],.014,darkSteel);
    // The small bent steel retainers wrap over the top of the wood board.
    const retainer=new THREE.CatmullRomCurve3([[.037,.236,z],[.037,.313,z],[-.032,.313,z],[-.037,.267,z]].map(p=>new THREE.Vector3(...p)));
    mesh(board,new THREE.TubeGeometry(retainer,16,.008,8,false),steel);
  }
  const lock=new THREE.CatmullRomCurve3([[-.079,-.018,.102],[-.137,.012,.102],[-.158,.075,.102],[-.147,.116,.102]].map(p=>new THREE.Vector3(...p)));
  mesh(bracket,new THREE.TubeGeometry(lock,20,.010,8,false),darkSteel);
  // Motor remains independently selectable. Its pose follows the moving board.
  const motor=part('aux-outboard','Reference 15 HP four-stroke outboard','Envelope reference • actual variant unverified',
    'Generic Suzuki DF15A-family model carried by the lift bracket. Shaft length and installed clearance remain unverified.',[0,0,0]);
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
  mesh(motor,new THREE.CylinderGeometry(.035,.035,.11,12),propMetal,[-.225,-.445,0],[0,0,Math.PI/2]);
  for(let i=0;i<3;i++){
    const a=i*2*Math.PI/3;
    box(motor,[.018,.124,.048],propMetal,[-.259,-.445+Math.cos(a)*.070,Math.sin(a)*.070],[a,0,0]);
  }
  // Tiller points into the cockpit; check real steering swing clearance.
  rod(motor,[.13,.15,0],[.328,.03,0],.022,darkSteel);
  rod(motor,[.29,.05,0],[.33,.025,0],.030,fuelBlack);
  // Standard 12 L portable tank dimensions: 0.363 × 0.265 × 0.230 m (L × W × H).
  const tankPosition=[-2.42,.375,-.66]; // Below the aft port cockpit locker lid.
  const tank=part('aux-tank','Reference 12 L portable gasoline tank','Reference size • owner-indicated location',
    'Suzuki 12 L reference tank shown inside the hull beneath the port lazarette. The actual tank, locker clearances, restraint and ventilation still need verification.',
    tankPosition);
  box(tank,[.363,.163,.265],fuelRed,[0,.0815,0]);
  box(tank,[.331,.028,.241],fuelRed,[0,.174,0]);
  box(tank,[.155,.022,.038],fuelBlack,[.012,.219,0]);
  for(const x of [-.060,.060])box(tank,[.018,.045,.042],fuelBlack,[x,.188,0]);
  mesh(tank,new THREE.CylinderGeometry(.035,.035,.025,16),fuelBlack,[-.110,.200,-.045]);

  const fuel=part('aux-fuel-line','Fuel line under port lazarette','Owner-indicated route • exact path inferred',
    'The line runs inside the hull beneath the port lazarette, with a short external connection to the outboard. The route, exit fitting and primer location are represented provisionally.',
    [0,0,0]);
  const [tankX,tankY,tankZ]=tankPosition;
  const primer=[-2.91,.552,-.69];
  // Split at the transom so the model does not imply a verified pass-through fitting.
  const inboardPoints=[[tankX-.11,tankY+.2125,tankZ-.045],[-2.68,.550,-.72],primer,[-3.14,.557,-.66],[-3.27,.56,-.66]];
  const hoseGeometry=points=>new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point))),32,.010,8,false
  );
  mesh(fuel,hoseGeometry(inboardPoints),hoseRubber);
  const exit=[-3.292,.56,-.66];
  const externalHose=mesh(fuel,new THREE.BufferGeometry(),hoseRubber);
  mesh(fuel,new THREE.SphereGeometry(.035,12,8),fuelBlack,primer).scale.set(1.55,.64,.69);

  function setLift(percent){
    const angle=THREE.MathUtils.lerp(-.23,1.02,THREE.MathUtils.clamp(percent,0,100)/100);
    const dx=-armLength*Math.cos(angle),dy=armLength*Math.sin(angle);
    for(const {arm,y,z} of arms){
      arm.position.set(-.072+dx/2,y+dy/2,z);
      arm.rotation.z=-angle;
    }
    board.position.set(-.099+dx,dy,0);
    motor.position.copy(bracket.position).add(board.position).add(new THREE.Vector3(-.115,.082,0));
    const connector=motor.position.clone().add(new THREE.Vector3(.142,.291,-.091));
    const points=[exit,[-3.355,.520,-.731],[connector.x+.036,connector.y-.135,connector.z-.049],connector.toArray()];
    externalHose.geometry.dispose();
    externalHose.geometry=hoseGeometry(points);
  }
  setLift(100);
  // Each part remains named, togglable and inspectable independently of the hull model.
  labels.push({id:'aux-outboard',text:'15 HP outboard · proposed',position:new THREE.Vector3(0,.78,0)});
  labels.push({id:'aux-mount',text:'Outboard lift bracket',position:new THREE.Vector3(-.12,.27,-.12)});
  labels.push({id:'aux-tank',text:'12 L tank · provisional',position:new THREE.Vector3(0,.24,0)});
  return {root,parts,pickables,labels,setLift,reference:AUX_REFERENCE};
}
