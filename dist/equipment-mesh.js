// Generic visual equipment proxies. Private records supply type, size and placement.
// Faces point toward local -X; dimensions are depth X, height Y, width Z.
import * as THREE from './vendor/three.module.js';
export const EQUIPMENT_KINDS=['battery','outboard','display','radio','switch-panel','dashboard'];
export function equipmentMesh(kind,d) {
  const root=new THREE.Group();root.userData.visualKind=kind;
  const box=(x,y,z,a,b,c,color)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(a,b,c),new THREE.MeshStandardMaterial({color,roughness:.58}));mesh.position.set(x,y,z);root.add(mesh);return mesh;};
  if(kind==='battery'){
    box(0,-.02,0,.92,.78,.94,0x364951);box(0,.41,0,1,.12,1,0x212d32);
    box(-.29,.49,-.3,.13,.02,.12,0xdb5840);box(.29,.49,.3,.13,.02,.12,0x7996a6);
    box(-.466,-.03,0,.008,.34,.58,0xdbe6d2);
  }else if(kind==='outboard'){
    box(.04,.31,0,.73,.38,.95,0x343e48);box(-.335,.31,0,.02,.14,.7,0xc5d4df);
    box(.15,-.13,0,.22,.5,.22,0x717e89);box(-.08,.02,0,.35,.12,.37,0x323d44);
    box(.1,-.42,0,.57,.12,.18,0x64747d);box(.07,-.31,0,.21,.14,.38,0x657c86);
    // Propeller blades, including a clear hub; all remain inside proxy envelope.
    box(-.24,-.42,0,.08,.15,.55,0xd7dde0);box(-.24,-.42,0,.08,.16,.10,0x9caaaf);
    box(-.33,.24,-.24,.34,.035,.07,0x303b42);
  }else if(kind==='dashboard'){
    box(.36,0,0,.28,1,1,0xad8256);box(0,-.47,0,1,.06,1,0xcca877);
    box(0,0,-.47,1,1,.06,0xb99362);box(0,0,.47,1,1,.06,0xb99362);
  }else{
    box(.03,0,0,.92,.95,.98,kind==='switch-panel'?0x46535a:0x242e34);
    if(kind==='display'){
      box(-.435,.025,-.045,.05,.72,.79,0x345d78);
      box(-.464,.12,-.045,.012,.02,.68,0xa9dfe9);box(-.464,-.02,-.045,.012,.025,.68,0x669fa4);
      for(let i=0;i<3;i++)box(-.464,-.12+i*.14,.41,.018,.055,.055,0xc5d0d3);
      box(.17,-.485,0,.55,.03,.63,0x5a666b);
    }else if(kind==='radio'){
      box(-.435,.07,.13,.05,.43,.49,0x7fa0a5);
      box(-.47,-.09,-.32,.04,.23,.17,0x78858c);
      for(let i=0;i<4;i++)box(-.47,-.3,.01+i*.1,.04,.06,.07,0xc2ced0);
      for(let i=0;i<3;i++)box(-.464,.19-i*.12,-.32,.012,.025,.2,0xa5b0b5);
    }else{
      for(let i=0;i<6;i++){const z=i%2===0?-.23:.23,y=.3-Math.floor(i/2)*.3;
        box(-.435,y,z,.045,.075,.12,0xd9b667);box(-.465,y,z+.1,.025,.035,.035,0x76bc92);}
    }
  }
  root.scale.set(d.length,d.height,d.width);
  return root;
}
export function setEquipmentXray(root,enabled) {
  root.traverse(o=>{if(o.isMesh){o.material.depthTest=!enabled;o.material.depthWrite=!enabled;o.material.transparent=enabled;o.material.opacity=enabled?.88:1;o.renderOrder=enabled?10:0;}});
}
