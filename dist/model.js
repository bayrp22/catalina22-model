import * as THREE from './vendor/three.module.js';

// Meters. +X bow, +Y up, +Z starboard. Y=0 is the reference waterline.
// Overall dimensions from the scanned 1977 Catalina brochure, Cat2.jpg.
// Hull stations and interior extents are proportioned from its drawings, not lofting offsets.
export const SPEC = {hullLength:6.5532, beam:2.3368, waterline:5.8928, draftUp:0.6096, draftDown:1.524, mastLength:7.62};
export const SOURCES = [
 {title:'1977 factory brochure — dimensions and plan/profile',url:'https://forums.sailboatowners.com/attachments/cat2-jpg.60723/'},
 {title:'1977 factory brochure — interior photographs',url:'https://forums.sailboatowners.com/attachments/cat4-jpg.60725/'},
 {title:'1977 Catalina 22 owner’s manual',url:'https://www.catalina22.org/documents/files_pdf/1977-owner_manual.pdf'}
];
export function buildBoat(){
 const root=new THREE.Group();root.name='Catalina_22_Original_1970s';
 root.userData={units:'meters',axes:'+X bow, +Y up, +Z starboard; Y=0 reference waterline',accuracy:'Published principal dimensions; reconstructed hull surfaces and provisional interior dimensions',source:SOURCES[0].url};
 const parts={},pickables=[],labels=[];
 const mats={hull:new THREE.MeshStandardMaterial({color:0xece7d9,roughness:.62,side:THREE.DoubleSide}),deck:new THREE.MeshStandardMaterial({color:0xf8f5ec,roughness:.76,side:THREE.DoubleSide}),liner:new THREE.MeshStandardMaterial({color:0xe2dccb,roughness:.85,side:THREE.DoubleSide}),wood:new THREE.MeshStandardMaterial({color:0x9e7653,roughness:.78,side:THREE.DoubleSide}),teal:new THREE.MeshStandardMaterial({color:0x607f7a,roughness:.95}),metal:new THREE.MeshStandardMaterial({color:0x9eabb3,roughness:.32,metalness:.75}),glass:new THREE.MeshStandardMaterial({color:0x344b50,roughness:.24,metalness:.18,side:THREE.DoubleSide}),keel:new THREE.MeshStandardMaterial({color:0x485d66,roughness:.7,metalness:.22}),stripe:new THREE.MeshStandardMaterial({color:0x345964,roughness:.58}),black:new THREE.MeshStandardMaterial({color:0x252f33,roughness:.8})};
 function part(id,name,category,description,anchor,confidence='Proportioned • verify on boat'){
  const g=new THREE.Group();g.name=id;g.userData={id,name,category,description,confidence};root.add(g);parts[id]=g;
  if(anchor)labels.push({id,text:name,position:new THREE.Vector3(...anchor)});return g;
 }
 function mesh(g,geo,mat=mats.liner){const m=new THREE.Mesh(geo,mat.clone());m.castShadow=true;m.receiveShadow=true;g.add(m);pickables.push(m);return m;}
 function box(g,s,p,mat=mats.liner){const m=mesh(g,new THREE.BoxGeometry(...s),mat);m.position.set(...p);return m;}
 function tube(g,pts,r=.012,mat=mats.metal){return mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),Math.max(8,pts.length*8),r,7,false),mat);}
 function polygon(g,points,y,depth,mat=mats.liner){const sh=new THREE.Shape();points.forEach(([x,z],i)=>i?sh.lineTo(x,-z):sh.moveTo(x,-z));sh.closePath();const geo=new THREE.ExtrudeGeometry(sh,{depth,bevelEnabled:false});geo.rotateX(-Math.PI/2);geo.translate(0,y-depth,0);return mesh(g,geo,mat);}
 function panel(g,vertices,mat){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices.flat(),3));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();return mesh(g,geo,mat);}
 // Drawing-derived half-breadths at deck: transom to bow, meters.
 const stations=[[-3.2766,.89,-.02,.70],[-2.9,.98,-.13,.685],[-2.3,1.07,-.25,.67],[-1.6,1.137,-.30,.655],[-.8,1.1684,-.315,.65],[0,1.155,-.30,.66],[.7,1.075,-.25,.68],[1.35,.91,-.16,.71],[1.95,.70,-.04,.75],[2.50,.425,.10,.80],[2.95,.175,.27,.855],[3.2766,0,.40,.90]];
 function section(x){let i=0;while(i<stations.length-2&&stations[i+1][0]<x)i++;const a=stations[i],b=stations[i+1],t=THREE.MathUtils.clamp((x-a[0])/(b[0]-a[0]),0,1);return [THREE.MathUtils.lerp(a[1],b[1],t),THREE.MathUtils.lerp(a[2],b[2],t),THREE.MathUtils.lerp(a[3],b[3],t)];}
 function hullPoint(x,t,side,inside=false){let [w,bottom,sheer]=section(x);const angle=t*Math.PI/2;const round=Math.pow(Math.sin(angle),.90);const y=bottom+(sheer-bottom)*(1-Math.cos(angle));const rake=Math.max(0,(x-1.6)/(SPEC.hullLength/2-1.6))*.48*(1-t);return [x-rake,y+(inside?.022:0),side*Math.max(0,w*round-(inside?.022*round:0))];}
 const hull=part('hull','Hull shell','Structure','Full-scale overall envelope. Sheer and plan outline reconstructed from the 1977 brochure; underwater sections are inferred, not factory lofting data.',[.15,.85,1.15],'Published length/beam • surface inferred');
 const hullUpper={};
 function shell(side,start,end){const xs=[...new Set([...Array.from({length:161},(_,i)=>-3.2766+SPEC.hullLength*i/160),...stations.map(s=>s[0])])].sort((a,b)=>a-b);const geo=new THREE.BufferGeometry(),v=[],idx=[],NX=xs.length-1,NT=20;for(let inner=0;inner<2;inner++)for(let i=0;i<=NX;i++){const x=xs[i];for(let j=0;j<=NT;j++)v.push(...hullPoint(x,start+(end-start)*j/NT,side,!!inner));}
 const layer=(NX+1)*(NT+1);for(let k=0;k<2;k++)for(let i=0;i<NX;i++)for(let j=0;j<NT;j++){const a=k*layer+i*(NT+1)+j,b=a+NT+1;idx.push(a,b,a+1,b,b+1,a+1);}
 for(let i=0;i<NX;i++)for(const j of [0,NT]){const a=i*(NT+1)+j,b=a+NT+1;idx.push(a,a+layer,b,b,a+layer,b+layer);}geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(idx);geo.computeVertexNormals();return mesh(hull,geo,mats.hull);}
 for(const side of [-1,1]){shell(side,0,.52);hullUpper[side]=shell(side,.52,1);}
 // The transom follows the same curved cross-section as the hull, without sealing its top.
 const transV=[];for(let i=0;i<=40;i++){const t=i/40;transV.push(hullPoint(-3.2766,t,-1));}for(let i=40;i>=0;i--)transV.push(hullPoint(-3.2766,i/40,1));
 const ts=new THREE.Shape();transV.forEach((p,i)=>i?ts.lineTo(p[2],p[1]):ts.moveTo(p[2],p[1]));const tg=new THREE.ShapeGeometry(ts);const ta=tg.attributes.position;for(let i=0;i<ta.count;i++){const z=ta.getX(i),y=ta.getY(i);ta.setXYZ(i,-3.2766,y,z);}tg.computeVertexNormals();mesh(hull,tg,mats.hull);
 const trim=part('trim','Rub rails & deck hardware','Exterior','Simplified rub rails, cleats, bow pulpit, handrails and cockpit winches. Hardware sizes are illustrative.',null);
 for(const side of [-1,1]){const pts=[];for(let i=0;i<=64;i++){const x=-3.2766+SPEC.hullLength*i/64;const [w,b,s]=section(x);pts.push([x,s+.012,side*(w+.01)]);}tube(trim,pts,.018,mats.stripe);}
 const deck=part('deck','Deck & side decks','Exterior','Foredeck and narrow side decks, with openings around the cabin trunk and cockpit.',[2.4,.95,0]);
 const outline=(a,b,sgn,inset=0)=>{const pts=[];for(let i=0;i<=28;i++){const x=a+(b-a)*i/28;pts.push([x,sgn*Math.max(0,section(x)[0]-inset)]);}return pts;};
 polygon(deck,[...outline(1.48,3.2766,1),...outline(3.2766,1.48,-1)],.78,.045,mats.deck);
 for(const s of [-1,1])polygon(deck,[...outline(-3.2766,1.48,s),[1.48,s*.66],[-1.07,s*.77],[-1.20,s*.82],[-3.2766,s*.78]],.695,.045,mats.deck);
 const cabin=part('cabin','Cabin trunk & windows','Exterior','Original low cabin trunk with two framed lights per side. Exact window shapes and pop-top details vary by year.',[.15,1.29,.73]);
 for(const s of [-1,1]){panel(cabin,[[-1.07,.695,s*.79],[1.48,.78,s*.69],[1.18,1.23,s*.59],[-1.03,1.18,s*.66]],mats.deck);
  // Two similar elongated framed ports per side, following the sloped cabin side.
  for(const [a,b] of [[-.92,-.04],[.06,1.03]]){
   const plane=(expand)=>[[a-expand,.83,s*.757],[b+expand,.855,s*.716],[b+expand,1.075,s*.667],[a-expand,1.065,s*.703]];
   panel(cabin,plane(.035),mats.metal);const pg=plane(0);pg.forEach(p=>{p[1]+=.012;p[2]+=s*.004;});panel(cabin,pg,mats.glass);
  }
 }
 panel(cabin,[[1.48,.78,-.69],[1.48,.78,.69],[1.18,1.23,.59],[1.18,1.23,-.59]],mats.deck);
 for(const s of [-1,1])panel(cabin,[[-1.07,.695,s*.79],[-1.07,.695,s*.34],[-1.03,1.18,s*.34],[-1.03,1.18,s*.66]],mats.deck);
 box(cabin,[.055,.12,.69],[-1.06,.69,0],mats.wood);
 const roof=part('roof','Cabin roof / pop-top','Exterior','Removable roof layer. Pop-top represented closed; year and mechanism require confirmation.',[.45,1.31,0]);
 polygon(roof,[[-1.03,-.66],[1.18,-.59],[1.18,.59],[-1.03,.66]],1.25,.055,mats.deck);
 box(roof,[1.35,.045,1.03],[-.25,1.287,0],mats.deck);box(roof,[.58,.036,.58],[.80,1.29,0],mats.metal);box(roof,[.52,.026,.52],[.80,1.313,0],mats.glass);
 for(const s of [-1,1]){tube(roof,[[-.80,1.32,s*.52],[-.74,1.38,s*.52],[.30,1.38,s*.49],[.36,1.32,s*.49]],.016,mats.wood);}
 const cockpit=part('cockpit','Cockpit & lockers','Exterior','Self-draining footwell between two molded seats; cockpit seats cover storage lockers.',[-2.05,.83,0]);
 box(cockpit,[2.02,.05,.90],[-2.17,.31,0],mats.deck);
 for(const s of [-1,1]){
  polygon(cockpit,[[-3.23,s*.45],[-1.16,s*.45],[-1.16,s*.93],[-3.23,s*.78]],.67,.055,mats.deck);
  box(cockpit,[2.05,.33,.035],[-2.20,.48,s*.45],mats.liner);
  box(cockpit,[1.32,.018,.33],[-2.03,.709,s*.69],mats.liner);
  for(const xx of [-2.47,-1.57])box(cockpit,[.06,.018,.035],[xx,.727,s*.83],mats.metal);
  box(cockpit,[.1,.1,.15],[-1.36,.76,s*.99],mats.wood);
  const winch=mesh(trim,new THREE.CylinderGeometry(.062,.074,.085,24),mats.metal);winch.position.set(-1.36,.84,s*.99);
 }
 box(cockpit,[.075,.33,.93],[-3.18,.47,0],mats.deck);box(cockpit,[.13,.08,.92],[-1.17,.68,0],mats.deck);
 const sole=part('sole','Cabin sole','Interior','Central walking surface. Floor height is inferred from the interior photographs.',[-.12,-.02,.12]);
 polygon(sole,[[-1.12,-.32],[.88,-.33],[1.32,-.2],[1.32,.2],[.88,.38],[-1.12,.38]],-.10,.04,mats.wood);
 const vberth=part('vberth','Forward V-berth','Interior','Forward double-berth platform with a center footwell and removable infill. Precise dimensions need measurement.',[1.82,.38,0]);
 const vb=[ [.78,-.77],[1.35,-.78],[1.95,-.57],[2.65,-.23],[2.88,0],[2.65,.23],[1.95,.57],[1.35,.78],[.78,.77],[.78,.30],[1.38,.23],[1.65,0],[1.38,-.23],[.78,-.30] ];
 polygon(vberth,vb,.25,.13);box(vberth,[.045,.28,.45],[.79,.065,-.53]);box(vberth,[.045,.28,.45],[.79,.065,.53]);
 const bulkhead=part('bulkheads','Forward bulkheads','Interior','Partial teak bulkheads frame the V-berth opening. Reconstructed positions; not a measured structural drawing.',[.77,.90,-.48]);
 for(const s of [-1,1])box(bulkhead,[.028,.86,.36],[.77,.68,s*.49],mats.wood);
 const dinette=part('dinette','Port dinette bases','Interior','Two facing seats on the port side. The table lowers to make a berth; seat positions reconstructed from the brochure.',[-.19,.31,-.77]);
 for(const x of [-.96,.48]){polygon(dinette,[[x-.22,-1.03],[x+.22,-1.03],[x+.22,-.25],[x-.22,-.25]],.25,.29);box(dinette,[.025,.30,.73],[x+(x<0?-.205:.205),.41,-.655],mats.wood);}
 const table=part('table','Dinette table','Interior','Port dinette table; toggle off to inspect the seat bases and keel trunk.',[-.20,.67,-.62]);box(table,[1.02,.035,.68],[-.23,.56,-.68],mats.wood);box(table,[.055,.64,.055],[-.20,.22,-.65],mats.metal);
 const settee=part('settee','Starboard berth','Interior','Longitudinal starboard berth, with the sliding galley at its aft end.',[-.12,.31,.76]);
 polygon(settee,[[-1.10,.39],[.73,.39],[.73,.95],[-.5,1.04],[-1.10,1.03]],.24,.28);box(settee,[1.74,.15,.025],[-.15,.31,1.00],mats.wood);
 const galley=part('galley','Sliding galley','Interior','Optional galley on the aft starboard berth, stowing beneath the cockpit. Slider travel and size are illustrative.',[-.85,.64,.71]);
 box(galley,[.67,.27,.53],[-.89,.40,.73],mats.wood);box(galley,[.71,.04,.56],[-.89,.56,.73],mats.deck);
 box(galley,[.27,.008,.38],[-.71,.586,.73],mats.metal);for(const z of [.64,.82]){const m=mesh(galley,new THREE.TorusGeometry(.055,.01,6,24),mats.black);m.rotation.x=Math.PI/2;m.position.set(-.71,.60,z);}
 box(galley,[.22,.013,.31],[-1.07,.588,.73],mats.metal);box(galley,[.17,.009,.25],[-1.07,.598,.73],mats.glass);
 tube(galley,[[-1.18,.60,.88],[-1.18,.72,.88],[-1.09,.74,.85],[-1.07,.68,.81]],.009,mats.metal);
 const trunk=part('trunk','Swing-keel trunk','Structure','Central keel housing. The original manual places the locking bolt under the forward port dinette seat. Shape and pivot location are provisional.',[.08,.21,-.13]);
 polygon(trunk,[[-.84,-.10],[.53,-.10],[.64,0],[.53,.10],[-.84,.10]],.18,.48,mats.liner);tube(trunk,[[-.78,.13,0],[-1.05,.53,0]],.025,mats.metal);
 const companion=part('companionway','Companionway & step','Interior','Aft cabin entry and step; main interior access from the cockpit.',[-1.05,.60,0]);box(companion,[.27,.075,.58],[-1.03,.24,0],mats.wood);box(companion,[.05,.30,.55],[-1.13,.09,0],mats.liner);
 const cushions=part('cushions','Berth cushions','Fit-out','Optional soft furnishings to make the original arrangement easier to read. Hide for the bare structure.',null);
 polygon(cushions,vb,.31,.055,mats.teal);for(const x of [-.96,.48])box(cushions,[.405,.07,.70],[x,.30,-.65],mats.teal);box(cushions,[1.0,.065,.50],[.22,.286,.70],mats.teal);
 const keel=part('keel','Swing keel','Appendages','Animated pivoting keel. End positions match the 1977 nominal drafts; blade outline and pivot are inferred.',[-.45,-.98,.09],'Published end drafts • mechanism inferred');
 const keelPivot=new THREE.Group();keel.add(keelPivot);keelPivot.position.set(.43,-.23,0);
 const blade=[[.04,0],[.21,-.06],[.12,-.32],[-.63,-1.294],[-1.08,-1.294],[-1.14,-1.19],[-.29,-.08]];
 const ks=new THREE.Shape();blade.forEach(([x,y],i)=>i?ks.lineTo(x,y):ks.moveTo(x,y));ks.closePath();const kg=new THREE.ExtrudeGeometry(ks,{depth:.066,bevelEnabled:true,bevelSize:.008,bevelThickness:.005,bevelSegments:2});kg.translate(0,0,-.033);mesh(keelPivot,kg,mats.keel);
 // Find the raised angle from the vertex envelope so draft stays 0.6096 m.
 const minY=a=>{let min=Infinity;const p=kg.attributes.position;for(let i=0;i<p.count;i++)min=Math.min(min,-.23+Math.sin(a)*p.getX(i)+Math.cos(a)*p.getY(i));return min;};
 // Normalize bottom to exactly -1.524 at the lowered position, including bevel.
 const p=kg.attributes.position;let localMin=Infinity;for(let i=0;i<p.count;i++)localMin=Math.min(localMin,p.getY(i));const fac=(-SPEC.draftDown+.23)/localMin;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)*fac);kg.computeVertexNormals();
 let lo=-1.5,hi=0;for(let i=0;i<60;i++){const a=(lo+hi)/2;if(minY(a)>-SPEC.draftUp)lo=a;else hi=a;}const raisedAngle=(lo+hi)/2;
 const rudder=part('rudder','Rudder & tiller','Appendages','Transom-hung rudder and wooden tiller. Profile inferred from the 1977 drawing.',[-3.45,.52,0]);
 const rs=new THREE.Shape();[[-3.31,.49],[-3.52,.48],[-3.69,-.80],[-3.26,-.80],[-3.22,-.64],[-3.29,.0]].forEach(([x,y],i)=>i?rs.lineTo(x,y):rs.moveTo(x,y));rs.closePath();const rg=new THREE.ExtrudeGeometry(rs,{depth:.042,bevelEnabled:false});rg.translate(0,0,-.021);mesh(rudder,rg,mats.deck);tube(rudder,[[-3.40,.51,0],[-3.03,.73,0],[-2.27,.79,0]],.028,mats.wood);for(const y of [.18,.49])box(rudder,[.16,.045,.065],[-3.29,y,0],mats.metal);
 const rig=part('rig','Mast, boom & standing rigging','Rig','Optional simplified masthead rig. Mast length: 25 ft in the 1977 brochure. Shroud positions and fittings inferred.',null,'Published mast length • rig layout inferred');
 box(rig,[.11,SPEC.mastLength,.075],[.59,1.285+SPEC.mastLength/2,0],mats.metal);tube(rig,[[.59,2.05,0],[-2.36,2.05,0]],.047,mats.metal);
 for(const s of [-1,1]){tube(rig,[[.59,5.0,0],[.59,5.0,s*.68]],.016,mats.metal);tube(rig,[[.59,8.89,0],[.59,5,s*.68],[.45,.74,s*1.04]],.003,mats.metal);for(const x of [-.1,1.04])tube(rig,[[.59,5,0],[x,.74,s*1.03]],.003,mats.metal);}
 tube(rig,[[3.12,.86,0],[.59,8.89,0],[-3.22,.76,0]],.004,mats.metal);
 tube(trim,[[2.30,.80,-.52],[2.35,1.30,-.50],[3.16,1.30,-.10],[3.22,1.29,0],[3.16,1.30,.10],[2.35,1.30,.50],[2.30,.80,.52]],.014,mats.metal);
 for(const s of [-1,1]){tube(trim,[[2.93,.85,s*.17],[2.98,1.30,s*.20]],.013,mats.metal);for(const x of [-2.9,2.2]){const z=s*(section(x)[0]-.14);box(trim,[.09,.035,.045],[x,.75,z],mats.metal);tube(trim,[[x-.08,.79,z],[x+.08,.79,z]],.012,mats.metal);}}
 // Taper molded berth bases to the hull envelope instead of letting rectangular bases protrude.
 for(const id of ['vberth','dinette','settee'])parts[id].traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i)+o.position.x,y=p.getY(i)+o.position.y,z=p.getZ(i)+o.position.z;const [w,b,sh]=section(x);const ratio=THREE.MathUtils.clamp((y-b)/(sh-b),0,1);const limit=Math.max(.01,w*Math.pow(Math.sqrt(Math.max(0,1-(1-ratio)**2)),.90)-.028);if(Math.abs(z)>limit)p.setZ(i,Math.sign(z)*limit-o.position.z);}o.geometry.computeVertexNormals();});
 function partOf(o){while(o&&o!==root){if(o.userData.id)return o.userData.id;o=o.parent;}return null;}
 pickables.forEach(o=>o.userData.partId=partOf(o));
 const defaults={};for(const [id,g]of Object.entries(parts)){defaults[id]=g.position.clone();g.userData.originalPosition=g.position.toArray();}
 function setKeel(percent){keelPivot.rotation.z=raisedAngle*(1-percent/100);return -minY(keelPivot.rotation.z);}
 setKeel(100);
 return {root,parts,pickables,labels,mats,hullUpper,keelPivot,setKeel,defaults,SPEC};
}
