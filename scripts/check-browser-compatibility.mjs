import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';

const profile=await mkdtemp(path.join(tmpdir(),'catalina-chrome-'));
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'18467'},stdio:'inherit'});
const browser=spawn('google-chrome',[
 '--headless','--no-sandbox','--disable-webgl','--no-first-run','--remote-debugging-port=0',
 '--user-data-dir='+profile,'http://127.0.0.1:18467/'
],{stdio:'ignore'});
browser.on('error',error=>console.error(error.message));
let socket;
try{
 const deadline=Date.now()+30_000;
 const waitFor=async read=>{
  while(Date.now()<deadline){
   const result=await read().catch(()=>null);
   if(result)return result;
   await delay(250);
  }
  throw new Error('Timed out waiting for the compatibility viewer');
 };
 const debugging=await waitFor(async()=>{
  const file=await readFile(path.join(profile,'DevToolsActivePort'),'utf8');
  const targets=await (await fetch('http://127.0.0.1:'+file.split('\n')[0]+'/json/list')).json();
  return targets.find(target=>target.type==='page')?.webSocketDebuggerUrl;
 });
 socket=new WebSocket(debugging);
 await new Promise((resolve,reject)=>{
  socket.addEventListener('open',resolve,{once:true});
  socket.addEventListener('error',reject,{once:true});
 });
 let sequence=0;
 const requests=new Map();
 socket.addEventListener('message',event=>{
  const reply=JSON.parse(event.data);
  requests.get(reply.id)?.(reply);
 });
 const command=(method,params)=>new Promise(resolve=>{
  const id=++sequence;
  requests.set(id,reply=>{requests.delete(id);resolve(reply);});
  socket.send(JSON.stringify({id,method,params}));
 });
 const evaluate=async expression=>{
  const reply=await command('Runtime.evaluate',{expression,returnByValue:true});
  return reply.result?.result?.value;
 };
 // Navigate after the test server has had time to bind the port.
 await command('Page.navigate',{url:'http://127.0.0.1:18467/'});
 await waitFor(()=>evaluate(`(() => {
  const canvas=document.querySelector('#canvasHost canvas');
  if(document.querySelector('#renderStatus')?.hidden!==false||!canvas)return false;
  const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  for(let i=4;i<pixels.length;i+=4)if(pixels[i]!==pixels[0]||pixels[i+1]!==pixels[1]||pixels[i+2]!==pixels[2])return true;
  return false;
 })()`));
 assert(await evaluate(`(() => {
  const canvas=document.querySelector('#canvasHost canvas');
  document.querySelector('[data-mode="cabin"]').click();
  canvas.dispatchEvent(new WheelEvent('wheel',{deltaY:2000,cancelable:true}));
  return document.querySelector('#cabinTravel').value==='1000' &&
   document.querySelector('#loader').hidden && document.querySelector('#error').hidden;
 })()`),'The no-WebGL path must keep the cabin controls available');
 console.log('Headless Chrome with WebGL disabled displayed the model and ran the cabin controls.');
}finally{
 socket?.close();
 browser.kill();
 server.kill();
 await rm(profile,{recursive:true,force:true,maxRetries:5});
}
