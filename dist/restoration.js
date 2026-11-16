import * as THREE from './vendor/three.module.js';

// Geometry in the model frame. These visual envelopes contain no private records.
// A front face points along local +X. Rotate the Garmin to face the cockpit (-X).
export function buildRestorationEquipment(boat){
 const parts={},pickables=[];
 const materials={};
 for(const [name,color,metalness] of [
  ['black',0x233235,0],['screen',0x235654,.12],['chart',0x88bec0,0],
  ['white',0xeaeae2,0],['deck',0xf8f5ec,0],['wood',0x967251,0],['steel',0x93a9ae,.65],
  ['red',0xb9503f,0],['yellow',0xb5a970,0],['solar',0x2b3c55,.17],['bag',0x5d7778,0],['canvas',0xaaa696,0]
 ])materials[name]=new THREE.MeshStandardMaterial({color,metalness,roughness:.56,side:THREE.DoubleSide});
 function group(id,position,heading=0){
  const part=new THREE.Group();part.name=id;part.userData={id,provisional:true};
  part.position.set(...position);part.rotation.y=heading;
  boat.root.add(part);parts[id]=part;return part;
 }
 function mesh(part,geometry,mat,position,rotation){
  const object=new THREE.Mesh(geometry,materials[mat].clone());
  object.position.set(...position);if(rotation)object.rotation.set(...rotation);
  object.castShadow=true;object.receiveShadow=true;object.userData.partId=part.name;
  part.add(object);pickables.push(object);return object;
 }
 function box(part,size,mat,position=[0,0,0]){return mesh(part,new THREE.BoxGeometry(...size),mat,position);}
 function oval(part,size,mat,position){
  const item=mesh(part,new THREE.SphereGeometry(1,20,14),mat,position);item.scale.set(...size);return item;
 }
 function cylinder(part,radius,depth,mat,position,rotation){
  return mesh(part,new THREE.CylinderGeometry(radius,radius,depth,24),mat,position,rotation);
 }
 function tube(part,points,radius,mat){
  const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point)));
  return mesh(part,new THREE.TubeGeometry(curve,Math.max(12,points.length*5),radius,7,false),mat,[0,0,0]);
 }

 const toilet=group('toilet',[1.18,.045,-.49]);
 box(toilet,[.36,.105,.30],'white',[0,.0525,0]);
 oval(toilet,[.145,.14,.13],'white',[.045,.163,0]);
 oval(toilet,[.201,.091,.155],'white',[-.01,.261,0]);
 oval(toilet,[.184,.016,.137],'black',[-.022,.322,0]);
 oval(toilet,[.181,.022,.134],'white',[-.022,.34,0]);

 const dashboard=group('nav-dashboard',[-1.038,.958,-.51]);
 box(dashboard,[.080,.365,.302],'wood');
 box(dashboard,[.014,.365,.302],'deck',[-.047,0,0]);
 const garmin=group('chartplotter',[-1.126,1.039,-.515],Math.PI);
 garmin.rotation.z=-.08;
 box(garmin,[.055,.131,.206],'black');
 box(garmin,[.004,.098,.151],'screen',[.028,0,.016]);
 box(garmin,[.002,.047,.074],'chart',[.031,.013,.034]);
 for(const y of [-.026,.004,.034])box(garmin,[.005,.012,.013],'white',[.03,y,-.072]);

 const vhf=group('vhf',[-.969,.874,-.515]);
 box(vhf,[.064,.086,.151],'white');
 box(vhf,[.006,.042,.068],'screen',[.034,.005,.01]);
 for(const z of [-.059,.063])cylinder(vhf,.012,.015,'black',[.038,.005,z],[0,0,Math.PI/2]);
 box(vhf,[.047,.086,.051],'white',[.025,-.037,-.129]);
 tube(vhf,[[.030,-.026,-.075],[.049,-.090,-.091],[.049,-.106,-.122],[.030,-.078,-.129]],.005,'black');

 const wood=group('cabin-woodwork',[-.51,.72,-.716]);
 box(wood,[.72,.238,.028],'wood');
 const panel=group('dc-panel',[-.725,.735,-.684],-Math.PI/2);
 box(panel,[.032,.139,.206],'black');
 for(const z of [-.067,-.023,.021,.065]){
  box(panel,[.011,.038,.021],'steel',[.020,.009,z]);
  oval(panel,[.008,.006,.006],'red',[.020,.044,z]);
 }

 const battery=group('house-battery',[-1.61,.325,-.65]);
 box(battery,[.32,.201,.165],'black',[0,.1005,0]);
 box(battery,[.165,.056,.004],'white',[0,.121,.085]);
 cylinder(battery,.014,.019,'red',[-.105,.209,.055]);
 cylinder(battery,.014,.019,'steel',[.105,.209,.055]);

 const controller=group('solar-controller',[-.417,.72,-.65],-Math.PI/2);
 box(controller,[.068,.210,.151],'black');
 box(controller,[.003,.042,.062],'screen',[.035,.05,0]);
 for(const z of [-.051,-.025,0,.025,.051])box(controller,[.009,.025,.011],'steel',[.035,-.074,z]);

 const transducer=group('transducer',[-3.345,.143,.34]);
 box(transducer,[.035,.14,.048],'steel',[.063,.02,0]);
 oval(transducer,[.098,.026,.028],'black',[-.025,-.074,0]);
 const compass=group('compass',[-1.147,.958,.55],Math.PI);
 cylinder(compass,.065,.023,'black',[0,0,0],[0,0,Math.PI/2]);
 oval(compass,[.038,.054,.054],'screen',[.014,0,0]);
 box(compass,[.002,.023,.003],'yellow',[.053,0,0]);

 const radio=group('stereo',[-.379,.576,.74],Math.PI/2);
 box(radio,[.094,.054,.18],'black');
 box(radio,[.004,.026,.095],'screen',[.049,.004,.012]);
 cylinder(radio,.016,.01,'steel',[.051,0,-.066],[0,0,Math.PI/2]);
 const speakers=group('speakers',[0,.62,0]);
 for(const [x,z] of [[.46,-.89],[.53,.88]]){
  cylinder(speakers,.087,.045,'white',[x,0,z],[Math.PI/2,0,0]);
  cylinder(speakers,.067,.009,'black',[x,0,z-Math.sign(z)*.027],[Math.PI/2,0,0]);
  cylinder(speakers,.026,.014,'steel',[x,0,z-Math.sign(z)*.036],[Math.PI/2,0,0]);
 }

 const solar=group('solar-panel',[.055,1.318,.005]);
 box(solar,[.54,.021,.43],'steel');
 box(solar,[.514,.009,.405],'solar',[0,.013,0]);
 for(let i=-3;i<=3;i++)box(solar,[.003,.002,.398],'steel',[i*.066,.018,0]);
 for(let i=-2;i<=2;i++)box(solar,[.503,.002,.003],'steel',[0,.018,i*.078]);

 const ladder=group('boarding-ladder',[-3.275,.25,.49]);
 for(const z of [-.17,.17]){
  tube(ladder,[[.004,.20,z],[-.16,.145,z],[-.36,.02,z],[-.38,-.10,z],[-.02,-.13,z]],.014,'steel');
  tube(ladder,[[-.363,-.10,z],[-.40,-.36,z],[-.365,-.45,z]],.013,'steel');
 }
 for(const x of [-.065,-.13,-.195,-.26,-.325])box(ladder,[.051,.028,.36],'wood',[x,-.075,0]);
 box(ladder,[.06,.033,.36],'wood',[-.37,-.439,0]);

 const lines=group('running-rigging',[0,0,0]);
 for(const side of [-1,1]){
  const z=side*.91;
  box(lines,[.083,.039,.033],'steel',[-1.51,.714,z]);
  tube(lines,[[-1.46,.729,z],[-1.63,.718,z],[-1.85,.724,side*.865]],.008,'canvas');
 }

 // Loose items use clearly marked illustrative storage, with no installed duplicate of the DC panel.
 const legacy=group('legacy-dc-panel',[-2.18,.435,.68]);
 box(legacy,[.16,.035,.11],'black');
 for(const x of [-.055,-.016,.023,.062])box(legacy,[.012,.008,.019],'steel',[x,.019,0]);
 for(const [id,position,mat] of [
  ['mainsail',[2.00,.32,-.24],'canvas'],['hood-sail',[2.03,.32,.24],'bag'],
  ['downwind-sail',[-1.69,.40,.676],'red']
 ]){
  const bag=group(id,position);oval(bag,[.235,.095,.118],mat,[0,0,0]);
  for(const x of [-.083,.084])box(bag,[.024,.006,.147],'black',[x,.081,0]);
 }
 const boom=group('boom',[0,0,0]);
 const boomMesh=boat.parts.rig.getObjectByName('boom-mesh');
 boomMesh.userData.partId=boom.name;boom.add(boomMesh);
 return {parts,pickables};
}
