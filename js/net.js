/* ═══════════════════════════ EVENTS ═══════════════════════════ */
function bind(){
  document.querySelectorAll('[data-mode]').forEach(e=>e.onclick=()=>{A.mode=e.dataset.mode;render()});
  const nm=$('#nm');if(nm){nm.oninput=()=>{A.name=nm.value}}
  const nameOk=()=>{const n=cleanName(A.name);const err=$('#nmErr');if(!n||!/[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(n)){err.textContent='Add a name first';err.style.color='var(--red)';return null}if(gcount(n)>24){err.textContent='24 characters max';err.style.color='var(--red)';return null}store.set('wakeup.name',n);return n};
  $('#soloBtn')&&($('#soloBtn').onclick=()=>{Snd.unlock();const n=cleanName(A.name)||'You';A.name=n;startSolo()});
  $('#joinBtn')&&($('#joinBtn').onclick=()=>{Snd.unlock();const n=nameOk();if(n){A.name=n;joinLive()}});
  const key=$('#key');if(key)key.oninput=()=>{A.key=key.value.trim();store.set('wakeup.key',A.key)};
  $('#hostBtn')&&($('#hostBtn').onclick=()=>{Snd.unlock();if(A.lock!==false&&!A.key){$('#keyErr').textContent='Enter the passcode';return}startHost()});
  document.querySelectorAll('[data-ans]').forEach(e=>e.onclick=()=>answer(+e.dataset.ans));
  document.querySelectorAll('[data-kick]').forEach(e=>e.onclick=()=>{A.eng.kick(e.dataset.kick)});
  document.querySelectorAll('[data-act]').forEach(e=>e.onclick=ev=>{if(e.classList.contains('overlay')&&ev.target!==e)return;act(e.dataset.act)});
  const vol=$('#vol');if(vol)vol.oninput=()=>{Snd.vol=+vol.value;Snd.apply()};
}
function act(a){const E=A.eng;Snd.unlock();
  switch(a){case'next':E.next();break;case'pause':E.pause();break;case'resume':E.resume();break;
  case'mute':Snd.muted=!Snd.muted;Snd.apply();render();break;case'dock':A.dockOpen=!A.dockOpen;render();break;
  case'joining':E.set({joining:!E.joining});break;case'board':E.set({showBoard:!E.showBoard});break;case'auto':E.set({autopilot:!E.autopilot});break;
  case'endround':E.endRound();break;case'players':case'reset':case'end':case'csv':A.modal=a;render();break;case'close':A.modal=null;render();break;
  case'doreset':if(($('#resetTxt')||{}).value==='RESET'){Object.values(E.players).forEach(p=>Object.assign(p,{total:0,correct:0,time:0,round:0,last:null}));E.gid=Date.now();E.set({phase:'LOBBY',r:-1,q:-1,podium:0,paused:false,joining:true});A.modal=null;render()}break;
  case'doend':E.set({phase:'ENDED',joining:false,paused:false});A.modal=null;confetti();Snd.play('victory');break;
  case'copycsv':try{navigator.clipboard.writeText(csvText()).catch(()=>{})}catch{}break;
  case'fs':try{document.documentElement.requestFullscreen().catch(()=>{})}catch{}break;
  case'again':startSolo();break;case'home':stopEngine();A.view='home';render();break;}
}
function answer(i){if(A.view==='solo'){if(A.eng.submit(A.pid,i)){Snd.play('lock');render()}return}
  const s=eff();if(!s||s.ph!=='OPEN'||s.pz||s.rem<=0)return;const k=`${s.r}-${s.q}`;if(A.myAns&&A.myAns.k===k)return;
  A.myAns={k,a:i};Snd.play('lock');try{navigator.vibrate&&navigator.vibrate(15)}catch{}
  render();post(playerBody()).then(onPlayerData).catch(()=>{})}
document.addEventListener('keydown',e=>{if(A.view!=='host'||A.modal||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;const k=e.key.toLowerCase();
  if(k===' '||k==='arrowright'){e.preventDefault();act(A.eng.paused?'resume':'next')}else if(k==='p')act(A.eng.paused?'resume':'pause');else if(k==='l')act('board');else if(k==='m')act('mute');else if(k==='f')act('fs');else if(k==='h'){const d=$('#dock');if(d){d.style.display=d.style.display==='none'?'':'none';fitStage()}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&A.modal){A.modal=null;render()}});

/* ═══════════════════════════ MODES ═══════════════════════════ */
function stopEngine(){if(A.eng){clearInterval(A.eng.timer);A.eng=null}}
function startSolo(){stopEngine();A._conf=0;A.view='solo';const E=new Engine(A.mode,()=>{if(E.phase==='CLOSED'&&!E._rq){E._rq=1;setTimeout(()=>{E._rq=0;if(E.phase==='CLOSED')E.reveal()},700)}if(E.phase==='FINAL'&&E.podium<5)E.podium=5;render()});A.eng=E;E.joining=true;E.addPlayer(A.pid,A.name||'You');E.start();render()}
function startHost(){stopEngine();A.keyBad=false;A.view='host';A.eng=new Engine(A.mode,()=>{render();broadcast()});render();hostSync()}
function joinLive(){A.view='player';try{sessionStorage.setItem('wakeup.joined','1')}catch{}render();playerSync()}

/* ═══════════════════════════ NET ═══════════════════════════
 * A small relay keeps the room in step. The host's browser runs the game; phones
 * send their name and answer and read back the host's latest state. All clocks
 * are aligned to the server's clock, so every phone opens a question at the same
 * moment and answer times are stamped by the server, not the phone. */
async function post(body){const t0=Date.now();const r=await fetch('/api/sync',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),cache:'no-store'});
  const j=await r.json();const t1=Date.now(),rtt=t1-t0;
  if(j.now&&(rtt<=A.rtt||t1-A.rttAt>20000)){A.rtt=rtt;A.rttAt=t1;A.off=j.now-(t0+t1)/2}
  if(!r.ok)throw Object.assign(new Error(j.error||'error'),{status:r.status});return j}
/* The phone's view of the host state, advanced locally by the shared clock. */
function eff(){const s=A.snap;if(!s)return null;if(s.pz||!s.oa)return s;const now=Date.now()+A.off;
  if(s.ph==='PREVIEW')return now>=s.oa?{...s,ph:'OPEN',rem:Math.max(0,s.oa+s.lim-now)}:{...s,rem:Math.max(0,s.oa-now)};
  if(s.ph==='OPEN')return {...s,rem:Math.max(0,s.oa+s.lim-now)};
  return s}
const playerBody=()=>({role:'p',pid:A.pid,name:A.name,ans:A.myAns||null});
async function playerSync(){if(A.view!=='player'||A._ps||A.kicked)return;A._ps=1;
  try{onPlayerData(await post(playerBody()))}catch(e){if(A.connected){A.connected=false;render()}}finally{A._ps=0}}
function onPlayerData(j){if(A.view!=='player')return;A.connected=true;
  if(j.kicked){A.kicked=true;try{sessionStorage.removeItem('wakeup.joined')}catch{}render();return}
  if(j.ans&&A.myAns&&j.ans.k===A.myAns.k&&!A.myAns.at)A.myAns.at=j.ans.at;
  if(j.names)A.wait={names:j.names,n:j.n};
  const s=j.state,prev=A.snap;
  if(s){A.lastHostMsg=Date.now();
    if(!prev||s.gid>prev.gid||(s.gid===prev.gid&&s.v>=prev.v)){
      if(prev&&s.gid!==prev.gid){A.myAns=null;A.me=null;A.meK=null;A._conf=0;A._rv=null}
      A.snap=s;if(j.me){A.me=j.me;A.meK=j.mk}}
  }else if(prev&&Date.now()-A.lastHostMsg>15000){A.snap=null}
  const c=A.snap,sig=JSON.stringify([c&&[c.gid,c.ph,c.r,c.q,c.pz,c.pd,c.n,c.oa,c.top,c.pod],A.me,A.meK,!c||c.ph==='LOBBY'?A.wait:0]);
  if(sig!==A._sig){A._sig=sig;render()}}
function broadcast(){if(A._hs)A._hsAgain=1;else hostSync()}
async function hostSync(){if(A.view!=='host'||A._hs)return;A._hs=1;const E=A.eng;
  try{const body={role:'h',key:A.key,state:E.snapshot(),kicked:Object.keys(E.kicked).slice(-80)};
    body.scores={k:`${E.r}-${E.q}`,c:Object.assign({},...E.scoreChunks())};
    const j=await post(body);setConn(true);
    if(A.eng===E)for(const[pid,p]of Object.entries(j.players||{})){E.addPlayer(pid,p.name);const a=p.ans;if(a&&a.k===`${E.r}-${E.q}`&&a.at)E.submit(pid,a.a,Math.round(a.at-A.off))}
  }catch(e){setConn(false);if(e.status===401){stopEngine();A.keyBad=true;A.view='admin';render()}}
  finally{A._hs=0;if(A._hsAgain){A._hsAgain=0;hostSync()}}}
function setConn(c){A.connected=c;const d=$('#connDot');if(d){d.textContent=c?'● live':'○ …';d.style.color=c?'var(--ok)':'var(--gold)'}}
async function adminWatch(){if(A.view!=='admin')return;
  try{const j=await post({role:'w'});const sig=JSON.stringify([j.names,j.n,j.lock]);if(sig!==A._wsig){A._wsig=sig;A.lock=j.lock;A.wait={names:j.names||[],n:j.n||0};if(!document.activeElement||document.activeElement.id!=='key')render()}}catch{}}
setInterval(hostSync,450);setInterval(playerSync,900);setInterval(adminWatch,2500);

/* ═══════════════════════════ CLOCKS & LAYOUT ═══════════════════════════ */
function fitStage(){const st=$('#stage'),wr=$('#stageWrap');if(!st||!wr)return;const d=$('#dock');const dh=d&&d.style.display!=='none'?d.getBoundingClientRect().height:0;const h=Math.max(200,innerHeight-dh);wr.style.height=h+'px';st.style.transform=`scale(${Math.min(innerWidth/1600,h/900)})`}
addEventListener('resize',fitStage);
setInterval(()=>{ // smooth countdowns without re-rendering the whole page
  let rem=null;
  if(A.view==='host'||A.view==='solo'){const E=A.eng;if(!E)return;const now=E.paused?E.pausedAt:Date.now();if(E.phase==='OPEN')rem=E.deadline-now;else if(E.phase==='PREVIEW')rem=E.previewEnd-now}
  else if(A.view==='player'){const e=eff();if(!e)return;const k=`${e.ph}|${e.q}|${e.ph==='OPEN'&&e.rem<=0}`;if(k!==A._ek){A._ek=k;render()}
    if(!e.pz&&(e.ph==='OPEN'||e.ph==='PREVIEW'))rem=e.rem}
  if(rem==null)return;rem=Math.max(0,rem);const s=Math.ceil(rem/1000);
  document.querySelectorAll('[id^=cd-]').forEach(el=>{if(el.id==='cd-big'){el.textContent=Math.max(1,s);return}if(el.id==='cd-num'){el.textContent=s;return}
    if(el.id==='cd-bar'){const t=+el.dataset.total;el.style.width=Math.max(0,rem/t*100)+'%';el.style.background=rem<=3000?'#CF232B':'#1C1A19';return}
    const t=+el.dataset.total,c=2*Math.PI*44,g=el.querySelector('.rg'),x=el.querySelector('.rs');if(g){g.setAttribute('stroke-dashoffset',c*(1-Math.max(0,Math.min(1,rem/t))));const dk=x&&x.dataset.dark==='1';g.setAttribute('stroke',s<=3?'#CF232B':dk?'#F5F0E8':'#1C1A19')}if(x){x.textContent=s;x.style.color=s<=3?'#CF232B':x.dataset.dark==='1'?'#F5F0E8':'#1C1A19'}});
  if(A.view==='host'){const n=$('#answeredN');if(n&&A.eng)n.textContent=Object.keys(A.eng.ans).length}
},80);
setInterval(()=>{if(A.view==='player'&&A.snap)render()},5000); // refresh the connection indicator

A.key=store.get('wakeup.key')||'';
render();
if(IS_ADMIN)adminWatch();
else{try{if(sessionStorage.getItem('wakeup.joined')==='1'&&cleanName(A.name)){A.name=cleanName(A.name);joinLive()}}catch{}}
