'use strict';
const $ = id => document.getElementById(id);
const W = 15, H = 15;
const r = n => Math.floor(Math.random() * n);
const pick = a => a[r(a.length)];
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shuffle(a) { for (let i=a.length-1;i>0;i--) {const j=r(i+1);[a[i],a[j]]=[a[j],a[i]];} return a; }
const vocab = (window.N || []).filter(x=>x[0]&&x[1]).map(x=>({en:x[0],eo:x[1]}));
const verbs = (window.V || []).filter(x=>x[0]&&x[1]).map(x=>({en:x[0],eo:x[1]}));
const words = [...vocab,...verbs];
const storyBits = [
 'The first keepers built this place to shelter a language. They never meant for it to become a prison.',
 'A word spoken with kindness opens doors that iron cannot. The creatures remember this, even when they forget their names.',
 'Eleven travelers came before you. Each left a word behind. XII is not a name; it is a promise that someone will keep looking.',
 'The lantern burns on memory. Every word you carry brings its flame closer to the surface.',
 'Above the last stair, a stranger is waiting to say “bonvenon.” Welcome. You finally know what it means.'
];
let S, battle=null, previousFocus=null;
const WORLD_STEP_MS=700, WORLD_GRACE_TICKS=3;
let worldTimer=0, worldEpoch=0, worldFocused=true;
const BEST_FLOOR_KEY='vortaventuro.bestFloor.v1';
let bestFloor=0, scoreSaved=true;
try{const value=Number(localStorage.getItem(BEST_FLOOR_KEY));if(Number.isSafeInteger(value)&&value>0)bestFloor=value;}catch{scoreSaved=false;}
function recordDepth(){
 bestFloor=Math.max(bestFloor,S.floor);
 try{const stored=Number(localStorage.getItem(BEST_FLOOR_KEY));if(Number.isSafeInteger(stored)&&stored>bestFloor)bestFloor=stored;localStorage.setItem(BEST_FLOOR_KEY,String(bestFloor));scoreSaved=true;}catch{scoreSaved=false;}
}
function makeFloorName(depth){
 return `${pick(['Whispering','Rootbound','Moonlit','Forgotten','Hollow','Glass','Drifting','Sleeping'])} ${pick(['Halls','Archive','Gardens','Vaults','Library','Passages','Gallery','Catacombs'])} · ${depth}`;
}
const heldKeys = new Set();
// Each floor is a fresh little maze. A few extra loops and rooms keep it readable
// while the randomized backbone makes the route genuinely different every run.
function grid() {
 const g=Array.from({length:H},()=>Array(W).fill('#'));
 const carve=(x,y)=>{g[y][x]='.';};
 for(let y=1;y<=3;y++)for(let x=1;x<=3;x++)carve(x,y); // the entrance chamber
 const seenCells=new Set(['1,1']), stack=[[1,1]];
 while(stack.length){
  const [x,y]=stack.at(-1), next=shuffle([[x+2,y],[x-2,y],[x,y+2],[x,y-2]].filter(([nx,ny])=>nx>0&&nx<W-1&&ny>0&&ny<H-1&&!seenCells.has(`${nx},${ny}`)));
  if(!next.length){stack.pop();continue;}
  const [nx,ny]=next[0];seenCells.add(`${nx},${ny}`);carve((x+nx)/2,(y+ny)/2);carve(nx,ny);stack.push([nx,ny]);
 }
 // Carve a handful of loops and irregular chambers; these are the run-to-run signature.
 for(let i=0;i<5+r(9);i++){
  const cx=1+2*r(6),cy=1+2*r(6),rx=1+r(2),ry=1+r(2);
  for(let y=Math.max(1,cy-ry);y<=Math.min(H-2,cy+ry);y++)for(let x=Math.max(1,cx-rx);x<=Math.min(W-2,cx+rx);x++)carve(x,y);
 }
 for(let i=0;i<5+r(8);i++){
  const x=1+r(W-2),y=1+r(H-2),open=[[x+1,y],[x-1,y],[x,y+1],[x,y-1]].filter(([nx,ny])=>g[ny]?.[nx]==='.').length;
  if(g[y][x]==='#'&&open>=2)carve(x,y);
 }
 const spots=[];
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(g[y][x]=='.'&&x+y>5)spots.push([x,y]);
 shuffle(spots);
 for(const t of ['K','L','T','T','G','G','B',...Array(2+r(3)).fill('N'),'M','M','M','R','R','R']){const [x,y]=spots.pop();g[y][x]=t;}
 const distances=new Map([['1,1',0]]), queue=[[1,1]];
 for(let i=0;i<queue.length;i++){const [x,y]=queue[i],d=distances.get(`${x},${y}`);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`;if(g[ny]?.[nx]&&g[ny][nx]!== '#'&&!distances.has(k)){distances.set(k,d+1);queue.push([nx,ny]);}}}
 const far=spots.filter(([x,y])=>g[y][x]==='.').sort((a,b)=>(distances.get(`${b[0]},${b[1]}`)||0)-(distances.get(`${a[0]},${a[1]}`)||0))[0]||[13,13];g[far[1]][far[0]]='E';return g;
}
function loadFloor(){
 stopWorld();S.g=grid();S.x=1;S.y=1;S.seen={};S.revealedFriends={};S.revealedMonsters={};S.characters={};S.enemies={};S.npcGifts={};S.monsters=[];S.turn=0;S.roamGrace=WORLD_GRACE_TICKS;S.floorName=makeFloorName(S.floor);
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(S.g[y][x]==='R'){
  S.monsters.push({id:`${S.floor}:${x},${y}`,x,y,profile:generateEnemy(),target:null,lastSeen:null});S.g[y][x]='.';
 }
 recordDepth();
}
function guide(message){$('guide').textContent=message;S.log.push(message);S.log=S.log.slice(-60);}
function showDialog(title,body){stopWorld();$('box').classList.remove('combat-box','dodge-mode','story-box','shop-box');previousFocus=$('modal').classList.contains('show')?previousFocus:document.activeElement;$('box').innerHTML=`<h2 id="dialogTitle">${title}</h2>${body}`;$('modal').classList.add('show');heldKeys.clear();$('box').scrollTop=0;$('box').focus();}
function closeModal(){if(battle||S?.over)return;if(typeof stopStory==='function')stopStory();$('modal').classList.remove('show');previousFocus?.focus();startWorld();}
function blocked(){return !S||S.over||battle||$('modal').classList.contains('show');}
function worldBlocked(){return blocked()||document.hidden||!worldFocused;}
function stopWorld(){if(worldTimer)clearTimeout(worldTimer);worldTimer=0;worldEpoch++;}
// Schedule one step at a time: returning from a hidden tab never catches up old moves.
function startWorld(){
 if(worldTimer||worldBlocked())return;const epoch=worldEpoch;
 worldTimer=setTimeout(()=>{if(epoch!==worldEpoch)return;worldTimer=0;if(worldBlocked())return;worldTick();startWorld();},WORLD_STEP_MS);
}
function newRun(){
 if(typeof stopStory==='function')stopStory();stopWorld();stopDodge();battle=null;heldKeys.clear();
 S={hp:20,max:20,atk:3,def:0,gold:0,keys:0,potions:2,floor:1,log:[],notebook:{},lore:[],kills:0,mercy:0,over:false,npcGifts:{}};
 loadFloor();$('modal').classList.remove('show');
 guide('The halls have changed again. Every presence wears the same mark. Listen for clues, find a key, and descend as far as you can.');hear();render();
 showDialog('A note in your coat',`<p class="eyebrow">THE ENDLESS EXPEDITION</p><div class="note">The stairs have no end.<br>The dark has many voices.<br><br>Listen before you follow.</div><p>Every ? could be a friend, supplies, stairs, or danger. Friends stay marked after you meet them; visible monsters reveal within two tiles. Read “What you hear” for directions and clues. Creatures roam in real time, even while you stand still. If one sees you, it will follow. Walls can hide you; dialogue and battles pause the halls.</p><p>Your best depth is saved on this browser. Current record: floor ${bestFloor}.</p><button class="primary" onclick="closeModal()">Light the torch →</button>`);
}
function requestNewRun(){if(battle)return;if(S.over)return newRun();showDialog('Begin again?', '<p>Your current expedition and its notebook will be reset.</p><div class="actions"><button onclick="closeModal()">Keep exploring</button><button onclick="newRun()">Start new expedition</button></div>');}
// Both the torch and creatures use wall-aware sight. A wall itself remains visible.
function canSee(sx,sy,tx,ty,radius=7){
 if(!S?.g[sy]?.[sx]||!S.g[ty]?.[tx]||Math.hypot(tx-sx,ty-sy)>radius)return false;
 let x=sx,y=sy,dx=Math.abs(tx-x),dy=-Math.abs(ty-y),stepX=x<tx?1:-1,stepY=y<ty?1:-1,err=dx+dy;
 while(x!==tx||y!==ty){
  const oldX=x,oldY=y,e=2*err;if(e>=dy){err+=dy;x+=stepX;}if(e<=dx){err+=dx;y+=stepY;}
  if(x!==oldX&&y!==oldY&&S.g[oldY]?.[x]==='#'&&S.g[y]?.[oldX]==='#')return false;
  if(x===tx&&y===ty)return true;if(S.g[y]?.[x]==='#')return false;
 }
 return true;
}
function visible(tx,ty){return canSee(S.x,S.y,tx,ty,4.5);}
const mysteryTile=['floor mystery','?','Unknown presence'];
const friendTile=['floor friendly','☻','Friend'];
const monsterTile=['floor monster','♟','Monster'];
const tileInfo={'#':['wall','','Stone wall'],'.':['floor','','Passage'],M:mysteryTile,R:mysteryTile,T:mysteryTile,G:mysteryTile,K:mysteryTile,L:mysteryTile,E:mysteryTile,N:mysteryTile,B:mysteryTile};
function render(){
 const map=$('map');map.innerHTML='';let explored=0,total=0;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const lit=visible(x,y),key=`${x},${y}`,roamer=S.monsters.find(m=>m.x===x&&m.y===y),tile=roamer?'R':S.g[y][x];if(lit)S.seen[key]=tile==='#'?'#':'.';
  if(tile!=='#'){total++;if(S.seen[key])explored++;}
  const known=lit?tile:S.seen[key];const cell=document.createElement('div');
  const near=Math.max(Math.abs(x-S.x),Math.abs(y-S.y))<=2;
  if(lit&&near){if(roamer)roamer.revealed=true;else if(tile==='M')S.revealedMonsters[key]=true;}
  let info=tileInfo[known]||['dark','','Unexplored'];
  if(S.seen[key]&&S.g[y][x]==='N'&&S.revealedFriends[key])info=friendTile;
  if(lit&&(roamer?.revealed||tile==='M'&&S.revealedMonsters[key]))info=monsterTile;
  const you=x===S.x&&y===S.y;
  cell.className=`cell ${info[0]}${known&&!lit?' seen':''}${you?' you':''}`;
  cell.title=you?'XII · You':info[2];cell.setAttribute('aria-hidden','true');
  if(you)cell.innerHTML='<span class="avatar">XII</span>';else cell.textContent=info[1];map.appendChild(cell);
 }
 map.setAttribute('aria-label',`Floor ${S.floor}. You are at column ${S.x+1}, row ${S.y+1}. ${Math.round(explored/total*100)} percent explored.`);
 $('hp').textContent=`${S.hp} / ${S.max}`;$('healthFill').style.width=`${S.hp/S.max*100}%`;
 $('floor').textContent=`FLOOR ${String(S.floor).padStart(2,'0')} · ∞`;$('floorName').textContent=S.floorName;
 $('bestDepth').textContent=`BEST · FLOOR ${bestFloor}`;$('scoreNote').textContent=scoreSaved?'Record saved on this browser':'Record kept for this session';
 for(const id of ['atk','def','gold','keys'])$(id).textContent=S[id];
 $('explored').textContent=`${Math.round(explored/total*100)}% explored`;
 $('bag').textContent=`${S.potions} potions · ${S.lore.length} lore fragments`;$('wordCount').textContent=Object.keys(S.notebook).length;
 $('potionButton').disabled=S.potions===0||S.hp===S.max||!!battle||S.over;
 $('runStatus').textContent=S.over?'EXPEDITION COMPLETE':'EXPEDITION IN PROGRESS';
 $('log').innerHTML=S.log.slice(-12).reverse().map(x=>`<div>${escapeHTML(x)}</div>`).join('');
}
const directions=[[1,0],[-1,0],[0,1],[0,-1]];
function pathTo(sx,sy,tx,ty,passable=(x,y)=>S.g[y]?.[x]==='.'){
 const queue=[[sx,sy]],parents=new Map([[`${sx},${sy}`,null]]);
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];if(x===tx&&y===ty){const path=[];let point=[x,y];while(point){path.push(point);point=parents.get(point.join(','));}return path.reverse();}
  for(const [dx,dy] of directions){const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;if(nx<1||ny<1||nx>=W-1||ny>=H-1||parents.has(key)||!passable(nx,ny))continue;parents.set(key,[x,y]);queue.push([nx,ny]);}
 }
 return [];
}
const soundClues={M:'“Foriru…” · A low growl, then a held breath.',R:'“Paŝo, paŝo…” · Uneven footsteps scrape over stone.',N:'“Saluton?” · A gentle voice hums to itself.',B:'“Bonan prezon!” · A bell rings above a murmured offer.',T:'Wood creaks. Glass clinks inside something closed.',G:'Loose coins chime softly against one another.',K:'One small piece of brass rattles on a ring.',L:'“Memoru…” · Paper rustles beneath a whispered memory.',E:'A long draft whistles down hollow steps.'};
function nearbySounds(){
 const sounds=[];const consider=(x,y,t)=>{if(!soundClues[t])return;const path=pathTo(S.x,S.y,x,y,(a,b)=>S.g[b]?.[a]&&S.g[b][a]!=='#');if(!path.length||path.length>10)return;
  const dx=x-S.x,dy=y-S.y,dir=dx===0&&dy===0?'Here':`${dy<0?'North':dy>0?'South':''}${dx!==0&&dy!==0?'-':''}${dx<0?'west':dx>0?'east':''}`;
  const distance=path.length-1; sounds.push({distance,x,y,text:`${dir} · ${distance<=2?'very close':distance<=5?'nearby':'faint'}\n${soundClues[t]}`});};
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)consider(x,y,S.g[y][x]);
 for(const m of S.monsters)consider(m.x,m.y,'R');
 return sounds.sort((a,b)=>a.distance-b.distance||a.y-b.y||a.x-b.x).slice(0,3);
}
function hear(){const sounds=nearbySounds();$('hear').textContent=sounds.length?sounds.map(x=>x.text).join('\n\n'):'Only your breathing, and a distant drip. Move farther to hear more.';}
function worldTick(){
 if(worldBlocked())return;S.turn++;
 if(S.roamGrace>0){S.roamGrace--;return;}
 for(const m of S.monsters){
  const canEnter=(x,y)=>S.g[y]?.[x]==='.'&&!S.monsters.some(other=>other!==m&&other.x===x&&other.y===y);
  const inSight=canSee(m.x,m.y,S.x,S.y,7);
  if(inSight){m.lastSeen=[S.x,S.y];m.target=null;}
  else if(m.lastSeen&&m.x===m.lastSeen[0]&&m.y===m.lastSeen[1])m.lastSeen=null;
  let path=[];
  if(m.lastSeen){
   // Plan toward the last sighting, including an occupied event as a goal, but
   // never step onto an event. Creatures can approach someone at a locked stair.
   const [tx,ty]=m.lastSeen;
   path=pathTo(m.x,m.y,tx,ty,(x,y)=>canEnter(x,y)||(x===tx&&y===ty&&S.g[y]?.[x]!=='#'&&!S.monsters.some(other=>other!==m&&other.x===x&&other.y===y)));
   if(!inSight&&(!path.length||(path.length===2&&!canEnter(...path[1]))))m.lastSeen=null;
  }
  if(!m.lastSeen){
   if(!m.target||m.x===m.target[0]&&m.y===m.target[1]){
    const candidates=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)if(canEnter(x,y)&&Math.abs(x-m.x)+Math.abs(y-m.y)>2)candidates.push([x,y]);
    m.target=candidates.length?pick(candidates):null;
   }
   path=m.target?pathTo(m.x,m.y,...m.target,canEnter):[];if(path.length<2)m.target=null;
  }
  if(path.length<2||!canEnter(...path[1]))continue;[m.x,m.y]=path[1];
  if(m.x===S.x&&m.y===S.y){guide('The footsteps stop beside you. A wandering creature steps into your torchlight.');startBattle(m);break;}
 }
 hear();render();
}
function advanceWorld(){worldTick();}
function move(dx,dy){if(blocked()||Math.abs(dx)+Math.abs(dy)!==1)return;const x=S.x+dx,y=S.y+dy,t=S.g[y]?.[x];if(!t||t==='#'){guide('Cold stone. Try another passage.');return render();}S.x=x;S.y=y;const monster=S.monsters.find(m=>m.x===x&&m.y===y);if(monster)startBattle(monster);else encounter(t);hear();render();}
function waitTurn(){if(blocked())return;guide('You listen closely. The halls keep moving in real time; nearby footsteps may be getting closer.');hear();render();}
function potion(){if(blocked()||S.potions<1||S.hp>=S.max)return;const gain=Math.min(7,S.max-S.hp);S.potions--;S.hp+=gain;guide(`You drink a potion and recover ${gain} health.`);render();}
function clearTile(){S.g[S.y][S.x]='.';}
function encounter(tile){
 if(tile==='N'){S.revealedFriends[`${S.x},${S.y}`]=true;return openNPC();}
 if(tile==='B')return openShop();
 if(tile==='M')return startBattle();
 if(tile==='G'){const gold=5+r(8);S.gold+=gold;clearTile();guide(`You found ${gold} gold beneath a loose stone.`);}
 if(tile==='K'){S.keys++;clearTile();guide('A brass key. The stairs on this floor are now unlocked.');}
 if(tile==='T'){S.potions++;S.gold+=5;clearTile();guide('A supply chest: one potion and 5 gold.');}
 if(tile==='L'){const text=`Floor ${S.floor}: ${pick(storyBits.slice(0,4))}`;if(!S.lore.includes(text))S.lore.push(text);S.lore=S.lore.slice(-100);clearTile();guide('A memory returns. A new fragment has been added to your lore.');showDialog('A page left behind',`<div class="note">${escapeHTML(text)}</div><button onclick="closeModal()">Keep the fragment</button>`);}
 if(tile==='E'){if(!S.keys){guide('The stair gate is locked. Listen for the rattle of a brass key.');return;}showDialog('The stairs keep going',`<p>Spend one key to reach floor ${S.floor+1}. Recover 5 health and gain 1 attack. The halls, voices, and creatures below will be new.</p><div class="actions"><button onclick="closeModal()">Keep exploring</button><button class="primary" onclick="descend()">Descend →</button></div>`);}
}
function descend(){if(battle||S.over||S.g[S.y][S.x]!=='E'||S.keys<1)return;S.keys--;S.floor++;S.atk++;S.hp=Math.min(S.max,S.hp+5);loadFloor();closeModal();guide(`You enter ${S.floorName}. +1 attack and up to 5 health restored. Best depth: floor ${bestFloor}.`);hear();render();}
// Battle turns alternate between deliberate language choices and short dodge rounds.
const enemyTypes = [
 {name:'The Ink Wraith',kind:'ink',symbol:'◕',quote:'“Do you remember what you came here to say?”',pattern:'INK RAIN',hint:'Ink falls from above. Keep moving between the drops.',color:'#c2afe7'},
 {name:'The Moss Keeper',kind:'moss',symbol:'♣',quote:'“Soft words grow where sharp ones cannot.”',pattern:'ROOT CROSSING',hint:'Roots cross from the sides. Slip through the gaps.',color:'#b9d391'},
 {name:'The Lost Scribe',kind:'scribe',symbol:'✧',quote:'“I know the letters. I have forgotten the meaning.”',pattern:'SCATTERED LETTERS',hint:'Letters fan down from above. Slip between them.',color:'#e4c38a'},
 {name:'The Bell Moth',kind:'ink',symbol:'♢',quote:'“If I ring, will anyone answer?”',pattern:'FALLING CHIMES',hint:'Chimes fall in rows. Look for the gap.',color:'#b6cfe2'},
 {name:'The Thorn Tailor',kind:'moss',symbol:'×',quote:'“I could mend that silence for you.”',pattern:'CROSSING THREADS',hint:'Threads cross from the sides. Slip between them.',color:'#e1a3b0'},
 {name:'The Candle Drifter',kind:'scribe',symbol:'♨',quote:'“My flame remembers a different sky.”',pattern:'EMBER WORDS',hint:'Embers fan out from above. Find an opening.',color:'#e8b275'}
];
function generateEnemy(){
 const type=pick(enemyTypes),name=pick(['Velo','Nim','Aru','Sori','Fen','Ilo','Tavi','Eru'])+pick(['na','ri','lo','mi','sa','vo']);
 return {...type,name:`${name}, ${pick(['Restless','Drowsy','Curious','Wary','Wistful','Shivering'])} ${type.name.replace(/^The /,'')}`,hp:8+S.floor*2,max:8+S.floor*2,peace:0};
}
let dodgeFrame=0, dodgeLast=0;
const dodgeKeys=new Set();
function stopDodge(){if(dodgeFrame)cancelAnimationFrame(dodgeFrame);dodgeFrame=0;dodgeLast=0;dodgeKeys.clear();if(battle)battle.pointer=null;}
function question(){
 const pool=words.length>=4?words:[{en:'friend',eo:'amiko'},{en:'key',eo:'ŝlosilo'},{en:'word',eo:'vorto'},{en:'home',eo:'hejmo'}];
 const choices=pool.filter(w=>w.eo!==battle.word?.eo);const word=pick(choices.length?choices:pool);
 battle.word=word;battle.options=shuffle([word.en,...shuffle([...new Set(pool.map(x=>x.en).filter(x=>x!==word.en))]).slice(0,3)]);battle.answered=false;
}
function startBattle(monster=null){
 if(battle||S.over)return;stopDodge();const key=`${S.x},${S.y}`;
 const type=monster?monster.profile:(S.enemies[key] ||= generateEnemy());
 battle={...type,source:monster?{kind:'roamer',id:monster.id}:{kind:'static',x:S.x,y:S.y},profile:type,phase:'menu',turn:1,answered:false,assist:false,shield:0};drawBattle();
}
function enemyPortrait(b){return `<div class="enemy-portrait ${b.kind}" style="color:${b.color}" aria-hidden="true"><div class="enemy-aura"></div><div class="enemy-body"><span class="enemy-eyes">▪ ▪</span><span class="enemy-mark">${b.symbol}</span></div><div class="enemy-shadow"></div></div>`;}
function battleFrame(content,caption='YOUR TURN'){
 const b=battle;
 showDialog(b.name,`<div class="battle-topline"><span>ENCOUNTER / 0${S.floor}</span><span>TURN ${b.turn} · ${caption}</span></div><div class="enemy-stage">${enemyPortrait(b)}<p>${b.quote}</p></div><div class="battle-meters"><div><span>CREATURE <b>${b.hp}/${b.max}</b></span><div class="meter enemy-meter"><i style="width:${b.hp/b.max*100}%"></i></div></div><div><span>TRUST <b>${b.peace}/2</b></span><div class="meter trust-meter"><i style="width:${b.peace/2*100}%"></i></div></div></div>${content}<div class="battle-bottom"><strong>♥ XII <span id="battleHP">${S.hp}/${S.max}</span></strong><span>${S.potions} POTIONS · ${b.assist?'GENTLE':'STANDARD'}</span></div>`);
 $('box').classList.add('combat-box');
}
function drawBattle(){
 if(!battle)return;const b=battle;b.phase='menu';
 battleFrame(`<div class="battle-message"><span class="turn-label">01 / CHOOSE YOUR APPROACH</span><p>${b.peace>=2?'The creature lowers its guard. You can spare it now.':'Fight with what you know. Connect with what you learn.'}</p></div><div class="battle-actions"><button class="fight-action" onclick="chooseAction('fight')">⚔ FIGHT<small>Answer to deal damage</small></button><button class="act-action" onclick="chooseAction('act')">✧ ACT<small>Answer to build trust</small></button><button onclick="battlePotion()" ${S.potions<1||S.hp===S.max?'disabled':''}>♡ ITEM<small>Potion · restore 7 HP</small></button><button class="mercy-action" onclick="resolveBattle(true)" ${b.peace<2?'disabled':''}>☀ MERCY<small>${b.peace>=2?'Spare this creature':'Needs 2 trust'}</small></button></div><div class="battle-options"><button onclick="toggleAssist()">${b.assist?'✓ Gentle dodge':'Gentle dodge: off'}</button><button onclick="flee()">Retreat · 1 HP ↗</button></div>`);
}
function toggleAssist(){if(battle?.phase!=='menu')return;battle.assist=!battle.assist;drawBattle();}
function chooseAction(action){if(battle?.phase!=='menu'||!['fight','act'].includes(action))return;const b=battle;b.action=action;b.phase='question';question();
 battleFrame(`<div class="battle-message"><span class="turn-label">02 / ${action==='fight'?'FIND YOUR STRIKE':'SPEAK WITH KINDNESS'}</span><p>What does this word mean? Take your time.</p></div><div class="question" lang="eo">${escapeHTML(b.word.eo)}</div><div class="answers">${b.options.map((x,i)=>`<button onclick="answer(${i})"><kbd>${i+1}</kbd> ${escapeHTML(x)}</button>`).join('')}</div><p class="battle-tip">Correct answer = ${action==='fight'?'a stronger strike':'one trust'} + a shield for the next attack.</p>`,action==='fight'?'FIGHT':'ACT');
}
function answer(index){
 if(battle?.phase!=='question'||battle.answered||!Number.isInteger(index)||index<0||index>=battle.options.length)return;
 const b=battle;b.answered=true;b.correct=b.options[index]===b.word.en;b.phase='feedback';b.shield=b.correct?1:0;S.notebook[b.word.eo]=b.word.en;
 if(b.correct){if(b.action==='fight')b.hp=Math.max(0,b.hp-S.atk-2);else b.peace=Math.min(2,b.peace+1);}
 render();if(b.hp===0)return resolveBattle(false);
 battleFrame(`<div class="answer-result ${b.correct?'correct':'incorrect'}"><span>${b.correct?'✦ WELL SPOKEN':'✎ A WORD TO KEEP'}</span><p><b lang="eo">${escapeHTML(b.word.eo)}</b> means <b>${escapeHTML(b.word.en)}</b>.</p><small>${b.correct?(b.action==='fight'?`${S.atk+2} damage dealt. `:'The creature trusts you a little more. ')+'Your shield absorbs one hit.':'No direct damage for a mistake. The next pattern lasts a little longer.'}</small></div><div class="pattern-preview"><span>INCOMING / ${b.pattern}</span><p>${b.hint}</p><small>Move your heart with WASD / arrows, or drag inside the arena. Escape pauses.</small></div><div class="actions"><button class="primary" onclick="startDodge()">Ready · dodge →</button></div>`,'WORD REVEALED');
}
function battlePotion(){if(battle?.phase!=='menu'||S.potions<1||S.hp===S.max)return;const gain=Math.min(7,S.max-S.hp);S.hp+=gain;S.potions--;battle.correct=true;battle.shield=0;battle.phase='feedback';render();battleFrame(`<div class="answer-result correct"><span>♡ A MOMENT TO BREATHE</span><p>You recover ${gain} health.</p></div><div class="pattern-preview"><span>INCOMING / ${battle.pattern}</span><p>${battle.hint}</p></div><div class="actions"><button class="primary" onclick="startDodge()">Ready · dodge →</button></div>`,'ITEM');}
function startDodge(){
 if(battle?.phase!=='feedback')return;stopDodge();const b=battle;
 // A dodge round is a proper little action scene now: enough time to read a
 // pattern, settle into movement, and recover from one mistake.
 Object.assign(b,{phase:'dodge',elapsed:0,duration:b.assist?7:b.correct?9:11,spawnClock:0.55,bullets:[],heart:{x:50,y:76},invulnerable:0,hits:0,paused:false,pointer:null});
 battleFrame(`<div class="dodge-heading"><div><span class="turn-label">03 / ${b.pattern}</span><p id="dodgeStatus">Move your heart. Stay in the light.</p></div><button id="pauseButton" onclick="pauseDodge()">Pause Ⅱ</button></div><div class="dodge-arena" id="dodgeArena" tabindex="0" aria-label="Dodge arena. Move with arrow keys or WASD, or drag. Escape pauses."><div class="arena-grid"></div><div id="bulletLayer" aria-hidden="true"></div><div id="soul" class="soul-heart" aria-hidden="true">♥</div><div id="arenaOverlay" class="arena-overlay" hidden><strong>TAKE A BREATH</strong><button onclick="resumeDodge()">Resume →</button></div></div><div class="dodge-progress"><i id="dodgeProgress"></i></div><div class="arena-hints"><span>WASD / ↑↓←→ · drag to move</span><span id="shieldStatus">${b.shield?'◇ SHIELD READY':'♥ STAY CLEAR'}</span></div>`,'DODGE');
 $('box').classList.add('dodge-mode');
 const arena=$('dodgeArena');
 const setTarget=e=>{const rect=arena.getBoundingClientRect();b.pointer={x:Math.max(3,Math.min(97,(e.clientX-rect.left)/rect.width*100)),y:Math.max(5,Math.min(95,(e.clientY-rect.top)/rect.height*100))};};
 arena.addEventListener('pointerdown',e=>{if(b.phase!=='dodge'||b.paused||e.target.closest('button'))return;e.preventDefault();arena.setPointerCapture(e.pointerId);setTarget(e);});
 arena.addEventListener('pointermove',e=>{if(arena.hasPointerCapture(e.pointerId)&&!b.paused)setTarget(e);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])arena.addEventListener(event,()=>{b.pointer=null;});
 arena.focus();drawDodge();dodgeFrame=requestAnimationFrame(dodgeTick);
}
function spawnPattern(){
 const b=battle;const speed=(b.assist?18:25)+Math.min(S.floor,5)*1.5;
 const add=(x,y,vx,vy,glyph='•')=>b.bullets.push({x,y,vx,vy,glyph});
 if(b.kind==='ink'){const gap=r(6);for(let i=0;i<6;i++)if(i!==gap)add(8+i*17,-6,Math.sin(b.elapsed)*3,speed,'♦');}
 else if(b.kind==='moss'){const left=Math.floor(b.elapsed)%2===0;const gap=r(4);for(let i=0;i<4;i++)if(i!==gap)add(left?-5:105,15+i*23,left?speed:-speed,0,'✦');}
 else{const source=20+r(60);for(let i=-2;i<=2;i++)add(source,-8,i*10,speed-Math.abs(i)*2,['a','o','i'][r(3)]);}
}
// Simulation uses seconds and bounded steps so refresh rate cannot change difficulty.
function updateDodge(dt){
 if(!Number.isFinite(dt)||dt<=0)return;
 let remaining=Math.min(dt,0.25);
 while(remaining>0&&battle?.phase==='dodge'&&!battle.paused){const step=Math.min(remaining,0.02);stepDodge(step);remaining-=step;}
}
function stepDodge(dt){
 const b=battle;if(!b||b.phase!=='dodge'||b.paused)return;dt=Math.min(Math.max(dt,0),0.04);b.elapsed+=dt;b.invulnerable=Math.max(0,b.invulnerable-dt);
 let dx=(dodgeKeys.has('d')||dodgeKeys.has('arrowright')?1:0)-(dodgeKeys.has('a')||dodgeKeys.has('arrowleft')?1:0);
 let dy=(dodgeKeys.has('s')||dodgeKeys.has('arrowdown')?1:0)-(dodgeKeys.has('w')||dodgeKeys.has('arrowup')?1:0);
 if(b.pointer){dx=b.pointer.x-b.heart.x;dy=(b.pointer.y-b.heart.y)*.56;}
 const distance=Math.hypot(dx,dy);if(distance){const step=b.pointer?Math.min(distance,dt*58):dt*58;b.heart.x+=dx/distance*step;b.heart.y+=dy/distance*step/.56;}
 b.heart.x=Math.max(3,Math.min(97,b.heart.x));b.heart.y=Math.max(5,Math.min(95,b.heart.y));
 b.spawnClock-=dt;if(b.spawnClock<=0){spawnPattern();b.spawnClock=b.assist?1.15:.78;}
 for(const p of b.bullets){p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(Math.hypot(p.x-b.heart.x,(p.y-b.heart.y)*.56)<3.2&&b.invulnerable<=0){
   b.invulnerable=1.05;b.hits++;if(b.shield){b.shield=0;$('dodgeStatus').textContent='Your word shield absorbed the hit.';}else{const damage=b.assist?1:Math.max(1,Math.min(5,1+Math.ceil(S.floor/2))-S.def);S.hp=Math.max(0,S.hp-damage);$('dodgeStatus').textContent=`Hit · −${damage} HP. Keep going!`;}
   render();if(S.hp===0)return finish(false);
  }
 }
 b.bullets=b.bullets.filter(p=>p.x>-12&&p.x<112&&p.y>-15&&p.y<115);
 if(b.elapsed>=b.duration)endDodge();
}
function drawDodge(){
 const b=battle;if(!b||b.phase!=='dodge')return;
 $('soul').style.left=`${b.heart.x}%`;$('soul').style.top=`${b.heart.y}%`;$('soul').className=`soul-heart${b.shield?' shielded':''}${b.invulnerable>0?' invulnerable':''}`;
 $('bulletLayer').innerHTML=b.bullets.map(p=>`<span class="projectile ${b.kind}" style="left:${p.x}%;top:${p.y}%">${p.glyph}</span>`).join('');
 $('dodgeProgress').style.width=`${Math.max(0,1-b.elapsed/b.duration)*100}%`;$('battleHP').textContent=`${S.hp}/${S.max}`;$('shieldStatus').textContent=b.shield?'◇ SHIELD READY':`${Math.ceil(b.duration-b.elapsed)}s REMAINING`;
}
function dodgeTick(now){dodgeFrame=0;if(!battle||battle.phase!=='dodge'||battle.paused)return;if(dodgeLast)updateDodge((now-dodgeLast)/1000);dodgeLast=now;if(battle?.phase==='dodge'&&!battle.paused){drawDodge();dodgeFrame=requestAnimationFrame(dodgeTick);}}
function pauseDodge(){if(battle?.phase!=='dodge'||battle.paused)return;battle.paused=true;stopDodge();$('arenaOverlay').hidden=false;$('pauseButton').disabled=true;$('arenaOverlay').querySelector('button').focus();}
function resumeDodge(){if(battle?.phase!=='dodge'||!battle.paused)return;battle.paused=false;$('arenaOverlay').hidden=true;$('pauseButton').disabled=false;$('dodgeArena').focus();dodgeLast=0;dodgeFrame=requestAnimationFrame(dodgeTick);}
function endDodge(){if(battle?.phase!=='dodge')return;stopDodge();battle.turn++;drawBattle();}
function nextQuestion(){if(battle?.phase==='feedback')startDodge();}
function resolveBattle(mercy){if(!battle||(mercy&&(battle.peace<2||battle.phase!=='menu'))||(!mercy&&battle.hp>0))return;stopDodge();const name=battle.name,source=battle.source;S.gold+=8;S[mercy?'mercy':'kills']++;
 if(source.kind==='roamer')S.monsters=S.monsters.filter(m=>m.id!==source.id);else{S.g[source.y][source.x]='.';delete S.enemies[`${source.x},${source.y}`];}
 battle=null;S.roamGrace=WORLD_GRACE_TICKS;guide(`${mercy?'You spared':'You defeated'} ${name}. +8 gold. Its words remain in your notebook.`);showDialog(mercy?'An unexpected friend':'The passage is clear',`<div class="note">${mercy?'“Dankon, amiko.”<br>Thank you, friend.':'The scattered letters settle. A path opens.'}</div><p>+8 gold · New words saved in your notebook.</p><button class="primary" onclick="closeModal()">Continue exploring →</button>`);hear();render();}
function flee(){if(battle?.phase!=='menu')return;stopDodge();Object.assign(battle.profile,{hp:battle.hp,peace:battle.peace});S.hp=Math.max(0,S.hp-1);battle=null;S.x=1;S.y=1;S.roamGrace=WORLD_GRACE_TICKS;if(!S.hp)return finish(false);closeModal();guide('You retreat to the entrance, losing 1 health. The creature remembers your encounter. You have a moment to find cover.');hear();render();}
function finish(){if(typeof stopStory==='function')stopStory();stopWorld();stopDodge();battle=null;S.over=true;recordDepth();guide('Your torch goes out. The words you learned are still yours.');render();showDialog('The light goes quiet',`<p>Your expedition ends on floor ${S.floor}. The halls will be different next time.</p><div class="note">Deepest floor: ${S.floor}<br>Personal best: ${bestFloor}<br>${Object.keys(S.notebook).length} words discovered · ${S.gold} gold<br>${S.mercy} creatures spared</div><p>${scoreSaved?'Your record is saved on this browser.':'Browser storage is unavailable; your record is kept for this session.'}</p><button class="primary" onclick="newRun()">Begin a new expedition →</button>`);}
function showNotebook(){if(battle||S.over)return;showDialog('The wordkeeper’s notebook',`<p>Every word encountered in battle is kept here, including mistakes.</p>${Object.entries(S.notebook).map(([eo,en])=>`<div class="word-row"><b lang="eo">${escapeHTML(eo)}</b><span>${escapeHTML(en)}</span></div>`).join('')||'<div class="note">An empty page is a beginning. Meet a creature to learn your first word.</div>'}<div class="actions"><button onclick="closeModal()">Back to the dungeon</button></div>`);}
function showLore(){if(battle||S.over)return;showDialog('Fragments of the underworld',S.lore.map(x=>`<div class="note">${escapeHTML(x)}</div>`).join('')+'<p>Follow the rustle of pages. Each floor holds a memory; your latest 100 fragments are kept here.</p><button onclick="closeModal()">Back to the dungeon</button>');}
function help(){if(battle||S.over)return;showDialog('A small guide to the dark','<p>Move one tile with <b>WASD</b>, arrows, or the direction buttons. Press <b>.</b> or the center button to listen again. Wandering creatures move every <b>0.7 seconds</b>, even while you stand still. They pursue you when they can see you within seven tiles. Break their sight behind a wall and they search your last known position before roaming again. The halls pause during dialogue, battles, and while the game is unfocused.</p><p>Unknown encounters share a <b>?</b> marker. Visit a friend to mark them <b>☻</b> permanently on this floor. Visible monsters reveal as <b>♟</b> within two tiles; you recognize them afterward while they remain in sight. “What you hear” gives directions and distance through the passages. A growl or footsteps suggests danger; voices, bells, coins, creaking wood, pages, brass, and drafts each tell a different story. Unknown things disappear into the fog; terrain stays remembered.</p><p>Find a key and the stairs on every floor. There is no last floor. Your <b>best floor reached</b> is saved in this browser, even after a new run.</p><p>Choose FIGHT to attack with a correct Esperanto answer, or ACT to build trust. Then dodge for 9 seconds, or 11 after a mistake. Correct answers shield one hit. Two trust unlocks MERCY after the dodge. Gentle mode lasts 7 seconds with slower attacks. Escape pauses. ITEM heals and uses a turn; retreat costs 1 HP.</p><p>Travelers and shops are scattered randomly through the halls. Meet new characters, learn words, accept a gift, and spend gold on supplies. Each traveler can give one gift. Friends stay marked in remembered terrain. Monsters disappear into fog, so their movement cannot be tracked through walls.</p><button class="primary" onclick="closeModal()">I’m ready →</button>');}
window.addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();
 if(battle?.phase==='dodge'){if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();if(!battle.paused){dodgeKeys.add(k);battle.pointer=null;}return;}if(k==='escape'){e.preventDefault();if(!e.repeat){if(battle.paused)resumeDodge();else pauseDodge();}return;}}
 if(battle?.phase==='question'&&/^[1-4]$/.test(k)){e.preventDefault();if(!e.repeat)answer(Number(k)-1);return;}
 if($('modal').classList.contains('show')){
  if(k==='escape'){e.preventDefault();closeModal();}
  if(k==='tab'){const items=[...$('box').querySelectorAll('button:not(:disabled),a[href]')];const first=items[0],last=items.at(-1);if(items.length&&(e.shiftKey&&(document.activeElement===first||document.activeElement===$('box')))){e.preventDefault();last.focus();}else if(items.length&&!e.shiftKey&&(document.activeElement===last||document.activeElement===$('box'))){e.preventDefault();first.focus();}}
  return;
 }
 if(['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(e.target?.tagName)&&!['arrowup','arrowdown','arrowleft','arrowright'].includes(k))return;
 const dirs={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};
 if(!dirs[k]&&k!=='.'&&k!=='p')return;e.preventDefault();if(e.repeat||heldKeys.has(k))return;heldKeys.add(k);if(dirs[k])move(...dirs[k]);else if(k==='p')potion();else waitTurn();
});
window.addEventListener('keyup',e=>{heldKeys.delete(e.key.toLowerCase());dodgeKeys.delete(e.key.toLowerCase());});
window.addEventListener('blur',()=>{worldFocused=false;stopWorld();heldKeys.clear();pauseDodge();});
window.addEventListener('focus',()=>{worldFocused=true;startWorld();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopWorld();heldKeys.clear();pauseDodge();}else startWorld();});
window.addEventListener('pagehide',stopWorld);
window.addEventListener('pageshow',startWorld);
newRun();
