// The owner-facing inventory page is the single source for item details and manuals.
export async function readEquipmentCatalog(){
 const embedded=document.querySelector('#offlineEquipment');
 let source=embedded?.content;
 if(!source){
  const response=await fetch('/project/inventory/');
  if(!response.ok)throw new Error('Equipment documentation is unavailable');
  source=new DOMParser().parseFromString(await response.text(),'text/html');
 }
 return new Map(Array.from(source.querySelectorAll('.equipment-line'),item=>{
  const name=item.querySelector('h3').textContent;
  const purpose=item.querySelector('.equipment-primary p').textContent;
  const location=item.querySelector('.equipment-location').textContent;
  const context=item.querySelector('.equipment-context');
  const specs=Array.from(context.querySelectorAll('.equipment-specs div'),row=>[
   row.querySelector('dt').textContent,row.querySelector('dd').textContent
  ]);
  const manuals=Array.from(item.querySelectorAll('.equipment-links a'),link=>({
   url:link.getAttribute('href'),title:link.textContent.replace(/\s*↗\s*$/,'')
  }));
  return [item.id,{name,purpose,location,notes:context.firstChild.textContent.trim(),specs,manuals,view:item.dataset.view}];
 }));
}

export function showEquipmentDetails(target,record){
 target.replaceChildren();
 if(!record)return;
 const location=document.createElement('p');location.textContent=record.location;
 const details=document.createElement('dl');
 for(const [label,value] of record.specs){
  const term=document.createElement('dt');term.textContent=label;
  const definition=document.createElement('dd');definition.textContent=value;
  details.append(term,definition);
 }
 const manuals=document.createElement('div');manuals.className='inspector-manuals';
 for(const reference of record.manuals){
  const link=document.createElement('a');
  link.href=reference.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=reference.title+' ↗';
  manuals.append(link);
 }
 if(!manuals.childElementCount)manuals.textContent='Manual pending model identification';
 target.append(location,details,manuals);
}
