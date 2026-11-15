(()=>{
"use strict";
const $=id=>document.getElementById(id);
const safeURL=u=>{try{const p=new URL(String(u));return ['https:','http:'].includes(p.protocol)?p.href:null}catch{return null}};
const make=(tag,value='',className='')=>{const e=document.createElement(tag);e.textContent=String(value??'');if(className)e.className=className;return e;};
function downloadJSON(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),15000);}
const player=$('videoPanel');
if(player){
 const links=$('youtubeOpen'),buttons=[...document.querySelectorAll('.videoChoice')];
 for(const b of buttons)b.addEventListener('click',()=>{
  const id=b.dataset.video;
  if(!/^[a-zA-Z0-9_-]{11}$/.test(id))return;
  buttons.forEach(x=>x.classList.toggle('active',x===b));
  player.replaceChildren();
  const frame=document.createElement('iframe');
  frame.title=b.textContent;frame.loading='lazy';frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.referrerPolicy='strict-origin-when-cross-origin';frame.allowFullscreen=true;
  frame.src='https://www.youtube-nocookie.com/embed/'+id+'?rel=0';
  player.append(frame);player.classList.remove('empty');
  if(links){links.href='https://www.youtube.com/watch?v='+id;links.textContent='Open selected video on YouTube ↗';}
 });
 $('printList')?.addEventListener('click',()=>window.print());
}
const inventoryInput=$('inventoryFile');
if(!inventoryInput)return;
let current=null,chosen=null,term='',system='';
const MAX_BYTES=1000000;
const format='catalina22-inventory-layer';
const manualFallbacks=[
 [/echomap|uhd2/i,{title:'Garmin ECHOMAP UHD2 installation PDF',url:'https://www8.garmin.com/manuals/webhelp/GUID-B4327979-40C0-487D-8117-A36D7AD0FA51/EN-US/ECHOMAP_UHD2_6_7_9xsv_%28Touch%29_Install_EN-US.pdf'}],
 [/gt54/i,{title:'Garmin GT54 transducer manuals',url:'https://support.garmin.com/en-GB/?identifier=660816&tab=manuals'}],
 [/rover|rng-ctrl-rvr20/i,{title:'Renogy Rover Li 20 A user manual',url:'https://www.renogy.com/content/RNG-CTRL-RVR20/RVR203040-Manual.pdf'}],
 [/um725/i,{title:'Uniden UM725 series owners manual',url:'https://www.uniden.info/download/ompdf/UM725om.pdf'}],
 [/hf-743|ritchie/i,{title:'Ritchie compass manuals',url:'https://www.ritchienavigation.com/compass-manuals-addendums/'}],
 [/mr632|boss|mck632/i,{title:'BOSS marine receiver manuals',url:'https://bossaudio.com/collections/marine/products/791489124300'}],
 [/df15a|suzuki/i,{title:'Suzuki technical manual library (match engine prefix & serial)',url:'https://www.suzukimarine.com/technical-manual-library/'}],
 [/portable.*tank|12.?l.*tank|65000-89L10|fuel tank/i,{title:'Suzuki 12 L portable tank specifications (compatibility needs verification)',url:'https://www.suzuki.ca/product/fuel-tank/'}],
 [/mount.*bracket|transom.*bracket|motor.*platform/i,{title:'1977 Catalina 22 engine/bracket guidance (3–6 HP recommended)',url:'https://www.catalina22.org/documents/files_pdf/1977-owner_manual.pdf'}],
 [/catalina|mast|boom|mainsail|hood|rigging|spinnaker/i,{title:'1977 Catalina 22 factory manual',url:'https://www.catalina22.org/documents/files_pdf/1977-owner_manual.pdf'}]
];
const entries=()=>current?[...current.catalog.map(r=>({item:r,proposal:false})),...(current.placementProposals||[]).map(r=>({item:r,proposal:true}))]:[];
const status=message=>{$('inventoryMessage').textContent=message};
function docsFor(item){
 const docs=Array.isArray(item.manuals)?item.manuals.map(d=>({title:String(d.title||d.name||'Manual'),url:d.url||d.href})):[],
 refs=[item.referenceUrl,item.manufacturerUrl,item.manualUrl].filter(Boolean);
 for(const u of refs)docs.push({title:'Original documentation/reference',url:u});
 const matchText=[item.brand,item.model,item.name,item.label].join(' ');
 for(const [re,d] of manualFallbacks)if(re.test(matchText)&&!docs.some(x=>x.url===d.url))docs.push(d);
 const seen=new Set();return docs.map(x=>({title:x.title,url:safeURL(x.url)})).filter(x=>x.url&&!seen.has(x.url)&&seen.add(x.url));
}
function recordName(row){return row.item.name||row.item.label||'Unnamed record'}
function short(v){return v===null||v===undefined||v===''?'Not documented':String(v)}
function stat(){
 const rows=entries();$('invCount').textContent=current?String(rows.length):'—';
 $('invDocsCount').textContent=current?String(rows.reduce((n,x)=>n+docsFor(x.item).length,0)):'—';
 $('invOpenCount').textContent=current?String((current.outstanding||[]).filter(x=>!x.resolved).length):'—';
 $('inventoryExport').disabled=!current;$('inventoryClear').disabled=!current;
}
function systemOptions(){
 const select=$('inventorySystem');select.replaceChildren(new Option('All systems',''));
 const systems=[...new Set(entries().map(row=>row.item.system||'Uncategorized'))].sort();
 systems.forEach(x=>select.add(new Option(x,x)));select.value=systems.includes(system)?system:'';system=select.value;
}
function showDetail(row){
 const root=$('inventoryDetail');root.replaceChildren();
 if(!row){root.append(make('div','Equipment dossier','eyebrow'),make('h3','Choose a record'),make('p','Identity, observations, documentation, evidence and verification tasks appear here.','muted'));return;}
 const item=row.item,p=item.modelPlacement||{};
 root.append(make('div',item.id||'Proposed fitting','inv-key'),make('h3',recordName(row)));
 root.append(make('p',(row.proposal?'Proposed fit-out':'Photographed catalog')+' · '+short(item.system),'muted'));
 const g=make('div','','inv-grid');const fields=[
 ['Brand',item.brand],['Model / SKU',item.model],
 ['Quantity',item.quantity],['Observation',item.observationState||item.status],
 ['Identification confidence',item.identificationConfidence],
 ['Placement',p.locationDescription||item.locationDescription],
 ['Installation status',p.status||item.status],
 ['Mass (kg)',item.massKg?.min===null||item.massKg?.min===undefined?'Not documented':item.massKg.min===item.massKg.max?String(item.massKg.min):String(item.massKg.min)+' – '+short(item.massKg.max)],
 ['Mass evidence / basis',item.massKg?.basis],
 ['Photo / video evidence',item.evidenceFiles],
 ];
 for(const [k,v] of fields){const cell=make('div','','inv-cell');cell.append(make('b',k),make('span',short(v)));g.append(cell);}
 root.append(g);
 if(item.description){root.append(make('h4','Technical description'),make('p',item.description,'sub'));}
 const needed=item.verificationNext||item.nextVerification;
 if(needed){root.append(make('h4','Still to verify'),make('div',needed,'inv-note'));}
 const docs=docsFor(item);
 root.append(make('h4','Manuals & references'));
 if(!docs.length)root.append(make('p','No model-specific manual has been verified. Confirm exact manufacturer and model before linking instructions.','sub'));
 else{
  const ul=make('ul','','inv-manuals');
  for(const d of docs){const li=make('li');li.append(make('span',d.title));const a=make('a','Open ↗');a.href=d.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);ul.append(li);}
  root.append(ul);
 }
}
function renderRecords(){
 const holder=$('inventoryRows');holder.replaceChildren();
 const all=entries(),found=all.filter(r=>(!system||(r.item.system||'Uncategorized')===system)&&(!term||[r.item.id,recordName(r),r.item.system,r.item.brand,r.item.model,r.item.observationState,r.item.status].join(' ').toLowerCase().includes(term)));
 if(!found.length){holder.append(make('p',current?'No matching equipment records.':'Import the owner inventory JSON to see identified equipment and the proposed fit-out.','inv-empty'));showDetail(null);return;}
 if(!chosen||!found.some(r=>r.item.id===chosen))chosen=found[0].item.id;
 for(const row of found){
  const button=make('button','','inv-record'+(row.item.id===chosen?' active':''));button.type='button';
  button.append(make('strong',recordName(row)),make('small',[row.item.id,row.item.model||'',row.proposal?'Proposed fit-out':row.item.system||''].filter(Boolean).join(' · ')));
  button.addEventListener('click',()=>{chosen=row.item.id;renderRecords()});holder.append(button);
 }
 showDetail(found.find(r=>r.item.id===chosen));
}
function renderMissing(){
 const list=$('inventoryMissing');list.replaceChildren();
 if(!current){list.append(make('p','Load the owner file to review unresolved equipment, fuel, charging, mounting and safety questions.','inv-empty'));return;}
 const tasks=current.outstanding||[];
 if(!tasks.length){list.append(make('p','No pending-check list is supplied in this JSON. Individual records still retain verification notes.','inv-empty'));return;}
 tasks.forEach((task,i)=>{
   const wrap=make('div','','inv-task'+(task.resolved?' done':''));const box=document.createElement('input');box.type='checkbox';box.checked=!!task.resolved;box.id='task-'+i;
   const label=document.createElement('label');label.htmlFor=box.id;label.append(make('strong',task.title||'Unspecified check'),make('small',(task.system||'')+' · '+(task.needs||'')));
   box.addEventListener('change',()=>{task.resolved=box.checked;wrap.classList.toggle('done',box.checked);stat();status('Updated check locally. Export JSON to retain the change. A checkbox is not technical sign-off.');});
   wrap.append(box,label);list.append(wrap);
 });
}
function render(){stat();systemOptions();renderRecords();renderMissing();}
inventoryInput.addEventListener('change',async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  if(file.size>MAX_BYTES)throw Error('Inventory JSON exceeds 1 MB. Keep photos and other attachments separately.');
  const obj=JSON.parse(await file.text());
  if(!obj||obj.format!==format||obj.version!==1||!Array.isArray(obj.catalog)||obj.catalog.length>500)throw Error('Expected a Catalina 22 inventory-layer version 1 document with a catalog.');
  const identifiers=new Set();
  for(const r of obj.catalog){if(!r||typeof r.id!=='string'||identifiers.has(r.id)||typeof r.name!=='string')throw Error('Invalid or duplicated inventory ID.');identifiers.add(r.id);}
  if(obj.placementProposals!=null&&!Array.isArray(obj.placementProposals))throw Error('Proposals must be a list.');
  if(obj.outstanding!=null&&!Array.isArray(obj.outstanding))throw Error('Verification queue must be a list.');
  current=obj;chosen=null;term='';system='';$('inventorySearch').value='';
  render();status('Opened '+file.name+' locally · '+entries().length+' equipment/proposal records. No data uploaded.');
 }catch(err){status('Unable to open inventory: '+err.message)}finally{e.target.value='';}
});
$('inventoryExport').addEventListener('click',()=>{if(current)downloadJSON(current,'Catalina22_Owner_Inventory_Reviewed.json');});
$('inventoryClear').addEventListener('click',()=>{if(!current||!confirm('Clear this browser session? Export your changes first.'))return;current=null;chosen=null;term='';system='';$('inventorySearch').value='';render();status('Session inventory cleared. Private files on your device are unchanged.');});
$('inventorySearch').addEventListener('input',e=>{term=e.target.value.trim().toLowerCase();renderRecords();});
$('inventorySystem').addEventListener('change',e=>{system=e.target.value;renderRecords();});
render();
})();