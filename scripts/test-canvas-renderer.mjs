import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {buildBoat} from '../dist/model.js';
import {createCanvasRenderer} from '../dist/canvas-renderer.js';

let frame,draws=0;
const canvas={style:{},getContext:()=>({
 createImageData(width,height){return {width,height,data:new Uint8ClampedArray(width*height*4)};},
 putImageData(image){frame=image;draws++;}
})};
const renderer=createCanvasRenderer(canvas);
renderer.setClearColor(0xf2f1eb);
renderer.setSize(300,240);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,1.25,.05,50);
camera.position.set(5,4,8);
camera.lookAt(0,0,0);
const boat=buildBoat({restoration:true});
scene.add(boat.root);

renderer.render(scene,camera);
const image=frame.data.slice();
let coverage=0;
for(let i=0;i<image.length;i+=4)if(image[i]!==242||image[i+1]!==241||image[i+2]!==235)coverage++;
assert(coverage>500,'The compatibility renderer must draw the boat mesh');
renderer.render(scene,camera);
assert.equal(draws,1,'An unchanged scene should not redraw');
boat.parts.hull.visible=false;
renderer.render(scene,camera);
assert.equal(draws,2,'Layer changes invalidate the current frame');
assert.notDeepEqual(frame.data,image);
boat.parts.hull.visible=true;
camera.position.set(-.2,.9,0);
camera.lookAt(-1,.75,0);
renderer.render(scene,camera);
assert.equal(draws,3,'The camera can render from inside the cabin');
assert.notDeepEqual(frame.data,image);

const layered=new THREE.Scene();
function addSquare(color,z){
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color}));
 mesh.position.z=z;
 layered.add(mesh);
}
addSquare(0xff0000,-2);
addSquare(0x0000ff,-3);
camera.position.set(0,0,0);
camera.lookAt(0,0,-1);
renderer.render(layered,camera);
const center=(Math.floor(frame.height/2)*frame.width+Math.floor(frame.width/2))*4;
assert(frame.data[center]>150&&frame.data[center+2]===0,'The closer surface must occlude one drawn later');
console.log('Compatibility renderer checked with restoration geometry, cabin camera, layer changes and depth ordering.');
