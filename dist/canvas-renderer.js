import * as THREE from './vendor/three.module.js';

// A small CPU renderer for devices where the browser cannot create a WebGL context.
export function createCanvasRenderer(canvas) {
 const context=canvas.getContext('2d',{alpha:false});
 if(!context)throw new Error('Canvas 2D is unavailable');
 const combined=new THREE.Matrix4();
 const normalMatrix=new THREE.Matrix3();
 const light=new THREE.Vector3(-.35,.62,.70).normalize();
 const normal=new THREE.Vector3();
 let frame,depth,background,lastScene;
 let backgroundColor=0xf2f1eb;

 function setSize(width,height) {
  const scale=Math.min(.8,800/Math.max(width,height));
  canvas.width=Math.max(1,Math.round(width*scale));
  canvas.height=Math.max(1,Math.round(height*scale));
  canvas.style.width=width+'px';
  canvas.style.height=height+'px';
  lastScene=null;
  frame=context.createImageData(canvas.width,canvas.height);
  depth=new Float32Array(canvas.width*canvas.height);
  background=new Uint8ClampedArray(frame.data.length);
  for(let index=0;index<background.length;index+=4){
   background[index]=backgroundColor>>16;
   background[index+1]=(backgroundColor>>8)&255;
   background[index+2]=backgroundColor&255;
   background[index+3]=255;
  }
 }

 function interpolate(a,b,t) {
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t,a[3]+(b[3]-a[3])*t];
 }
 function clipNear(vertices) {
  const clipped=[];
  let a=vertices.at(-1);
  for(const b of vertices){
   const da=a[2]+a[3],db=b[2]+b[3];
   if((da>=0)!==(db>=0))clipped.push(interpolate(a,b,da/(da-db)));
   if(db>=0)clipped.push(b);
   a=b;
  }
  return clipped;
 }
 function project(vertex) {
  const [x,y,z,w]=vertex;
  return [(x/w+1)*canvas.width/2,(1-y/w)*canvas.height/2,z/w];
 }
 function writePixel(index,z,color) {
  if(z>=depth[index]||z>1)return;
  depth[index]=z;
  const offset=index*4;
  frame.data[offset]=color[0];
  frame.data[offset+1]=color[1];
  frame.data[offset+2]=color[2];
 }
 function line(a,b,color) {
  const steps=Math.max(1,Math.min(2*canvas.width,Math.ceil(Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1])))));
  for(let i=0;i<=steps;i++){
   const t=i/steps,x=Math.round(a[0]+(b[0]-a[0])*t),y=Math.round(a[1]+(b[1]-a[1])*t);
   if(x>=0&&x<canvas.width&&y>=0&&y<canvas.height)writePixel(y*canvas.width+x,a[2]+(b[2]-a[2])*t,color);
  }
 }
 function triangle(a,b,c,color,wireframe) {
  if(wireframe){line(a,b,color);line(b,c,color);line(c,a,color);return;}
  const [ax,ay,az]=a,[bx,by,bz]=b,[cx,cy,cz]=c;
  const area=(by-cy)*(ax-cx)+(cx-bx)*(ay-cy);
  if(Math.abs(area)<.15)return;
  const left=Math.max(0,Math.floor(Math.min(ax,bx,cx))),right=Math.min(canvas.width-1,Math.ceil(Math.max(ax,bx,cx)));
  const top=Math.max(0,Math.floor(Math.min(ay,by,cy))),bottom=Math.min(canvas.height-1,Math.ceil(Math.max(ay,by,cy)));
  for(let y=top;y<=bottom;y++){
   for(let x=left;x<=right;x++){
    const wa=((by-cy)*(x+.5-cx)+(cx-bx)*(y+.5-cy))/area;
    const wb=((cy-ay)*(x+.5-cx)+(ax-cx)*(y+.5-cy))/area;
    const wc=1-wa-wb;
    if(wa>=0&&wb>=0&&wc>=0)writePixel(y*canvas.width+x,wa*az+wb*bz+wc*cz,color);
   }
  }
 }
 function render(scene,camera) {
  if(!frame)return;
  scene.updateMatrixWorld();
  camera.updateMatrixWorld();
  const visible=[];
  scene.traverseVisible(object=>{
   if((object.isMesh||object.isLine)&&object.material.visible)visible.push(object);
  });
  const signature=camera.matrixWorld.elements.join(',')+camera.projectionMatrix.elements.join(',')+
   visible.map(object=>[
    object.id,object.geometry.id,object.matrixWorld.elements.join(','),object.material.color?.getHex(),
    object.material.emissive?.getHex(),object.material.emissiveIntensity,object.material.wireframe
   ].join(':')).join(';');
  if(signature===lastScene)return;
  lastScene=signature;
  frame.data.set(background);
  depth.fill(Infinity);
  const viewProjection=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  for(const object of visible){
   const geometry=object.geometry,material=object.material;
   const positions=geometry.attributes.position;
   if(!positions||!material.color)continue;
   combined.multiplyMatrices(viewProjection,object.matrixWorld);
   const e=combined.elements;
   const vertices=Array.from({length:positions.count},(_,i)=>{
    const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i);
    return [e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],
     e[2]*x+e[6]*y+e[10]*z+e[14],e[3]*x+e[7]*y+e[11]*z+e[15]];
   });
   const color=material.color.clone();
   if(material.emissive)color.add(material.emissive.clone().multiplyScalar(material.emissiveIntensity));
   color.convertLinearToSRGB();
   const rgb=[color.r*255,color.g*255,color.b*255];
   if(object.isLine){
    const step=object.isLineSegments?2:1;
    for(let i=0;i<vertices.length-1;i+=step){
     const a=vertices[i],b=vertices[i+1];
     if(a[2]+a[3]>=0&&b[2]+b[3]>=0){
     const vertexColors=geometry.attributes.color;
     if(material.vertexColors&&vertexColors){
      normal.fromBufferAttribute(vertexColors,i);
      color.setRGB(normal.x,normal.y,normal.z).convertLinearToSRGB();
      line(project(a),project(b),[color.r*255,color.g*255,color.b*255]);
     }else line(project(a),project(b),rgb);
    }
    }
    continue;
   }
   const index=geometry.index?.array,normals=geometry.attributes.normal;
   normalMatrix.getNormalMatrix(object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse,object.matrixWorld));
   for(let i=0;i<(index?.length??positions.count);i+=3){
    const ia=index?index[i]:i,ib=index?index[i+1]:i+1,ic=index?index[i+2]:i+2;
    const a=vertices[ia],b=vertices[ib],c=vertices[ic];
    const nearA=a[2]+a[3]>=0,nearB=b[2]+b[3]>=0,nearC=c[2]+c[3]>=0;
    if(!nearA&&!nearB&&!nearC)continue;
    const polygon=nearA&&nearB&&nearC?[a,b,c]:clipNear([a,b,c]);
    if(polygon.length<3)continue;
    const [p,q,r,s]=polygon.map(project);
    if(normals)normal.fromBufferAttribute(normals,ia).applyNormalMatrix(normalMatrix);
    const shade=normals ? .64+.36*Math.abs(normal.dot(light)) : 1;
    const shaded=[rgb[0]*shade,rgb[1]*shade,rgb[2]*shade];
    triangle(p,q,r,shaded,material.wireframe);
    if(s)triangle(p,r,s,shaded,material.wireframe);
   }
  }
  context.putImageData(frame,0,0);
 }
 return {setSize,render,setClearColor(color){backgroundColor=color;}};
}
