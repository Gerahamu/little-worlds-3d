export function bindToolbar(ctx,simulation){
 const {state,config}=ctx,listeners=[];const listen=(el,type,fn)=>{el.addEventListener(type,fn);listeners.push(()=>el.removeEventListener(type,fn));};
 document.title=config.title+' — Little Worlds';document.querySelector('#world-title').textContent=config.title;document.querySelector('#subtitle').textContent=config.subtitle;document.querySelector('#loading-title').textContent=config.title;
 const orbit=document.querySelector('#orbit');let timer;
 function toast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('show'),1800);}
 function refresh(){document.body.dataset.time=state.night?'night':'day';document.querySelector('#time-label').textContent=state.night?'NIGHT · 19:42':'DAY · 14:00';document.querySelectorAll('[data-time]').forEach(b=>b.setAttribute('aria-pressed',String((b.dataset.time==='night')===state.night)));orbit.setAttribute('aria-pressed',String(state.orbit));
  for(const kind of['traffic','people']){const b=document.querySelector('#'+kind),mode=state[kind+'Mode'];b.dataset.mode=mode;b.setAttribute('aria-pressed',mode==='active'?'true':mode==='paused'?'mixed':'false');b.setAttribute('aria-label',`${kind}: ${mode}. Click to ${{active:'pause',paused:'hide',hidden:'resume'}[mode]}.`);b.title=b.getAttribute('aria-label');}}
 function setTime(night){state.night=night;refresh();}
 for(const b of document.querySelectorAll('[data-time]'))listen(b,'click',()=>setTime(b.dataset.time==='night'));
 listen(orbit,'click',()=>{ctx.setOrbit(!state.orbit);refresh();});
 for(const kind of['traffic','people'])listen(document.querySelector('#'+kind),'click',()=>{toast(`${kind}: ${simulation.cycle(kind)}`);refresh();});
 listen(document.querySelector('#reset'),'click',()=>ctx.reset());
 listen(window,'keydown',e=>{if(/INPUT|TEXTAREA|BUTTON|SELECT/.test(e.target.tagName))return;if(e.key==='1')setTime(false);if(e.key==='2')setTime(true);if(e.key.toLowerCase()==='r')ctx.reset();if(e.code==='Space'){e.preventDefault();state.paused=!state.paused;toast(state.paused?'World paused':'World resumed');}});
 refresh();return {setTime,refresh,dispose:()=>{clearTimeout(timer);listeners.forEach(f=>f());}};
}
