/* ═══════════════════════════ RENDER ═══════════════════════════ */
function render(){
  const app=$('#app');document.body.style.overflow=A.view==='host'?'hidden':'';
  const ph=A.view==='host'||A.view==='solo'?(A.eng?`${A.eng.phase}${A.eng.r}${A.eng.q}${A.eng.podium}`:''):(eff()?`${eff().ph}${eff().r}${eff().q}${eff().pd}`:'');
  const key=`${A.view}|${ph}`;app.classList.toggle('noanim',key===A._rk);A._rk=key;
  const r=curRound();document.documentElement.style.setProperty('--accent',r===ROUNDS.length-1?'#E2A93B':'#CF232B');
  if(A.view==='home')app.innerHTML=homeHtml();
  else if(A.view==='admin')app.innerHTML=adminHtml();
  else if(A.view==='host')app.innerHTML=hostHtml();
  else app.innerHTML=playerHtml();
  bind();fitStage();
}
function curRound(){if(A.view==='host'||A.view==='solo')return A.eng?A.eng.r:-1;return A.snap?A.snap.r:-1}
const pad=n=>String(n).padStart(2,'0');
const logo=h=>`<img src="${LOGO}" alt="Physio &amp; Sole Clinic" style="height:${h}px;width:auto;display:block">`;
const word=(px,sub)=>`<div class="d" style="font-size:${px}px">Wake up<span class="red">!</span></div>${sub?`<div class="s red" style="font-size:${Math.round(px*.26)}px;margin-top:${Math.round(px*.08)}px">the 8:30 brain battle</div>`:''}`;

/* ── home ── */
function homeHtml(){
  const live=!!A.room,hostOk=A.canHost&&live;
  return `<main style="max-width:1120px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding:max(18px,env(safe-area-inset-top)) 22px 16px">
  <header class="in" style="display:flex;align-items:center;justify-content:space-between">${logo(44)}<span style="display:flex;align-items:center;gap:10px">${A.hostPresent?'<span class="sticker" style="font-size:13px;padding:6px 14px">● Live now</span>':''}${A.canHost?'<button class="btn b-soft" data-act="admin" style="min-height:40px;padding:0 16px;font-size:14px">Admin</button>':''}</span></header>
  <section class="hg" style="display:grid;gap:28px;margin-top:clamp(10px,4vh,60px);align-items:end">
   <div class="in">
    <h1 class="d" style="font-size:clamp(60px,min(19vw,15vh),190px)">Wake<br>up<span class="red">!</span></h1>
    <p class="s" style="font-size:clamp(24px,min(5vw,5vh),46px);margin-top:10px;color:var(--grey)">the <span class="red">8:30</span> brain battle</p>
   </div>
   <div class="in" style="animation-delay:.08s;background:var(--card);border-radius:34px;padding:22px 26px 26px;box-shadow:0 30px 60px -30px rgba(28,26,25,.35),inset 0 0 0 1px var(--line)">
    <label for="nm" class="kick">Your name</label>
    <input id="nm" class="field" maxlength="80" autocomplete="nickname" placeholder="Type it here" value="${esc(A.name)}">
    <div id="nmErr" style="min-height:20px;margin-top:6px;font-size:13px;font-weight:600;color:var(--grey)"></div>
    ${live?`<button class="btn b-red" id="joinBtn" style="width:100%;margin-top:8px;font-size:19px">Join game →</button>`:''}
    
    
   </div>
  </section>
  <ol class="st" style="list-style:none;display:flex;gap:10px;overflow-x:auto;margin-top:auto;padding:18px 0 4px;scrollbar-width:none">
   ${ROUNDS.map((r,i)=>`<li style="flex:none;padding:14px 18px;border-radius:22px;background:${i===ROUNDS.length-1?'var(--ink)':'var(--card)'};color:${i===ROUNDS.length-1?'var(--paper)':'inherit'};box-shadow:inset 0 0 0 1px var(--line)"><span class="s" style="font-size:22px;color:${i===ROUNDS.length-1?'var(--gold)':'var(--red)'}">${pad(i+1)}</span> <span style="font-weight:650;margin-left:4px">${r.title}</span></li>`).join('')}
  </ol></main>
  <style>@media(min-width:900px){.hg{grid-template-columns:1.25fr 1fr}}</style>`;
}


const qCount=m=>plan(m).reduce((a,r)=>a+r.qs.length,0);
const segBtns=()=>[['standard','Full · '+qCount('standard')],['quick','Quick · '+qCount('quick')]].map(([v,t])=>`<button data-mode="${v}" aria-pressed="${A.mode===v}">${t}</button>`).join('');
const waitingNames=()=>((A.wait&&A.wait.names)||[]).map(x=>cleanName(x).slice(0,24)).filter(Boolean);
/* ── admin page (/admin) ── */
function adminHtml(){const names=waitingNames(),n=Math.max(names.length,(A.wait&&A.wait.n)||0);
  return `<main style="max-width:640px;margin:0 auto;padding:max(22px,env(safe-area-inset-top)) 22px 40px">
  <header class="in">${logo(44)}</header>
  <div class="in" style="margin-top:clamp(14px,4vh,48px)"><div class="kick">Admin</div><h1 class="d" style="font-size:clamp(56px,min(15vw,12vh),120px);margin-top:6px">Host<span class="red">.</span></h1>
  <div style="margin-top:18px;background:var(--card);border-radius:34px;padding:24px 28px;box-shadow:0 30px 60px -30px rgba(28,26,25,.35),inset 0 0 0 1px var(--line)">
    <div style="display:flex;align-items:baseline;gap:12px"><span class="tab d" style="font-size:56px">${n}</span><span class="s" style="font-size:28px;color:var(--grey)">in the waiting room</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">${names.slice(0,8).map(x=>chip(x)).join('')}</div>
    ${A.lock===false?'':`<label for="key" class="kick" style="display:block;margin-top:24px">Passcode</label>
    <input id="key" class="field" type="password" autocomplete="off" value="${esc(A.key||'')}">`}
    <div id="keyErr" style="min-height:20px;margin-top:6px;font-size:13px;font-weight:600;color:var(--red)">${A.keyBad?'Wrong passcode':''}</div>
    <button class="btn b-red" id="hostBtn" style="width:100%;margin-top:6px;font-size:19px">Open the big screen →</button>
</div>
  </div></main>`}
/* ── waiting room (phone) ── */
function waitingHtml(){const names=waitingNames();if(A.name&&!names.includes(A.name))names.unshift(A.name);const n=Math.max(names.length,(A.wait&&A.wait.n)||0,A.snap?A.snap.n:0);
  return `<main class="wrapP"><div class="in" style="padding-top:max(26px,env(safe-area-inset-top))">${logo(40)}<div class="kick" style="margin-top:36px">Waiting room</div><h1 class="d" style="font-size:76px;margin-top:8px">You're in<span class="red">.</span></h1><p class="s" style="font-size:28px;color:var(--grey);margin-top:10px">the host will start soon</p>
  <div style="margin-top:30px;display:flex;align-items:baseline;gap:12px"><span class="tab d" style="font-size:56px">${n}</span><span class="s" style="font-size:24px;color:var(--grey)">here</span></div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:16px">${names.slice(0,30).map(x=>chip(x,x===A.name)).join('')}${names.length>30?`<span class="chip" style="padding:0 16px">+${names.length-30}</span>`:''}</div></div></main>`}

/* ── shared question pieces ── */
const shapeSvg=(s,c='currentColor',z=30)=>`<svg viewBox="0 0 100 100" width="${z}" height="${z}" role="img" aria-label="${s}"><path d="${SHAPE[s]}" fill="${c}"/></svg>`;
function optHtml(o,swatch,big){
  if(o.startsWith('shape:'))return `${shapeSvg(o.slice(6),'currentColor',big?44:26)}<span>${o.slice(6)[0].toUpperCase()+o.slice(7)}</span>`;
  if(swatch&&HEX[o])return `<span style="width:${big?26:16}px;height:${big?26:16}px;border-radius:50%;background:${HEX[o]};box-shadow:inset 0 0 0 1px rgba(0,0,0,.15);flex:none"></span><span>${o[0]+o.slice(1).toLowerCase()}</span>`;
  return `<span>${esc(HEX[o]?o[0]+o.slice(1).toLowerCase():o)}</span>`;
}
const chip=(n,me)=>`<span class="chip" style="${me?'background:var(--ink);color:var(--paper)':''}"><span class="dot" style="background:${tint(n)};color:#fff">${esc(initials(n))}</span><span class="nm">${esc(n)}</span></span>`;
function memGrid(layout,z,hidden){return `<div style="display:grid;grid-template-columns:repeat(3,${z}px);gap:${Math.round(z*.1)}px">${Array.from({length:9},(_,i)=>{const it=layout.find(l=>l.cell===i);return `<div class="cell ${hidden?'':'pop'}" style="width:${z}px;height:${z}px;animation-delay:${i*.035}s">${it&&!hidden?`<svg viewBox="0 0 100 100" width="${z*.6}" height="${z*.6}" role="img" aria-label="${it.colour.toLowerCase()} ${it.shape}"><path d="${SHAPE[it.shape]}" fill="${HEX[it.colour]}"/></svg>`:hidden?`<span class="s" style="opacity:.3;font-size:${z*.4}px">?</span>`:''}</div>`}).join('')}</div>`}
function stimulus(b,big,stage){
  if(b.type==='stroop')return `<div class="d pop" style="color:${HEX[b.ink]};font-size:${big?'210px':'clamp(48px,17vw,92px)'}" aria-label="The word ${b.word}">${b.word}</div>`;
  if(b.type==='memory')return stage==='preview'||stage==='revealed'?memGrid(b.layout,big?(stage==='preview'?140:84):(stage==='preview'?82:58)):(big?memGrid([],84,true):'');
  if(b.type!=='choice'||!b.display)return '';const d=b.display;
  if(d.kind==='arrow'){const rot={up:-90,down:90,left:180,right:0}[d.dir];const z=big?250:120;return `<svg class="pop" viewBox="0 0 24 24" width="${z}" height="${z}" style="transform:rotate(${rot}deg)" aria-label="Arrow pointing ${d.dir}" role="img"><path d="M4 12h15M13 5.5l6.5 6.5-6.5 6.5" stroke="#F5F0E8" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
  if(d.kind==='big')return `<div class="d pop" style="font-size:${big?'170px':'clamp(44px,15vw,76px)'};color:#F5F0E8">${d.text}</div>`;
  if(d.kind==='sequence')return `<div class="st" style="display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:${big?16:8}px">${d.items.map(it=>`<div class="tab d" style="min-width:${big?124:46}px;height:${big?124:54}px;padding:0 8px;border-radius:${big?26:14}px;display:flex;align-items:center;justify-content:center;letter-spacing:-.03em;font-size:${big?62:26}px;background:${it==='?'?'var(--accent)':'#2E2A27'};color:${it==='?'?'#fff':'#F5F0E8'}">${it.startsWith('shape:')?shapeSvg(it.slice(6),'#F5F0E8',big?80:32):it==='?'?'<span class="s" style="font-weight:400">?</span>':esc(it)}</div>`).join('')}</div>`;
  if(d.kind==='mapping'){const dot=(c,z)=>`<span style="width:${z}px;height:${z}px;border-radius:50%;background:${HEX[c]};display:inline-block"></span>`,cap=c=>c[0]+c.slice(1).toLowerCase();return `<div style="display:flex;flex-direction:column;align-items:center;gap:${big?30:14}px"><div style="display:flex;flex-wrap:wrap;justify-content:center;gap:${big?16:8}px">${d.pairs.map(([a,c])=>`<span style="display:inline-flex;align-items:center;gap:${big?12:6}px;border-radius:999px;background:#2E2A27;padding:${big?'12px 22px':'7px 12px'};font-weight:650;font-size:${big?26:14}px">${dot(a,big?20:11)}${cap(a)} <span class="s" style="opacity:.6">pairs with</span> ${dot(c,big?20:11)}${cap(c)}</span>`).join('')}</div><div class="d" style="display:flex;align-items:center;gap:${big?18:8}px;font-size:${big?90:36}px">${dot(d.target,big?60:26)}${cap(d.target)}</div></div>`}
  return '';
}
function impostorGrid(b,{tap,sel,ans,big}){const cells=Array.from({length:b.cols*b.rows},(_,i)=>i===b.oddIndex?b.odd:b.base);
  return `<div style="display:grid;grid-template-columns:repeat(${b.cols},minmax(0,1fr));gap:${big?12:6}px;width:100%;max-width:${big?b.cols*104+'px':'none'}">${cells.map((c,i)=>{const cls=ans!=null?(i===ans?'ans':'dim'):(sel===i?'sel':'');
    return tap?`<button class="cell ${cls}" data-ans="${i}" ${tap==='off'?'disabled':''} aria-label="Row ${Math.floor(i/b.cols)+1}, column ${i%b.cols+1}: ${esc(c)}" style="font-size:clamp(20px,${24/b.cols}vw,40px)">${esc(c)}</button>`:`<div class="cell ${cls}" style="font-size:${big?52:28}px">${esc(c)}</div>`}).join('')}</div>`}
function promptOf(b){return b.type==='stroop'?'Tap the ink colour':b.prompt}
function ring(rem,total,z,id,dark){const r=44,c=2*Math.PI*r,f=total?Math.max(0,Math.min(1,rem/total)):0,s=Math.ceil(rem/1000),u=s<=3&&rem>0;
  return `<div id="${id}" data-total="${total}" style="position:relative;width:${z}px;height:${z}px" role="timer" aria-label="${s} seconds left"><svg viewBox="0 0 100 100" width="${z}" height="${z}" style="transform:rotate(-90deg)"><circle cx="50" cy="50" r="${r}" fill="none" stroke="${dark?'rgba(245,240,232,.12)':'rgba(28,26,25,.1)'}" stroke-width="5"/><circle class="rg" cx="50" cy="50" r="${r}" fill="none" stroke="${u?'#CF232B':dark?'#F5F0E8':'#1C1A19'}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-f)}" style="transition:stroke-dashoffset .12s linear"/></svg><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span class="tab d rs" data-dark="${dark?1:0}" style="font-size:${z*.4}px;color:${u?'#CF232B':dark?'#F5F0E8':'#1C1A19'}">${s}</span></div></div>`}

/* ═══════════════════════════ PRESENTER ═══════════════════════════ */
function dots(E){return `<div style="display:flex;align-items:center;gap:14px" aria-label="Round ${E.r+1} of ${E.rounds.length}">${E.rounds.map((r,i)=>{const cur=i===E.r,done=i<E.r;return `<span style="width:${cur?22:12}px;height:${cur?22:12}px;border-radius:50%;background:${done||cur?(i===E.rounds.length-1?'var(--gold)':'var(--red)'):'transparent'};box-shadow:${done||cur?'none':'inset 0 0 0 2px #C9BFB3'};${cur?'outline:2px solid var(--line);outline-offset:5px':''};transition:all .4s"></span>`}).join('')}</div>`}
function hostHtml(){const E=A.eng,round=E.round,P=E.phase;
  const n=Object.keys(E.players).length;
  const header=`<header style="height:118px;display:flex;align-items:center;gap:40px;padding:0 64px"><div style="width:300px">${logo(80)}</div>
   <div style="flex:1;display:flex;justify-content:center">${E.r>=0&&round?`<div style="text-align:center"><div class="s" style="font-size:26px;color:var(--grey)">Round ${pad(E.r+1)}${E.q>=0&&['PREVIEW','OPEN','CLOSED','REVEAL'].includes(P)?` · question ${E.q+1} of ${round.qs.length}`:''}</div><div style="margin-top:10px;display:flex;justify-content:center">${dots(E)}</div></div>`:''}</div>
   <div style="width:300px;text-align:right"><div class="d tab" style="font-size:44px">${n}</div><div class="kick">playing</div></div></header>`;
  let body='';
  if(P==='LOBBY'){const names=Object.entries(E.players).sort((a,b)=>a[1].joined-b[1].joined).slice(-48);
    body=`<div style="display:grid;grid-template-columns:1fr 470px;gap:64px;height:100%;padding:0 64px">
     <div style="display:flex;flex-direction:column;min-height:0">
      <div class="in">${word(200,false)}<div class="s" style="font-size:52px;margin-top:16px;color:var(--grey)">six rounds, <span class="red">five winners</span></div></div>
      <div class="st" style="margin-top:40px;display:flex;flex-wrap:wrap;gap:10px;align-content:flex-start;overflow:hidden;flex:1">${names.length?names.map(([,p])=>chip(p.name)).join(''):'<div class="s" style="font-size:34px;color:var(--mute)">waiting for the first brave soul…</div>'}</div></div>
     <div class="in" style="animation-delay:.1s;align-self:start;background:var(--card);border-radius:40px;padding:38px;box-shadow:0 40px 80px -40px rgba(28,26,25,.4),inset 0 0 0 1px var(--line);transform:rotate(1.2deg)">
      <img src="/api/qr" alt="QR code to join" style="width:394px;height:394px;display:block">
      <div style="display:flex;align-items:baseline;justify-content:space-between;margin-top:24px"><div class="d" style="font-size:52px">Scan<span class="red">.</span> Play<span class="red">.</span></div>${E.joining?'':'<span class="sticker" style="font-size:16px">Closed</span>'}</div><div class="tab" style="margin-top:10px;font-size:22px;font-weight:650;color:var(--grey);word-break:break-all">${esc(location.host)}</div></div></div>
     <div class="marq" style="position:absolute;left:-40px;right:-40px;bottom:6px;transform:rotate(-1.5deg);padding:16px 0"><div class="d" style="font-size:34px;font-weight:700;letter-spacing:-.02em">${Array(8).fill('Wake up <span class="red">✦</span> <span class="s" style="font-weight:400">moving beyond recovery</span> <span class="red">✦</span> ').join('')}</div></div>`}
  else if(P==='INTRO'){const f=round.m>1;body=`<div style="position:relative;height:100%;padding:0 64px;display:flex;align-items:center">
     <div class="d outline pop" style="position:absolute;right:30px;top:-40px;font-size:560px;letter-spacing:-.06em;${f?'-webkit-text-stroke-color:var(--gold)':''}">${pad(E.r+1)}</div>
     <div class="in" style="position:relative;max-width:1050px"><div class="s" style="font-size:44px;color:${f?'#B07A12':'var(--red)'}">${f?'the final':'round '+(E.r+1)}</div>
      <h1 class="d" style="font-size:156px;margin-top:10px">${round.title}</h1>
      <p class="s" style="font-size:56px;margin-top:28px;color:var(--grey);line-height:1">${round.sub}</p>
      ${f?'<div style="display:flex;gap:12px;margin-top:40px"><span class="sticker" style="background:var(--gold);color:var(--ink);font-size:24px;padding:12px 24px">×2 points</span><span class="sticker" style="background:var(--ink);font-size:24px;padding:12px 24px;transform:rotate(1.5deg)">Leaderboard hidden</span></div>':''}</div></div>`}
  else if(P==='PREVIEW'){const b=E.item.b;const rem=Math.max(0,E.previewEnd-(E.paused?E.pausedAt:Date.now()));
    body=b.type==='memory'?`<div style="height:100%;padding:0 64px 24px;display:grid;grid-template-columns:420px 1fr;gap:56px;align-items:center"><div class="in"><div class="d" style="font-size:110px">Memorise<span class="red">.</span></div><div style="margin-top:36px">${ring(rem,5000,150,'cd-prev')}</div></div><div class="stagecard in" style="height:100%;display:flex;align-items:center;justify-content:center">${stimulus(b,true,'preview')}</div></div>`
     :`<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="tab d red" id="cd-big" style="font-size:380px;line-height:.8">${Math.max(1,Math.ceil(rem/1000))}</div><div class="s" style="font-size:54px;color:var(--grey);margin-top:26px">get ready${round.m>1?' — double points':''}</div></div>`}
  else if(['OPEN','CLOSED','REVEAL'].includes(P))body=presenterQuestion(E);
  else if(P==='RESULTS')body=resultsHtml(E);
  else body=finalHtml(E);
  const pausedOv=E.paused?`<div style="position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(245,240,232,.9);backdrop-filter:blur(6px)"><div class="d" style="font-size:180px">Paused<span class="red">.</span></div><div class="s" style="font-size:48px;color:var(--grey)">back in a moment</div></div>`:'';
  return `<div id="stageWrap"><div id="stage">${header}<div style="position:relative;height:782px;padding-bottom:40px">${body}${pausedOv}</div></div></div>${dockHtml()}${modalHtml()}`;
}
function presenterQuestion(E){const b=E.item.b,P=E.phase,rev=P==='REVEAL',ans=rev?E.answer:null,tot=Object.keys(E.ans).length,n=Object.keys(E.players).length;
  const pct=i=>rev&&E.counts&&tot?Math.round(E.counts[i]/tot*100):null;
  const rem=Math.max(0,E.deadline-(E.paused?E.pausedAt:Date.now()));
  const side=`<aside style="display:flex;flex-direction:column;align-items:center;gap:26px">${P==='OPEN'?ring(rem,E.limit,190,'cd-open'):`<div style="width:190px;height:190px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${rev?'var(--ok)':'var(--ink)'};color:#fff"><span class="s" style="font-size:40px">${rev?'reveal':'time'}</span></div>`}
    <div style="text-align:center"><div class="tab d" id="answeredN" style="font-size:84px">${tot}</div><div class="s" style="font-size:28px;color:var(--grey)">of ${n} in</div></div>
    ${rev&&ans!=null?`<div class="pop" style="text-align:center"><div class="tab d" style="font-size:64px;color:var(--ok)">${E.counts[ans]||0}</div><div class="s" style="font-size:28px;color:var(--grey)">got it</div></div>`:''}
    ${E.round.m>1?'<span class="sticker" style="background:var(--gold);color:var(--ink);font-size:22px">×2</span>':''}</aside>`;
  let main;
  if(b.type==='majority'){const w=E.winners||[];main=`<div style="display:flex;flex-direction:column;height:100%"><h2 class="d" style="font-size:72px;letter-spacing:-.04em;line-height:.95">${esc(b.prompt)}</h2><p class="s" style="font-size:36px;color:var(--grey);margin-top:12px">pick what the room picks</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:30px;flex:1">${b.options.map((o,i)=>{const win=rev&&w.includes(i);return `<div class="in" style="animation-delay:${i*.08}s;position:relative;overflow:hidden;border-radius:36px;padding:40px;display:flex;flex-direction:column;justify-content:flex-end;background:${win?'var(--red)':'var(--card)'};color:${win?'#fff':'inherit'};box-shadow:inset 0 0 0 1.5px var(--line);opacity:${rev&&!win?.55:1}">
     ${rev?`<div style="position:absolute;left:0;right:0;bottom:0;height:${pct(i)||0}%;background:${win?'rgba(0,0,0,.14)':'rgba(28,26,25,.06)'};animation:rise 1.6s cubic-bezier(.16,1,.3,1) .3s both"></div>`:''}
     <div style="position:relative"><div class="s" style="font-size:40px;opacity:.75">${i?'b':'a'}</div><div class="d" style="font-size:58px;margin-top:6px">${esc(o)}</div>
     ${rev?`<div class="pop tab d" style="animation-delay:1.1s;font-size:150px;margin-top:20px">${pct(i)||0}<span style="font-size:70px">%</span></div>`:''}</div></div>`}).join('')}</div></div>`}
  else if(b.type==='impostor')main=`<div style="display:flex;flex-direction:column;height:100%"><h2 class="d" style="font-size:64px">${esc(b.prompt)}</h2><div class="stagecard" style="flex:1;margin-top:26px;display:flex;align-items:center;justify-content:center;padding:26px">${impostorGrid(b,{ans,big:true})}</div></div>`;
  else{const sw=b.type!=='stroop';main=`<div style="display:flex;flex-direction:column;height:100%">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">${b.quiz?`<h2 class="s red" style="font-size:44px">How well do you know PSC?</h2>`:`<h2 class="d" style="font-size:64px">${esc(promptOf(b))}</h2>`}${b.rule?`<span class="sticker" style="font-size:24px;padding:10px 20px">${esc(b.rule)}</span>`:''}</div>
    <div class="stagecard" style="flex:1;min-height:0;margin:22px 0;display:flex;align-items:center;justify-content:center;padding:20px">${b.quiz?`<div class="d in" style="position:relative;z-index:1;text-align:center;padding:0 50px;line-height:.98;font-size:${b.prompt.length>36?78:96}px">${esc(b.prompt)}</div>`:stimulus(b,true,rev?'revealed':'open')}</div>
    <div class="big" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${b.options.map((o,i)=>{const st=ans!=null?(i===ans?'ok':'dim'):'';const p=pct(i);return `<div class="tile ${b.quiz?'kq kq'+i:''} ${st} in" style="animation-delay:${i*.05}s">${p!=null?`<span class="bar" style="width:${p}%"></span>`:''}<span class="let">${st==='ok'?'✓':'abcd'[i]}</span><span class="txt">${optHtml(o,sw,true)}</span>${p!=null?`<span class="num tab" style="font-size:32px">${p}%</span>`:''}</div>`}).join('')}</div></div>`}
  return `<div style="display:grid;grid-template-columns:1fr 230px;gap:44px;height:100%;padding:0 64px">${'<div style="min-height:0">'+main+'</div>'}${side}</div>`}
function resultsHtml(E){const R=E.ranked(),r=E.round;
  const prev={};[...R].map(p=>({id:p.id,t:p.total-p.round})).sort((a,b)=>b.t-a.t).forEach((p,i)=>prev[p.id]=i+1);
  if(!E.showBoard)return `<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center"><div class="d" style="font-size:150px">Round ${E.r+1}<span class="red">.</span> Done<span class="red">.</span></div><div class="s" style="font-size:48px;color:var(--grey);margin-top:20px">scores are on your phone</div></div>`;
  const top=[...R].sort((a,b)=>b.round-a.round).slice(0,3);
  return `<div style="display:grid;grid-template-columns:1fr 430px;gap:56px;height:100%;padding:0 64px"><div><div style="display:flex;align-items:baseline;gap:20px;margin-bottom:20px"><h2 class="d" style="font-size:84px">Leaderboard</h2><span class="s" style="font-size:34px;color:var(--grey)">after round ${E.r+1}</span></div>
   <ol class="lb st" style="display:flex;flex-direction:column;gap:9px">${R.slice(0,9).map(p=>{const mv=E.r>0?prev[p.id]-p.rank:0;return `<li style="${p.rank===1?'background:var(--ink);color:var(--paper);box-shadow:none':''}"><span class="s tab" style="width:46px;font-size:40px;color:${p.rank<=3?(p.rank===1?'var(--gold)':'var(--red)'):'var(--mute)'}">${p.rank}</span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:28px;font-weight:650;letter-spacing:-.02em">${esc(p.name)}</span><span style="width:54px;text-align:center;font-weight:700;font-size:18px;color:${mv>0?'var(--ok)':mv<0?'var(--red)':'#C9BFB3'}">${mv>0?'↑'+mv:mv<0?'↓'+(-mv):'—'}</span><span class="tab d" style="width:130px;text-align:right;font-size:34px">${p.total.toLocaleString()}</span></li>`}).join('')}</ol></div>
   <aside class="in" style="align-self:start;margin-top:22px;background:var(--red);color:#fff;border-radius:36px;padding:34px;transform:rotate(-1.2deg)"><div class="s" style="font-size:34px;opacity:.85">round ${E.r+1} stars</div><ol style="list-style:none;margin-top:18px;display:flex;flex-direction:column;gap:14px">${top.map(p=>`<li style="display:flex;align-items:baseline;gap:12px"><span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:28px;font-weight:650">${esc(p.name)}</span><span class="tab d" style="font-size:32px">+${p.round}</span></li>`).join('')}</ol>
   ${E.r===E.rounds.length-2?'<div class="s" style="margin-top:26px;font-size:30px;border-top:1px solid rgba(255,255,255,.3);padding-top:18px">next: the final round</div>':''}</aside></div>`}
function podiumHtml(list,step){const W=268,places=[[4,'#776F64','#fff',150],[2,'#1C1A19','#F5F0E8',250],[1,'#CF232B','#fff',320],[3,'#E2A93B','#1C1A19',200],[5,'#D9CFC1','#1C1A19',110]];
  return `<div style="display:flex;align-items:flex-end;justify-content:center;gap:14px">${places.map(([rk,bg,fg,h])=>{const show=step>=6-rk,ppl=list.filter(p=>p[2]===rk),base=rk===1?66:rk<=3?46:36;
   return `<div style="width:${W}px;display:flex;flex-direction:column;align-items:center">
   ${show?`<div class="pop" style="margin-bottom:14px;text-align:center;width:100%;animation-delay:.25s">${rk===1?'<div style="font-size:72px;line-height:1;animation:bob 2.4s ease-in-out infinite">👑</div>':''}${ppl.map(p=>`<div class="d" style="font-size:${Math.max(24,Math.min(base,Math.floor(W*1.8/Math.max(4,gcount(p[0])))))}px;overflow-wrap:break-word;margin-top:6px;letter-spacing:-.035em;line-height:.95">${esc(p[0])}</div><div class="s tab" style="font-size:${rk===1?40:30}px;color:var(--grey);margin-top:4px">${p[1].toLocaleString()} pts</div>`).join('')||'<div class="s" style="color:var(--mute);font-size:30px">—</div>'}</div>`:''}
   <div style="width:100%;height:${(show?h:h*.3)+24}px;border-radius:34px 34px 0 0;overflow:hidden;background:${show?bg:'var(--paper2)'};color:${fg};display:flex;justify-content:center;padding-top:14px;transition:height .9s cubic-bezier(.34,1.3,.64,1),background .4s"><div class="s tab" style="font-size:${Math.min(160,Math.round(h*.8))}px;line-height:.9;opacity:${show?1:.25};color:${show?fg:'var(--grey)'}">${rk}</div></div></div>`}).join('')}</div>`}
function finalHtml(E){const step=E.phase==='ENDED'?5:E.podium;const list=E.ranked().filter(p=>p.rank<=5).map(p=>[p.name,p.total,p.rank]);
  return `<div style="display:flex;flex-direction:column;align-items:center;height:100%;padding:0 64px"><div class="d" style="font-size:92px;text-align:center">${step>=5?'Wide awake<span class="red">.</span>':'And the top five…'}</div><div style="margin-top:auto;width:100%">${podiumHtml(list,step)}</div></div>`}
function nextLabel(E){const P=E.phase;return P==='LOBBY'?'Start':P==='INTRO'?'Go':P==='PREVIEW'?'Open now':P==='OPEN'?'Close':P==='CLOSED'?'Reveal':P==='REVEAL'?(E.q+1<E.round.qs.length?'Next':E.r===E.rounds.length-1?'Finale':'Scores'):P==='RESULTS'?`Round ${E.r+2}`:P==='FINAL'?['5th place','4th place','3rd place','2nd place','Champion','Done'][E.podium]:'Done'}
function dockHtml(){const E=A.eng;const dis=(E.phase==='LOBBY'&&!Object.keys(E.players).length)||(E.phase==='FINAL'&&E.podium>=5)||E.phase==='ENDED';
  return `<div id="dock"><div class="bar2">
   <button class="btn b-red" data-act="${E.paused?'resume':'next'}" style="min-width:150px" ${!E.paused&&dis?'disabled':''}>${E.paused?'Resume':nextLabel(E)} →</button>
   ${!E.paused&&!['LOBBY','FINAL','ENDED'].includes(E.phase)?'<button class="btn b-soft" data-act="pause">Pause</button>':''}
   ${E.phase==='OPEN'?`<span class="tab" style="font-weight:650;padding:0 8px">${Object.keys(E.ans).length}/${Object.keys(E.players).length}</span>`:''}
   <span style="margin-left:auto;display:flex;align-items:center;gap:6px"><span id="connDot" class="kick" style="color:${A.connected?'var(--ok)':'var(--gold)'}">${A.connected?'● live':'○ …'}</span>
   <button class="btn b-soft" data-act="mute" aria-label="${Snd.muted?'Unmute':'Mute'}" style="padding:0;width:44px">${Snd.muted?'🔇':'🔊'}</button><input type="range" id="vol" min="0" max="1" step="0.05" value="${Snd.vol}" aria-label="Volume" style="width:90px;accent-color:#CF232B">
   <button class="btn b-soft" data-act="dock" aria-expanded="${A.dockOpen}" aria-label="More host controls" style="padding:0;width:44px">${A.dockOpen?'×':'⋯'}</button></span>
   ${A.dockOpen?`<div style="flex-basis:100%;display:flex;flex-wrap:wrap;gap:8px;padding-top:8px;border-top:1px solid var(--line)">
    <button class="btn b-soft" data-act="joining">${E.joining?'Joining open':'Joining closed'}</button>
    <button class="btn b-soft" data-act="board">${E.showBoard?'Board shown':'Board hidden'}</button>
    <button class="btn b-soft" data-act="auto">Autopilot ${E.autopilot?'on':'off'}</button>
    ${['INTRO','CLOSED','REVEAL'].includes(E.phase)?'<button class="btn b-soft" data-act="endround">End round</button>':''}
    <button class="btn b-soft" data-act="players">Players</button>
    <button class="btn b-soft" data-act="csv">Results</button>
    <button class="btn b-soft" data-act="fs">Fullscreen</button>
    <span style="margin-left:auto;display:flex;gap:8px">${E.phase!=='ENDED'?'<button class="btn b-line" data-act="end">End</button>':''}<button class="btn b-line" data-act="reset">Reset</button></span>
    <div class="s" style="flex-basis:100%;font-size:16px;color:var(--grey)">space next · p pause · l board · m mute · f fullscreen · h hide</div></div>`:''}
  </div></div>`}
function modalHtml(){if(!A.modal)return '';const E=A.eng;let inner='';const btns=(a,b)=>`<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:22px">${a}${b}</div>`;
  if(A.modal==='reset')inner=`<h2 class="d" style="font-size:44px">Reset<span class="red">?</span></h2><p class="s" style="font-size:24px;color:var(--grey);margin-top:8px">scores cleared, players stay</p><input id="resetTxt" class="field" style="margin-top:16px" placeholder="type RESET">${btns('<button class="btn b-soft" data-act="close">Cancel</button>','<button class="btn b-red" data-act="doreset">Reset</button>')}`;
  if(A.modal==='end')inner=`<h2 class="d" style="font-size:44px">End now<span class="red">?</span></h2><p class="s" style="font-size:24px;color:var(--grey);margin-top:8px">straight to the podium</p>${btns('<button class="btn b-soft" data-act="close">Cancel</button>','<button class="btn b-red" data-act="doend">End game</button>')}`;
  if(A.modal==='players')inner=`<h2 class="d" style="font-size:44px">Players <span class="s red" style="font-weight:400">${Object.keys(E.players).length}</span></h2><ul style="list-style:none;max-height:50vh;overflow:auto;margin-top:16px;display:flex;flex-direction:column;gap:8px">${E.ranked().map(p=>`<li style="display:flex;align-items:center;gap:12px;background:var(--paper);border-radius:18px;padding:6px 6px 6px 16px"><span class="s tab red" style="width:30px;font-size:24px">${p.rank}</span><span style="flex:1;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(p.name)}</span><span class="tab" style="font-weight:800">${p.total}</span><button class="btn b-line" style="min-height:40px;padding:0 14px;font-size:14px" data-kick="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">Remove</button></li>`).join('')||'<li class="s" style="color:var(--mute);font-size:22px">nobody yet</li>'}</ul>${btns('','<button class="btn b-ink" data-act="close">Close</button>')}`;
  if(A.modal==='csv')inner=`<h2 class="d" style="font-size:44px">Results</h2><p class="s" style="font-size:22px;color:var(--grey);margin-top:6px">copy into a spreadsheet</p><textarea readonly style="width:100%;height:220px;margin-top:14px;background:var(--paper);border:0;border-radius:18px;padding:14px;font-family:ui-monospace,monospace;font-size:12px">${esc(csvText())}</textarea>${btns('<button class="btn b-soft" data-act="close">Close</button>','<button class="btn b-red" data-act="copycsv">Copy</button>')}`;
  return `<div class="overlay" data-act="close"><div class="modal" role="dialog" aria-modal="true" onclick="event.stopPropagation()">${inner}</div></div>`}
function csvText(){const c=v=>{let s=String(v);if(/^[=+\-@]/.test(s))s="'"+s;return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};return ['Rank,Name,Total,Correct answers,Correct response time (ms)',...A.eng.ranked().map(p=>[p.rank,p.name,p.total,p.correct,p.time].map(c).join(','))].join('\n')}

/* ═══════════════════════════ PHONE (player & solo) ═══════════════════════════ */
function myView(){
  if(A.view==='solo'){const E=A.eng,p=E.players[A.pid]||{total:0,round:0},R=E.ranked(),me=R.find(x=>x.id===A.pid);const hide=E.round&&E.round.hide&&E.phase!=='FINAL'&&E.phase!=='ENDED';
    return {ph:E.phase,r:E.r,q:E.q,pz:E.paused,rem:E.phase==='OPEN'?E.deadline-(E.paused?E.pausedAt:Date.now()):E.phase==='PREVIEW'?E.previewEnd-(E.paused?E.pausedAt:Date.now()):0,n:R.length,mode:E.mode,
     ans:E.phase==='REVEAL'?E.answer:undefined,cnt:E.phase==='REVEAL'?E.counts:null,win:E.winners,pd:E.phase==='ENDED'?5:E.podium,pod:R.filter(x=>x.rank<=5).map(x=>[x.name,x.total,x.rank]),top:null,
     me:{total:p.total,rank:hide?0:(me?me.rank:0),base:p.last?p.last.base:0,speed:p.last?p.last.speed:0,ok:p.last?p.last.ok:0,a:p.last?p.last.ans:-1,round:p.round,name:p.name},answered:E.ans[A.pid]?E.ans[A.pid].a:null}}
  const s=eff();if(!s)return null;const m=A.me||[0,0,0,0,0,-1,0,A.name];
  return {...s,me:{total:m[0],rank:m[1],base:m[2],speed:m[3],ok:m[4],a:m[5],round:m[6],name:m[7]||A.name},answered:A.myAns&&A.myAns.k===`${s.r}-${s.q}`?A.myAns.a:null}}
function playerHtml(){const V=myView();if(A.kicked)return center('Removed.','by the host');
  if(!V||V.ph==='LOBBY')return waitingHtml();
  const rounds=A.view==='solo'?A.eng.rounds:plan(V.mode||'quick');const round=rounds[V.r];
  const live=A.view==='solo'||(A.connected&&Date.now()-A.lastHostMsg<6000);
  const head=`<header style="position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:12px;padding:max(14px,env(safe-area-inset-top)) 18px 12px;background:rgba(245,240,232,.9);backdrop-filter:blur(10px)"><span style="width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;color:#fff;background:${tint(V.me.name||'?')}">${esc(initials(V.me.name||'?'))}</span><div style="flex:1;min-width:0"><div style="font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(V.me.name||'')}</div><div class="s" style="font-size:16px;color:${live?'var(--grey)':'#B07A12'}">${!live?'reconnecting…':V.me.rank?'rank '+V.me.rank:A.view==='solo'?'practice':'rank hidden'}</div></div><div class="tab d" style="font-size:30px">${V.me.total.toLocaleString()}</div><button class="btn b-soft" data-act="mute" style="padding:0;width:42px;min-height:42px" aria-label="${Snd.muted?'Unmute':'Mute'}">${Snd.muted?'🔇':'🔊'}</button></header>`;
  let b='';const P=V.ph,it=round&&round.qs[V.q];
  if(P==='LOBBY')b=`<div class="in" style="padding-top:34px">${logo(40)}<h1 class="d" style="font-size:76px;margin-top:40px">You're in<span class="red">.</span></h1><p class="s" style="font-size:30px;color:var(--grey);margin-top:12px">eyes on the big screen</p><div style="margin-top:40px;display:flex;align-items:baseline;gap:12px"><span class="tab d" style="font-size:64px">${V.n}</span><span class="s" style="font-size:26px;color:var(--grey)">awake so far</span></div></div>`;
  else if(P==='INTRO')b=`<div class="in" style="position:relative;padding-top:30px;min-height:56dvh"><div class="d outline" style="position:absolute;right:-10px;top:0;font-size:220px;-webkit-text-stroke-width:2px;${round.m>1?'-webkit-text-stroke-color:var(--gold)':''}">${pad(V.r+1)}</div><div style="position:relative;padding-top:120px"><div class="s red" style="font-size:28px;${round.m>1?'color:#B07A12':''}">${round.m>1?'the final':'round '+(V.r+1)}</div><h1 class="d" style="font-size:58px;margin-top:6px">${round.title}</h1><p class="s" style="font-size:28px;color:var(--grey);margin-top:14px;line-height:1.05">${round.sub}</p></div></div>${A.view==='solo'?nextBtn('Go'):''}`;
  else if(P==='PREVIEW'){b=it.b.type==='memory'?`<div class="in" style="padding-top:20px"><div style="display:flex;justify-content:space-between;align-items:center"><h2 class="d" style="font-size:46px">Memorise<span class="red">.</span></h2>${ring(V.rem,5000,64,'cd-prev')}</div><div class="stagecard" style="margin-top:20px;padding:22px;display:flex;justify-content:center">${stimulus(it.b,false,'preview')}</div></div>`
     :`<div style="text-align:center;padding-top:90px"><div class="tab d red" id="cd-big" style="font-size:190px;line-height:.8">${Math.max(1,Math.ceil(V.rem/1000))}</div><p class="s" style="font-size:30px;color:var(--grey);margin-top:20px">get ready</p></div>`}
  else if(P==='OPEN')b=A.view==='player'&&V.rem<=0&&V.answered==null?center("Time's up.",'reveal coming',true):answerHtml(V,it,round);
  else if(P==='CLOSED')b=center(V.answered!=null?'Locked.':"Time's up.",'reveal coming',true);
  else if(P==='REVEAL')b=revealHtml(V,it,round)+(A.view==='solo'?nextBtn(V.q+1<round.qs.length?'Next':V.r===rounds.length-1?'Finish':'Scores'):'');
  else if(P==='RESULTS')b=`<div class="in" style="padding-top:26px"><div class="s red" style="font-size:26px">round ${V.r+1} done</div><div style="display:flex;align-items:baseline;gap:10px;margin-top:6px"><span class="tab d" style="font-size:96px">${V.me.rank?V.me.rank:'—'}</span><span class="s" style="font-size:30px;color:var(--grey)">${V.me.rank?'place':''}</span></div><div class="s" style="font-size:26px;color:var(--grey)">+${V.me.round} this round</div>
    ${V.top?`<ol class="lb sm st" style="display:flex;flex-direction:column;gap:7px;margin-top:26px">${V.top.map(t=>`<li style="${t[0]===V.me.name?'background:var(--ink);color:var(--paper);box-shadow:none':''}"><span class="s tab red" style="width:22px;font-size:24px">${t[2]}</span><span style="flex:1;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t[0])}</span><span class="tab" style="font-weight:800">${t[1].toLocaleString()}</span></li>`).join('')}</ol>`:''}</div>${A.view==='solo'?nextBtn(V.r===rounds.length-2?'Final round':'Next round'):''}`;
  else if(P==='FINAL'||P==='ENDED'){const done=P==='ENDED'||V.pd>=5,won=done&&V.me.rank&&V.me.rank<=5&&A.view!=='solo';const solo=A.view==='solo';
    b=`<div class="in" style="padding-top:26px">${solo?`<div class="s red" style="font-size:28px">practice done</div><div class="tab d" style="font-size:110px;margin-top:6px">${V.me.total.toLocaleString()}</div><div class="s" style="font-size:26px;color:var(--grey)">out of ${maxScore(rounds).toLocaleString()}</div><p class="d" style="font-size:34px;margin-top:30px;letter-spacing:-.03em">${scoreBlurb(V.me.total,maxScore(rounds))}</p><button class="btn b-red" data-act="again" style="width:100%;margin-top:30px">Play again</button><button class="btn b-line" data-act="home" style="width:100%;margin-top:10px">Home</button>`
     :`<div class="s red" style="font-size:28px">${done?'final':'the reveal'}</div><h2 class="d" style="font-size:62px;margin-top:6px">${done?(won?['Champion!','Second!','Third!','Fourth!','Fifth!'][V.me.rank-1]:'Thank you<span class="red">.</span>'):'Look up<span class="red">.</span>'}</h2>
     <div style="display:flex;gap:30px;margin-top:22px"><div><div class="tab d" style="font-size:52px">${V.me.total.toLocaleString()}</div><div class="s" style="font-size:22px;color:var(--grey)">points</div></div><div><div class="tab d" style="font-size:52px">${done&&V.me.rank?'#'+V.me.rank:'?'}</div><div class="s" style="font-size:22px;color:var(--grey)">place</div></div></div>
     ${V.pod&&V.pod.length?`<div class="kick" style="margin-top:30px">Top five</div><ol class="lb sm st" style="display:flex;flex-direction:column;gap:7px;margin-top:10px">${[...V.pod].sort((a,b)=>a[2]-b[2]).map(t=>`<li style="${t[2]===1?'background:var(--red);color:#fff;box-shadow:none':t[0]===V.me.name?'background:var(--ink);color:var(--paper);box-shadow:none':''}"><span class="s tab" style="width:22px;font-size:26px">${t[2]}</span><span style="flex:1;font-weight:650;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(t[0])}</span><span class="tab" style="font-weight:800">${t[1].toLocaleString()}</span></li>`).join('')}</ol>`:''}`}</div>`;
    if(won&&!A._conf){A._conf=1;setTimeout(confetti,400)}}
  return `${head}<main class="wrapP">${V.pz?'<div class="sticker" style="margin:6px 0 4px;font-size:14px">Paused</div>':''}${b}</main>`}
function maxScore(rounds){return rounds.reduce((a,r)=>a+r.qs.reduce((x,q)=>x+(q.b.type==='majority'?100:150)*r.m,0),0)}
function scoreBlurb(s,m){const p=s/m;return p>.8?'Wide awake. Podium material.':p>.55?'Sharp. One more coffee.':p>.3?'Warming up nicely.':'Still waking up — go again.'}
const nextBtn=l=>`<button class="btn b-ink" data-act="next" style="width:100%;margin-top:26px;font-size:18px">${l} →</button>`;
function center(t,s,inner){const h=`<div class="in" style="padding-top:70px"><h2 class="d" style="font-size:72px">${t}</h2><p class="s" style="font-size:30px;color:var(--grey);margin-top:10px">${s}</p></div>`;return inner?h:`<main class="wrapP">${h}</main>`}
function answerHtml(V,it,round){const b=it.b,locked=V.answered!=null;const tot=it.t||round.t;
  let opts;if(b.type==='impostor')opts=`<div class="stagecard" style="padding:12px;margin-top:14px">${impostorGrid(b,{tap:locked||V.pz?'off':'on',sel:V.answered})}</div>`;
  else opts=`<div ${b.quiz?'class="kgrid" style="margin-top:14px"':'style="display:flex;flex-direction:column;gap:9px;margin-top:4px"'}>${b.options.map((o,i)=>`<button class="tile ${b.quiz?'kq kq'+i:''} ${locked?(V.answered===i?'sel':'dim'):''} in" style="animation-delay:${i*.04}s" data-ans="${i}" ${locked||V.pz?'disabled':''} aria-pressed="${V.answered===i}"><span class="let">${'abcd'[i]}</span><span class="txt">${optHtml(o,b.type!=='stroop')}</span></button>`).join('')}</div>`;
  const stim=b.type!=='impostor'&&b.type!=='majority'?stimulus(b,false,'open'):'';
  return `<div style="padding-top:6px"><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><div style="flex:1;height:5px;border-radius:9px;background:var(--line);overflow:hidden"><div id="cd-bar" data-total="${tot}" style="height:100%;border-radius:9px;background:var(--ink);width:${Math.max(0,V.rem/tot*100)}%"></div></div><span class="tab d" id="cd-num" style="width:30px;text-align:right;font-size:24px">${Math.ceil(Math.max(0,V.rem)/1000)}</span>${round.m>1?'<span class="sticker" style="background:var(--gold);color:var(--ink);font-size:12px;padding:3px 9px">×2</span>':''}</div>
   ${b.rule?`<div class="sticker" style="font-size:13px;padding:6px 12px;margin-bottom:10px">${esc(b.rule)}</div>`:''}
   ${b.quiz?'<div class="s red" style="font-size:22px;margin-bottom:6px">How well do you know PSC?</div>':''}<h2 class="d" style="font-size:34px;line-height:.98">${esc(promptOf(b))}</h2>
   ${stim?`<div class="stagecard" style="margin:14px 0;min-height:120px;display:flex;justify-content:center;align-items:center;padding:16px">${stim}</div>`:'<div style="height:12px"></div>'}
   ${opts}<div style="min-height:50px;margin-top:14px" aria-live="polite">${locked?'<div class="s in" style="text-align:center;font-size:26px;color:var(--grey)">locked in ✓</div>':''}</div></div>`}
function revealHtml(V,it,round){if(A.view==='player'&&A.meK!==`${V.r}-${V.q}`)return center('Scoring…','one moment',true);
  const b=it.b,maj=b.type==='majority',ok=!!V.me.ok,answered=V.me.a!=null&&V.me.a>=0;
  if(!A._rv||A._rv!==`${V.r}-${V.q}`){A._rv=`${V.r}-${V.q}`;Snd.play(ok?'correct':'wrong');try{navigator.vibrate&&navigator.vibrate(ok?[20,40,20]:60)}catch{}}
  const ansTxt=V.ans!=null&&V.ans>=0?(b.type==='impostor'?b.odd:b.options?optPlain(b.options[V.ans]):''):'';
  const pts=V.me.base+V.me.speed;
  return `<div style="padding-top:16px"><div class="pop" style="border-radius:36px;padding:30px 26px;${ok?'background:var(--ok);color:#fff':'background:var(--ink);color:var(--paper)'}">
    <div class="d" style="font-size:64px">${maj?(ok?'Crowd pleaser.':answered?'Outvoted.':'No vote.'):ok?'Nailed it.':answered?'Not quite.':'Too slow.'}</div>
    ${!ok&&!maj&&ansTxt?`<div class="s" style="font-size:26px;opacity:.75;margin-top:10px">it was ${esc(ansTxt)}</div>`:''}
    ${maj&&V.cnt?`<div class="s" style="font-size:24px;opacity:.8;margin-top:10px">${b.options.map((o,i)=>`${esc(o)} ${(V.cnt.reduce((a,c)=>a+c,0)?Math.round(V.cnt[i]/V.cnt.reduce((a,c)=>a+c,0)*100):0)}%`).join(' · ')}</div>`:''}
    <div style="display:flex;align-items:baseline;gap:10px;margin-top:22px"><span class="tab d" style="font-size:82px">+${pts}</span>${!maj&&V.me.speed?`<span class="s" style="font-size:22px;opacity:.75">${V.me.base} + ${V.me.speed} speed</span>`:''}</div></div>
   <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:20px;padding:0 6px"><div><div class="tab d" style="font-size:40px">${V.me.total.toLocaleString()}</div><div class="s" style="font-size:20px;color:var(--grey)">total</div></div><div style="text-align:right"><div class="tab d" style="font-size:40px">${V.me.rank?'#'+V.me.rank:'?'}</div><div class="s" style="font-size:20px;color:var(--grey)">${V.me.rank?'place':'hidden'}</div></div></div></div>`}
function optPlain(o){return o.startsWith('shape:')?o.slice(6):HEX[o]?o.toLowerCase():o}

