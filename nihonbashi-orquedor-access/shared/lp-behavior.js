/* Shared LP behavior: hide header downward, reveal upward; keep variant switcher independent. */
(()=>{
 const header=document.querySelector('[data-lp-header]');
 if(!header)return;
 const menu=document.querySelector('[data-lp-menu-toggle]');
 let previous=window.scrollY, distance=0, scheduled=false, keyboard=false;
 const show=()=>header.classList.remove('lp-header-hidden');
 const menuOpen=()=>menu&&menu.getAttribute('aria-expanded')==='true';
 function update(){
  scheduled=false;
  const y=Math.max(0,window.scrollY), difference=y-previous;
  if(y<140||menuOpen()||(keyboard&&header.contains(document.activeElement))){show();distance=0;previous=y;return;}
  if(difference===0)return;
  if(Math.sign(difference)!==Math.sign(distance))distance=0;
  distance+=difference;
  if(distance>14)header.classList.add('lp-header-hidden');
  else if(distance< -8)show();
  previous=y;
 }
 window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
 document.addEventListener('keydown',e=>{if(e.key==='Tab')keyboard=true;});
 document.addEventListener('pointerdown',()=>{keyboard=false;},{passive:true});
 header.addEventListener('focusin',()=>{if(keyboard)show();});
 if(menu)menu.addEventListener('click',()=>{show();distance=0;previous=window.scrollY;});
 window.addEventListener('resize',()=>{show();distance=0;previous=window.scrollY;},{passive:true});
 window.addEventListener('pageshow',()=>{show();distance=0;previous=window.scrollY;});
})();
