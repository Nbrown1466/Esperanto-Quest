from pathlib import Path
import re, subprocess, tempfile
p=Path('tdlearn.html')
s=p.read_text()

s=s.replace('Host or join a co-op room with a 6-character code.','Host or join with a 6-character code. Both players edit and defend the same board.')
s=s.replace('<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><div class="stat">Teammate lives<b id="oppLives">100</b></div><div class="stat">Teammate wave<b id="oppWave">0</b></div></div><div class="small" style="margin-top:8px"><b>Shared waves.</b> Build on your own board; either board falling ends the run.</div>','<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px"><div class="stat">Shared lives<b id="oppLives">100</b></div><div class="stat">Shared wave<b id="oppWave">0</b></div></div><div class="small" style="margin-top:8px"><b>One shared board.</b> Either player can place defenders, buy upgrades, change targeting, start waves, and pause. Coins, lives, towers, and balloons are shared.</div>')

pat=r"let soundOn=localStorage\.getItem\(AK\)!=='off'.*?function au\(\)"
repl="""let soundOn=localStorage.getItem(AK)!=='off',AC,lives,coins,wave,score,towers,enemies,shots,selType,selTower,paused,over,spawning,queue,spawnT,qopen,qlock,nextQ,preview,map,lanes,lens,boost=0,fastPenalty=0,damagePenalty=0,manualPause=0,started=0,peer=null,conn=null,mpMode=0,mpHost=0,mpLastSync=0,oppLives=100,oppWave=0,mpWon=0,last=performance.now();
function mpStatus(t){let e=$('mpStatus');if(e)e.textContent=t}
function mpSend(o){try{if(conn&&conn.open)conn.send(o)}catch(e){}}
function mpSnapshot(){return {type:'snapshot',mapKey:$('map').value,lives,coins,wave,score,towers,enemies,paused,manualPause,started,over,spawning,qopen,nextQ}}
function mpBroadcast(){if(mpMode&&mpHost)mpSend(mpSnapshot())}
function mpApplySnapshot(m){if(!m||mpHost)return;if(m.mapKey&&m.mapKey!==$('map').value){$('map').value=m.mapKey;map=MAPS[m.mapKey]||MAPS.meadow;lanes=map.lanes;lens=lanes.map(plen)}lives=m.lives;coins=m.coins;wave=m.wave;score=m.score;towers=Array.isArray(m.towers)?m.towers:[];enemies=Array.isArray(m.enemies)?m.enemies:[];shots=[];paused=!!m.paused;manualPause=!!m.manualPause;started=!!m.started;over=!!m.over;spawning=!!m.spawning;qopen=!!m.qopen;nextQ=!!m.nextQ;if(selTower>=towers.length)selTower=-1;$('oppLives').textContent=Math.max(0,Math.floor(lives));$('oppWave').textContent=wave||0;$('prep').style.display=started?'none':'block';$('play').disabled=started;$('pauseBtn').disabled=!started;$('pauseBtn').textContent=manualPause?'▶ Resume':'Ⅱ Pause';$('quickPause').textContent=manualPause?'▶ Resume':'Ⅱ Pause';if(qopen){$('paused').textContent='Shared game paused for Esperanto question';$('paused').classList.add('show')}else $('paused').classList.toggle('show',manualPause);hud();if(selTower>=0)upgrades()}
function mpHandleCommand(m){if(!mpHost||!m)return;if(m.action==='place')placeShared(m.towerType,+m.x,+m.y,true);else if(m.action==='buy')applyBuy(+m.index,m.id,true);else if(m.action==='target')applyTarget(+m.index,m.mode,true);else if(m.action==='play'){if(!started&&!over)start()}else if(m.action==='pause'){togglePauseShared()}else if(m.action==='new'){reset();mpBroadcast()}}
function mpSetup(c,isHost){conn=c;mpMode=1;mpHost=isHost?1:0;$('mpBattle').style.display='block';mpStatus(mpHost?'Connected - hosting the shared board':'Connected - editing the host shared board');if(!mpHost){$('map').disabled=true;$('set').disabled=true}else{$('map').disabled=false;$('set').disabled=false}c.on('data',m=>{if(!m||!m.type)return;if(m.type==='snapshot')mpApplySnapshot(m);else if(m.type==='cmd')mpHandleCommand(m)});c.on('close',()=>{mpMode=0;mpHost=0;$('map').disabled=false;$('set').disabled=false;mpStatus('Teammate disconnected')});c.on('error',()=>mpStatus('Connection error'));if(mpHost)setTimeout(mpBroadcast,150)}
function hostMp(){if(typeof Peer==='undefined')return mpStatus('Multiplayer service failed to load');let code='',chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(let i=0;i<6;i++)code+=chars[Math.floor(Math.random()*chars.length)];if(peer)try{peer.destroy()}catch(e){}peer=new Peer('esperanto-td-'+code);mpStatus('Opening room...');peer.on('open',()=>{$('mpRoom').style.display='block';$('mpCode').textContent=code;mpStatus('Waiting for teammate...')});peer.on('connection',c=>{if(conn&&conn.open){c.close();return}mpSetup(c,1)});peer.on('error',()=>mpStatus('Room error - try hosting again'))}
function joinMp(){if(typeof Peer==='undefined')return mpStatus('Multiplayer service failed to load');let code=($('mpCodeInput').value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(code.length!==6)return mpStatus('Enter the 6-character room code');if(peer)try{peer.destroy()}catch(e){}peer=new Peer();mpStatus('Joining '+code+'...');peer.on('open',()=>{let c=peer.connect('esperanto-td-'+code,{reliable:true});c.on('open',()=>mpSetup(c,0));c.on('error',()=>mpStatus('Could not join that room'))});peer.on('error',()=>mpStatus('Could not connect to multiplayer service'))}
function sendMpBalloon(){toast('Shared-board co-op has no opponent balloon sending')}
function au()"""
s,n=re.subn(pat,repl,s,count=1,flags=re.S)
if n!=1: raise SystemExit('multiplayer block replacement failed')

old="function loop(n){let dt=Math.min(.05,(n-last)/1000);last=n;tick(dt,n);draw();requestAnimationFrame(loop)}"
new="function loop(n){let dt=Math.min(.05,(n-last)/1000);last=n;tick(dt,n);draw();if(mpMode&&mpHost&&n-mpLastSync>100){mpLastSync=n;mpBroadcast()}requestAnimationFrame(loop)}"
if old not in s: raise SystemExit('loop not found')
s=s.replace(old,new,1)
old="function tick(dt,now){if(over)return;"
new="function tick(dt,now){if(mpMode&&!mpHost){hud();return}if(over)return;"
if old not in s: raise SystemExit('tick not found')
s=s.replace(old,new,1)

m=re.search(r"function buy\(id\)\{.*?\}function place\(x,y\)\{.*?sfx\('ok'\)\}",s,re.S)
if not m: raise SystemExit('buy/place block not found')
new="""function applyBuy(index,id,remote=false){let t=towers[index];if(!t)return;let u=U[t.type].find(x=>x[0]===id);if(!u||t.got.includes(id))return;if(t.xp<u[2]){if(!remote)toast('Unlocks at '+u[2]+' XP');return}if(coins<u[3]){if(!remote)toast('Need '+u[3]+' coins');return}coins-=u[3];u[5](t);t.got.push(id);sfx('ok');hud();if(selTower===index)upgrades();mpBroadcast()}
function buy(id){if(selTower<0)return;if(mpMode&&!mpHost){mpSend({type:'cmd',action:'buy',index:selTower,id});return}applyBuy(selTower,id)}
function applyTarget(index,mode,remote=false){let t=towers[index];if(!t||!['closest','first','last'].includes(mode))return;t.targetMode=mode;if(!remote){sfx('ok');toast(t.name+' targeting: '+mode)}if(selTower===index)upgrades();mpBroadcast()}
function placeShared(type,x,y,remote=false){let t=T[type];if(!t)return;if(coins<t.cost){if(!remote)toast('Not enough coins');return}if(dpath(x,y)<47){if(!remote)toast('Place off all paths');return}if(towers.some(q=>Math.hypot(q.x-x,q.y-y)<42)){if(!remote)toast('Too close');return}coins-=t.cost;towers.push({...t,type,x,y,cd:.2,xp:0,got:[],camo:0,ceramicHit:0,armorBreak:0,targetMode:'closest',lastShot:0});if(!remote){selTower=towers.length-1;selType=null;preview=null;document.querySelectorAll('.tower').forEach(b=>b.classList.remove('sel'));$('upbtn').disabled=false;upgrades();sfx('ok')}hud();mpBroadcast()}
function place(x,y){if(!selType)return;if(mpMode&&!mpHost){mpSend({type:'cmd',action:'place',towerType:selType,x,y});selType=null;preview=null;document.querySelectorAll('.tower').forEach(b=>b.classList.remove('sel'));return}placeShared(selType,x,y)}"""
s=s[:m.start()]+new+s[m.end():]

old="b.onclick=()=>{t.targetMode=b.dataset.target;sfx('ok');toast(t.name+' targeting: '+b.textContent);upgrades()}"
new="b.onclick=()=>{if(mpMode&&!mpHost){mpSend({type:'cmd',action:'target',index:selTower,mode:b.dataset.target});return}applyTarget(selTower,b.dataset.target)}"
if old not in s: raise SystemExit('target handler not found')
s=s.replace(old,new,1)
old="$('play').onclick=()=>{if(!started&&!over){if(mpMode)mpSend({type:'start'});start()}};"
new="$('play').onclick=()=>{if(mpMode&&!mpHost){mpSend({type:'cmd',action:'play'});return}if(!started&&!over)start()};"
if old not in s: raise SystemExit('play handler not found')
s=s.replace(old,new,1)
old="$('pauseBtn').onclick=()=>{if(!started||over||qopen)return;manualPause=!manualPause;paused=manualPause;$('pauseBtn').textContent=manualPause?'▶ Resume':'Ⅱ Pause';$('quickPause').textContent=manualPause?'▶ Resume':'Ⅱ Pause';$('paused').textContent=manualPause?'Game paused':'Paused';$('paused').classList.toggle('show',manualPause);if(!manualPause)last=performance.now()};"
new="function togglePauseShared(){if(!started||over||qopen)return;manualPause=!manualPause;paused=manualPause;$('pauseBtn').textContent=manualPause?'▶ Resume':'Ⅱ Pause';$('quickPause').textContent=manualPause?'▶ Resume':'Ⅱ Pause';$('paused').textContent=manualPause?'Game paused':'Paused';$('paused').classList.toggle('show',manualPause);if(!manualPause)last=performance.now();mpBroadcast()}$('pauseBtn').onclick=()=>{if(mpMode&&!mpHost){mpSend({type:'cmd',action:'pause'});return}togglePauseShared()};"
if old not in s: raise SystemExit('pause handler not found')
s=s.replace(old,new,1)
old="$('new').onclick=reset;"
new="$('new').onclick=()=>{if(mpMode&&!mpHost){mpSend({type:'cmd',action:'new'});return}reset();mpBroadcast()};"
if old not in s: raise SystemExit('new handler not found')
s=s.replace(old,new,1)
s=s.replace("function ask(label){if(qopen||over)return;","function ask(label){if(mpMode&&!mpHost)return;if(qopen||over)return;",1)
s=s.replace("function answer(btn,v,c){if(qlock)return;","function answer(btn,v,c){if(mpMode&&!mpHost)return;if(qlock)return;",1)
s=s.replace("oppLives=100;oppWave=0;if($('oppLives'))$('oppLives').textContent='100';if($('oppWave'))$('oppWave').textContent='0'","oppLives=100;oppWave=0;if($('oppLives'))$('oppLives').textContent=Math.floor(lives);if($('oppWave'))$('oppWave').textContent=wave",1)
p.write_text(s)

scripts=re.findall(r'<script(?:[^>]*)>(.*?)</script>',s,re.S)
js='\n'.join(x for x in scripts if x.strip())
f=tempfile.NamedTemporaryFile('w',suffix='.js',delete=False)
f.write(js); f.close()
subprocess.run(['node','--check',f.name],check=True)
