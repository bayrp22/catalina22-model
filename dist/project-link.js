import {MAX_BYTES,parseInventory} from './inventory-data.js';
// URL fragments remain in the browser: no fetch, query string, backend or analytics.
export async function decodeProjectFragment(hash,partIds=null) {
  if(!hash.startsWith('#inventory='))return null;
  const encoded=hash.slice(11);
  if(!encoded||encoded.length>MAX_BYTES*1.4||!/^[A-Za-z0-9_-]+$/.test(encoded))throw Error('Invalid or oversized private project link.');
  if(typeof DecompressionStream==='undefined')throw Error('This browser cannot decompress the project link. Import the JSON backup instead.');
  const raw=atob(encoded.replace(/-/g,'+').replace(/_/g,'/'));
  const reader=new Blob([Uint8Array.from(raw,c=>c.charCodeAt(0))]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const chunks=[];let size=0;
  try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>MAX_BYTES)throw Error('Private project exceeds 1 MB after decompression.');chunks.push(value);}}
  catch(e){await reader.cancel().catch(()=>{});throw e;}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return parseInventory(new TextDecoder('utf-8',{fatal:true}).decode(bytes),partIds);
}
