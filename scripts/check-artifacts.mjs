import fs from 'node:fs';
import assert from 'node:assert/strict';
import {buildBoat} from '../dist/model.js';
const data=fs.readFileSync('dist/downloads/Catalina22_Original.glb');assert.equal(data.toString('ascii',0,4),'glTF');assert.equal(data.readUInt32LE(4),2);assert.equal(data.readUInt32LE(8),data.length);
const jsonLen=data.readUInt32LE(12),json=JSON.parse(data.toString('utf8',20,20+jsonLen));for(const id of Object.keys(buildBoat().parts))assert(json.nodes.some(n=>n.name===id),'Export is missing part '+id);
const offline=fs.readFileSync('dist/downloads/Catalina22_Viewer_Offline.html','utf8');assert(offline.includes('type="importmap"'));assert(!offline.includes('src="app.js"'));assert(!offline.includes('href="style.css"'));assert(offline.includes('data:model/gltf-binary;base64,'));
for(const file of ['README.md','AGENTS.md','docs/EDITING.md','model-data/accepted-geometry.json'])assert(fs.existsSync(file),'Missing documentation '+file);
assert(fs.statSync('dist/downloads/Catalina22_Model_Source.zip').size>100000);console.log('Export artifacts passed: valid GLB, named parts, standalone viewer, source archive.');
