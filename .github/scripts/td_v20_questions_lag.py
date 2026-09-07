from pathlib import Path
import re
p=Path('tdlearn.html')
s=p.read_text()

# Multiplayer question state vars.
s=s.replace("mpMode=0,mpHost=0,mpLastSync=0,oppLives=100,oppWave=0,mpWon=0,last=performance.now()",
            "mpMode=0,mpHost=0,mpLastSync=0,mpQuestion=null,mpQHostDone=0,mpQGuestDone=0,mpRenderedQ='',oppLives=100,oppWave=0,mpWon=0,last=performance.now()",1)

# Replace snapshot/apply/command multiplayer helpers with lighter state transfer + synced questions.
pat=r"function mpSnapshot\(\)\{.*?function mpSetup\(c,isHost\)"
m=re.search(pat,s,re.S)
if not m:
    raise SystemExit('multiplayer helper block not found')
repl=r'''function mpSnapshot(){return {type:'snapshot',mapKey:$('map').value,lives,coins,wave,score,towers,enemies:enemies.map(e=>[e.type,e.lane,e.d,e.hp,e.max,e.sp,e.c,e.r,e.tag,e.w,e.slow,e.slowFactor||1]),paused,manualPause,started,over,spawning,qopen,nextQ,question:mpQuestion,qHostDone:mpQHostDone,qGuestDone:mpQGuestDone}}
function mpBroadcast(){if(mpMode&&mpHost)mpSend(mpSnapshot())}
function renderSharedQuestion(q){if(!q)return;if(mpRenderedQ!==q.id){mpRenderedQ=q.id;$('question').classList.add('show');$('qlabel').textContent=q.label;$('qtext').textContent=q.prompt;$('feedback').textContent='';$('answers').innerHTML=q.answers.map(v=>`<button class="ans" data-v="${esc(v)}">${v}</button>`).join('');$('answers').querySelectorAll('button').forEach(b=>b.onclick=()=>answer(b,b.dataset.v,q.correct))}let mine=mpHost?mpQHostDone:mpQGuestDone;if(mine){$('answers').querySelectorAll('button').forEach(b=>b.disabled=true);$('feedback').textContent=(mpQHostDone&&mpQGuestDone)?'Both players answered. Continuing…':'Answer submitted — waiting for teammate.'}}
function mpApplySnapshot(m){if(!m||mpHost)return;if(m.mapKey&&m.mapKey!==$('map').value){$('map').value=m.mapKey;map=MAPS[m.mapKey]||MAPS.meadow;lanes=map.lanes;lens=lanes.map(plen)}lives=m.lives;coins=m.coins;wave=m.wave;score=m.score;towers=Array.isArray(m.towers)?m.towers:[];enemies=Array.isArray(m.enemies)?m.enemies.map(a=>Array.isArray(a)?{type:a[0],lane:a[1],d:a[2],hp:a[3],max:a[4],sp:a[5],c:a[6],r:a[7],tag:a[8],w:a[9],slow:a[10],slowFactor:a[11]}:a):[];shots=[];paused=!!m.paused;manualPause=!!m.manualPause;started=!!m.started;over=!!m.over;spawning=!!m.spawning;qopen=!!m.qopen;nextQ=!!m.nextQ;mpQuestion=m.question||null;mpQHostDone=+m.qHostDone||0;mpQGuestDone=+m.qGuestDone||0;if(selTower>=towers.length)selTower=-1;$('oppLives').textContent=Math.max(0,Math.floor(lives));$('oppWave').textContent=wave||0;$('prep').style.display=started?'none':'block';$('play').disabled=started;$('pauseBtn').disabled=!started;$('pauseBtn').textContent=manualPause?'▶ Resume':'Ⅱ Pause';$('quickPause').textContent=manualPause?'▶ Resume':'Ⅱ Pause';if(qopen&&mpQuestion){$('paused').textContent='Shared Esperanto question';$('paused').classList.add('show');renderSharedQuestion(mpQuestion)}else{$('question').classList.remove('show');$('paused').classList.toggle('show',manualPause);mpRenderedQ=''}hud();if(selTower>=0)upgrades()}
function applySharedQuestionResult(v,c,who){let correct=v===c;if(correct){coins+=75;score+=100+wave*5;boost=performance.now()+8000;sfx('ok')}else{sfx('bad');penalty()}if(who==='host')mpQHostDone=1;else mpQGuestDone=1;hud();mpBroadcast();if(mpQHostDone&&mpQGuestDone)finishSharedQuestion()}
function finishSharedQuestion(){if(!mpHost)return;setTimeout(()=>{if(!(mpQHostDone&&mpQGuestDone)||!qopen)return;qopen=0;nextQ=0;mpQuestion=null;mpRenderedQ='';mpQHostDone=0;mpQGuestDone=0;$('question').classList.remove('show');$('paused').classList.remove('show');mpBroadcast();start()},900)}
function mpHandleCommand(m){if(!mpHost||!m)return;if(m.action==='place')placeShared(m.towerType,+m.x,+m.y,true);else if(m.action==='buy')applyBuy(+m.index,m.id,true);else if(m.action==='buyXp')applyBuyXp(+m.index,+m.xp,+m.cost,true);else if(m.action==='target')applyTarget(+m.index,m.mode,true);else if(m.action==='play'){if(!started&&!over)start()}else if(m.action==='pause'){togglePauseShared()}else if(m.action==='new'){reset();mpBroadcast()}else if(m.action==='questionAnswer'&&qopen&&mpQuestion&&!mpQGuestDone){applySharedQuestionResult(String(m.value),mpQuestion.correct,'guest')}}
function mpSetup(c,isHost)'''
s=s[:m.start()]+repl+s[m.end():]

# Reduce network update pressure from 10 snapshots/sec to 4/sec.
s=s.replace("if(mpMode&&mpHost&&n-mpLastSync>100){mpLastSync=n;mpBroadcast()}",
            "if(mpMode&&mpHost&&n-mpLastSync>250){mpLastSync=n;mpBroadcast()}",1)

# Joiner performs visual-only movement between authoritative snapshots for smooth animation.
s=s.replace("function tick(dt,now){if(mpMode&&!mpHost){hud();return}if(over)return;",
            "function tick(dt,now){if(mpMode&&!mpHost){if(!paused&&!qopen){for(let e of enemies){e.d=Math.min(lens[e.lane]||e.d,e.d+e.sp*(now<e.slow?(e.slowFactor||.7):1)*dt);e.w+=dt*5}}hud();return}if(over)return;",1)

# Replace question ask/answer with shared two-player question flow while preserving single-player behavior.
pat=r"function ask\(label\)\{.*?\}function penalty\(\)"
m=re.search(pat,s,re.S)
if not m:
    raise SystemExit('ask block not found')
newask=r'''function ask(label){if(mpMode&&!mpHost)return;if(qopen||over)return;qopen=1;paused=1;$('paused').textContent=mpMode?'Shared Esperanto question':'Question pause';$('paused').classList.add('show');let pool=SETS[$('set').value]||SETS.all,it=rnd(pool),prompt,correct,ds;if(it.type==='verb'){let m=rnd(['inf','present','past','future','conditional','imperative']);correct=it[m];prompt=`What is the Esperanto ${m==='inf'?'infinitive':m} form for “${it.en}”?`;ds=dist(V,correct,x=>x[m])}else if(Math.random()<.3){prompt=`What does “${it.eo}” mean in English?`;correct=it.en;ds=dist(pool,correct,x=>x.en)}else{prompt=`How do you say “${it.en}” in Esperanto?`;correct=it.eo;ds=dist(pool,correct,x=>x.eo)}let answers=sh([correct,...ds]);if(mpMode){mpQHostDone=0;mpQGuestDone=0;mpQuestion={id:'q'+wave+'-'+Date.now(),label,prompt,correct,answers};mpRenderedQ='';renderSharedQuestion(mpQuestion);mpBroadcast()}else{$('question').classList.add('show');$('qlabel').textContent=label;$('qtext').textContent=prompt;$('feedback').textContent='';$('answers').innerHTML=answers.map(v=>`<button class="ans" data-v="${esc(v)}">${v}</button>`).join('');qlock=0;$('answers').querySelectorAll('button').forEach(b=>b.onclick=()=>answer(b,b.dataset.v,correct))}}
function penalty()'''
s=s[:m.start()]+newask+s[m.end():]

pat=r"function answer\(btn,v,c\)\{.*?\}function scores\(\)"
m=re.search(pat,s,re.S)
if not m:
    raise SystemExit('answer block not found')
newanswer=r'''function answer(btn,v,c){if(mpMode){if(mpHost){if(mpQHostDone)return;document.querySelectorAll('.ans').forEach(b=>{b.disabled=true;if(b.dataset.v===c)b.classList.add('correct')});if(v!==c)btn.classList.add('wrong');$('feedback').textContent=v===c?'+75 coins · waiting for teammate':'Correct: '+c+' · penalty applied · waiting for teammate';applySharedQuestionResult(v,c,'host')}else{if(mpQGuestDone)return;mpQGuestDone=1;document.querySelectorAll('.ans').forEach(b=>{b.disabled=true;if(b.dataset.v===c)b.classList.add('correct')});if(v!==c)btn.classList.add('wrong');$('feedback').textContent=v===c?'Answer submitted — waiting for teammate':'Correct: '+c+' · answer submitted';mpSend({type:'cmd',action:'questionAnswer',value:v})}return}if(qlock)return;qlock=1;document.querySelectorAll('.ans').forEach(b=>{b.disabled=true;if(b.dataset.v===c)b.classList.add('correct')});if(v===c){coins+=75;score+=100+wave*5;boost=performance.now()+8000;$('feedback').textContent='+75 coins · 8s attack-speed boost';sfx('ok')}else{btn.classList.add('wrong');$('feedback').textContent='Correct: '+c+' · Penalty: '+penalty();sfx('bad')}hud();setTimeout(()=>{qopen=0;nextQ=0;$('question').classList.remove('show');$('paused').classList.remove('show');start()},1300)}
function scores()'''
s=s[:m.start()]+newanswer+s[m.end():]

# Reset multiplayer question state on reset.
s=s.replace("damagePenalty=0;mpWon=0;", "damagePenalty=0;mpWon=0;mpQuestion=null;mpQHostDone=0;mpQGuestDone=0;mpRenderedQ='';",1)

p.write_text(s)
