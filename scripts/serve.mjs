import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary','.json':'application/json','.zip':'application/zip','.txt':'text/plain'};
const port=Number(process.env.PORT||8000);
http.createServer((req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const full=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!full.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}const stat=fs.statSync(full);if(!stat.isFile())throw Error('not a file');res.writeHead(200,{'Content-Type':types[path.extname(full)]||'application/octet-stream','Cache-Control':'no-store'});fs.createReadStream(full).pipe(res);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Model Studio: http://localhost:${port}`));
