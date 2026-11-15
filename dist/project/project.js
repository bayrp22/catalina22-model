(()=>{"use strict";
const panel=document.getElementById('videoPanel');
if(!panel)return;
const buttons=[...document.querySelectorAll('.videoChoice')];
const external=document.getElementById('youtubeOpen');
for(const button of buttons)button.addEventListener('click',()=>{
  const id=button.dataset.video;
  if(!/^[A-Za-z0-9_-]{11}$/.test(id))return;
  buttons.forEach(b=>b.classList.toggle('active',b===button));
  panel.replaceChildren();
  const iframe=document.createElement('iframe');
  iframe.title=button.textContent.trim();
  iframe.src='https://www.youtube-nocookie.com/embed/'+id+'?rel=0';
  iframe.loading='lazy';iframe.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen=true;
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  panel.appendChild(iframe);panel.classList.remove('empty');
  if(external){external.href='https://www.youtube.com/watch?v='+id;external.textContent='Open selected video on YouTube ↗';}
});
document.getElementById('printList')?.addEventListener('click',()=>window.print());
})();
