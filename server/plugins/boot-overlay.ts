// AKM BOOT OVERLAY — Nitro render:html hook
// To swap the animation: replace BOOT_CSS, BOOT_HTML, BOOT_JS constants below.

const BOOT_CSS = `
:root{--akm-bg:#0a0a0d;--akm-panel:#131318;--akm-line:#232329;--akm-line-2:#2e2e38;--akm-ink:#d6d4de;--akm-muted:#8d8a99;--akm-dim:#5c5968;--akm-accent:#8b7ef8;--akm-green:#7fd49a;--akm-mono:"JetBrains Mono","SFMono-Regular",ui-monospace,Menlo,Consolas,monospace;--akm-sans:"Space Grotesk",-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
:root[data-theme="light"]{--akm-bg:#eceaf3;--akm-panel:#ffffff;--akm-line:#e2def0;--akm-line-2:#cec9de;--akm-ink:#1c1b24;--akm-muted:#56536a;--akm-dim:#8b8799;--akm-accent:#6d5de8;--akm-green:#2f9e63}
#akm-boot{position:fixed;inset:0;z-index:9999;background:var(--akm-bg);cursor:pointer;overflow:hidden;font:400 13px/1.6 var(--akm-mono);color:var(--akm-ink)}
#akm-boot.is-revealed{opacity:0;pointer-events:none;transition:opacity .16s steps(3)}
.akm-boot-window-wrap{position:absolute;inset:0;background:var(--akm-bg)}
.akm-boot-window{position:absolute;left:50%;top:50%;width:min(440px,86%);border:1px solid var(--akm-line-2);background:var(--akm-panel);transform:translate(-50%,-50%);transition:left .24s steps(6),top .24s steps(6),right .24s steps(6),bottom .24s steps(6),width .24s steps(6),transform .24s steps(6)}
.akm-boot-window.is-flick{animation:akmBootFlick .16s steps(2) 2}
.akm-boot-window.is-expanded{left:16px;top:16px;right:16px;bottom:16px;width:auto;transform:none}
.akm-boot-window.is-expanded .akm-boot-body{opacity:0;transition:opacity .2s ease}
.akm-boot-head{display:flex;align-items:center;gap:8px;padding:9px 11px;border-bottom:1px solid var(--akm-line);color:var(--akm-muted);font:400 11.5px/1 var(--akm-mono)}
.akm-boot-head .akm-grow{flex:1;height:8px;opacity:.5;background-image:linear-gradient(45deg,var(--akm-line-2) 25%,transparent 25%),linear-gradient(45deg,transparent 75%,var(--akm-line-2) 75%);background-position:0 0,2px 2px;background-size:4px 4px}
.akm-boot-head .akm-dot{color:var(--akm-dim);font-size:12px}
.akm-boot-body{padding:16px 18px}
.akm-boot-logo{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.akm-boot-logo svg rect{fill:var(--akm-accent)}
.akm-boot-logo b{display:block;color:var(--akm-ink);font:500 14px/1.2 var(--akm-sans)}
.akm-boot-logo em{display:block;color:var(--akm-dim);font:400 10px/1.6 var(--akm-mono);font-style:normal}
.akm-boot-log{min-height:112px;color:var(--akm-muted);font:400 11.5px/1.95 var(--akm-mono)}
.akm-boot-log div{animation:akmBootFadeIn .12s steps(2) backwards}
.akm-boot-log .ok{color:var(--akm-green)}
.akm-boot-log .accent{color:var(--akm-accent)}
.akm-boot-progress{display:flex;align-items:center;gap:12px;margin-top:14px}
.akm-boot-blocks{display:inline-flex;gap:3px}
.akm-boot-blocks i{width:10px;height:10px;background:var(--akm-line)}
.akm-boot-blocks i.is-filled{background:var(--akm-accent)}
.akm-boot-percent,.akm-boot-skip{color:var(--akm-dim);font-size:10.5px}
.akm-boot-percent{min-width:4ch}
.akm-boot-skip{position:fixed;right:12px;bottom:10px;z-index:10000;pointer-events:none}
@keyframes akmBootFlick{50%{filter:invert(.08) brightness(1.6)}}
@keyframes akmBootFadeIn{from{opacity:0}}
@media(prefers-reduced-motion:reduce){.akm-boot-window,#akm-boot{transition:none!important;animation:none!important}}
`

const BOOT_HTML = `<div id="akm-boot" aria-hidden="true"></div><div class="akm-boot-skip">клик — пропустить</div>`

const BOOT_JS = `(function(){
  var o=document.getElementById('akm-boot');
  if(!o)return;
  var revealed=false,animDone=false,pageReady=false,timers=[];
  function delay(fn,ms){timers.push(setTimeout(fn,ms));}
  function clearAll(){timers.forEach(clearTimeout);timers=[];}
  function reveal(){
    if(revealed)return;revealed=true;clearAll();
    o.classList.add('is-revealed');
    setTimeout(function(){o.remove();document.querySelector('.akm-boot-skip')&&document.querySelector('.akm-boot-skip').remove();},300);
  }
  function tryReveal(){if(animDone&&pageReady)reveal();}
  window.addEventListener('akos:ready',function(){pageReady=true;tryReveal();});
  o.addEventListener('click',reveal);
  function logo(s){return'<svg width="'+s+'" height="'+s+'" viewBox="0 0 7 7" shape-rendering="crispEdges" aria-hidden="true"><rect x="3" y="0" width="1" height="1"/><rect x="2" y="1" width="3" height="1"/><rect x="1" y="2" width="5" height="1"/><rect x="0" y="3" width="7" height="1"/><rect x="1" y="4" width="5" height="1"/><rect x="2" y="5" width="3" height="1"/><rect x="3" y="6" width="1" height="1"/></svg>';}
  var t={line:220,block:95,flick:180,expand:240,revealGap:280};
  var lines=[['accent','init kernel'],['ok','[ ok ] ядро · дисциплина'],['accent','init filesystem'],['ok','[ ok ] фс · 19 проектов'],['ok','[ ok ] память · проверена'],['ok','[ ok ] службы · запущены'],['accent','load ui · рабочий стол…']];
  var nb=14;
  o.innerHTML='<div class="akm-boot-window-wrap"><div class="akm-boot-window" id="akm-bw"><div class="akm-boot-head"><span>boot.app</span><span class="akm-grow"></span><span class="akm-dot">—</span><span class="akm-dot">□</span><span class="akm-dot">×</span></div><div class="akm-boot-body"><div class="akm-boot-logo">'+logo(26)+'<div><b>akarmainOS</b><em>v2.4 · монтирование</em></div></div><div class="akm-boot-log" id="akm-log"></div><div class="akm-boot-progress"><span class="akm-boot-blocks" id="akm-bl"></span><span class="akm-boot-percent" id="akm-pct">0%</span></div></div></div></div>';
  var win=document.getElementById('akm-bw'),log=document.getElementById('akm-log'),bl=document.getElementById('akm-bl'),pct=document.getElementById('akm-pct');
  var blocks=[];for(var i=0;i<nb;i++){var b=document.createElement('i');bl.appendChild(b);blocks.push(b);}
  lines.forEach(function(item,idx){delay(function(cls,txt){var r=document.createElement('div');r.className=cls;r.textContent=txt;log.appendChild(r);}.bind(null,item[0],item[1]),idx*t.line);});
  blocks.forEach(function(block,idx){delay(function(){block.classList.add('is-filled');pct.textContent=Math.round((idx+1)/nb*100)+'%';},idx*t.block);});
  var done=Math.max(lines.length*t.line,nb*t.block)+180;
  delay(function(){win.classList.add('is-flick');},done);
  delay(function(){win.classList.add('is-expanded');},done+t.flick);
  delay(function(){animDone=true;tryReveal();},done+t.flick+t.expand+t.revealGap);
}());`

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html) => {
    html.head.push(`<style id="akm-boot-css">${BOOT_CSS}</style>`)
    html.bodyPrepend.push(`${BOOT_HTML}<script>${BOOT_JS}<\/script>`)
  })
})
