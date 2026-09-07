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
 'La unuaj gardantoj konstruis ĉi tiun lokon por ŝirmi lingvon. Ili neniam volis fari ĝin malliberejo.',
 'Vorto dirita kun bonkoreco malfermas pordojn, kiujn fero ne povas malfermi. La estaĵoj memoras tion, eĉ kiam ili forgesas siajn nomojn.',
 'Dek unu vojaĝantoj venis antaŭ vi. Ĉiu postlasis vorton. XII ne estas nomo; ĝi estas promeso, ke iu daŭre serĉos.',
 'La lanterno brulas per memoroj. Ĉiu vorto, kiun vi portas, proksimigas ĝian flamon al la surfaco.',
 'Super la lasta ŝtupo, nekonato atendas por diri “bonvenon”. Vi finfine scias, kion tio signifas.'
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
 return `${pick(['Flustra','Radikplena','Lunluma','Forgesita','Kava','Vitra','Ŝveba','Dormanta'])} ${pick(['halo','arkivo','ĝardeno','volbo','biblioteko','koridoro','galerio','katakombo'])} · ${depth}`;
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
 guide('La haloj denove ŝanĝiĝis. Ĉiu nekonato portas la saman signon. Aŭskultu la indicojn, trovu ŝlosilon kaj iru kiel eble plej profunden.');hear();render();
 showDialog('Noto en via mantelo',`<p class="eyebrow">LA SENFINA EKSPEDICIO</p><div class="note">La ŝtuparo ne havas finon.<br>La mallumo havas multajn voĉojn.<br><br>Aŭskultu antaŭ ol sekvi.</div><p>Ĉiu ? povas esti amiko, provizoj, ŝtuparo aŭ danĝero. Renkontitaj amikoj restas markitaj. Videblaj monstroj montras sian signon je distanco de du kaheloj. Legu “Kion vi aŭdas” por trovi direktojn kaj indicojn. Estaĵoj moviĝas eĉ kiam vi staras senmove. Se iu vidas vin, ĝi sekvos vin. Muroj povas kaŝi vin; dialogoj kaj bataloj paŭzigas la halojn.</p><p>Via plej profunda etaĝo estas konservita en ĉi tiu retumilo. Nuna rekordo: etaĝo ${bestFloor}.</p><button class="primary" onclick="closeModal()">Ekbruligu la torĉon →</button>`);
}
function requestNewRun(){if(battle)return;if(S.over)return newRun();showDialog('Ĉu rekomenci?', '<p>Via nuna ekspedicio kaj ĝia kajero estos rekomencigitaj.</p><div class="actions"><button onclick="closeModal()">Daŭrigu esplori</button><button onclick="newRun()">Komencu novan ekspedicion</button></div>');}
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
const mysteryTile=['floor mystery','?','Nekonata ĉeesto'];
const friendTile=['floor friendly','☻','Amiko'];
const monsterTile=['floor monster','♟','Monstro'];
const tileInfo={'#':['wall','','Ŝtona muro'],'.':['floor','','Koridoro'],M:mysteryTile,R:mysteryTile,T:mysteryTile,G:mysteryTile,K:mysteryTile,L:mysteryTile,E:mysteryTile,N:mysteryTile,B:mysteryTile};
function render(){
 const map=$('map');map.innerHTML='';let explored=0,total=0;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const lit=visible(x,y),key=`${x},${y}`,roamer=S.monsters.find(m=>m.x===x&&m.y===y),tile=roamer?'R':S.g[y][x];if(lit)S.seen[key]=tile==='#'?'#':'.';
  if(tile!=='#'){total++;if(S.seen[key])explored++;}
  const known=lit?tile:S.seen[key];const cell=document.createElement('div');
  const near=Math.max(Math.abs(x-S.x),Math.abs(y-S.y))<=2;
  if(lit&&near){if(roamer)roamer.revealed=true;else if(tile==='M')S.revealedMonsters[key]=true;}
  let info=tileInfo[known]||['dark','','Neesplorita'];
  if(S.seen[key]&&S.g[y][x]==='N'&&S.revealedFriends[key])info=friendTile;
  if(lit&&(roamer?.revealed||tile==='M'&&S.revealedMonsters[key]))info=monsterTile;
  const you=x===S.x&&y===S.y;
  cell.className=`cell ${info[0]}${known&&!lit?' seen':''}${you?' you':''}`;
  cell.title=you?'XII · Vi':info[2];cell.setAttribute('aria-hidden','true');
  if(you)cell.innerHTML='<span class="avatar">XII</span>';else cell.textContent=info[1];map.appendChild(cell);
 }
 map.setAttribute('aria-label',`Etaĝo ${S.floor}. Vi estas ĉe kolumno ${S.x+1}, vico ${S.y+1}. ${Math.round(explored/total*100)} procentoj esploritaj.`);
 $('hp').textContent=`${S.hp} / ${S.max}`;$('healthFill').style.width=`${S.hp/S.max*100}%`;
 $('floor').textContent=`ETAĜO ${String(S.floor).padStart(2,'0')} · ∞`;$('floorName').textContent=S.floorName;
 $('bestDepth').textContent=`REKORDO · ETAĜO ${bestFloor}`;$('scoreNote').textContent=scoreSaved?'Rekordo konservita en ĉi tiu retumilo':'Rekordo konservita por ĉi tiu sesio';
 for(const id of ['atk','def','gold','keys'])$(id).textContent=S[id];
 $('explored').textContent=`${Math.round(explored/total*100)}% esplorita`;
 $('bag').textContent=`${S.potions} ${S.potions===1?'pocio':'pocioj'} · ${S.lore.length} ${S.lore.length===1?'rakontfragmento':'rakontfragmentoj'}`;$('wordCount').textContent=Object.keys(S.notebook).length;
 $('potionButton').disabled=S.potions===0||S.hp===S.max||!!battle||S.over;
 $('runStatus').textContent=S.over?'EKSPEDICIO FINITA':'EKSPEDICIO EN PROGRESO';
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
const soundClues={M:'“Foriru…” · Mallaŭta grumblo, poste retenita spiro.',R:'“Paŝo, paŝo…” · Malregulaj paŝoj skrapas sur ŝtono.',N:'“Saluton?” · Milda voĉo mallaŭte kantas.',B:'“Bonan prezon!” · Sonorilo tintas super flustrita oferto.',T:'Ligno knaras. Vitro tintas en io fermita.',G:'Moneroj mallaŭte tintas unu kontraŭ la alia.',K:'Eta latuna objekto klakas sur ringo.',L:'“Memoru…” · Papero susuras sub flustrita memoro.',E:'Longa aerblovo fajfas laŭ kavaj ŝtupoj.'};
function nearbySounds(){
 const sounds=[];const consider=(x,y,t)=>{if(!soundClues[t])return;const path=pathTo(S.x,S.y,x,y,(a,b)=>S.g[b]?.[a]&&S.g[b][a]!=='#');if(!path.length||path.length>10)return;
  const dx=x-S.x,dy=y-S.y,dir=dx===0&&dy===0?'Ĉi tie':`${dy<0?'nord':dy>0?'sud':''}${dx<0?'okcident':dx>0?'orient':''}e`;
  const distance=path.length-1; sounds.push({distance,x,y,text:`${dir} · ${distance<=2?'tre proksime':distance<=5?'proksime':'malproksime'}\n${soundClues[t]}`});};
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++)consider(x,y,S.g[y][x]);
 for(const m of S.monsters)consider(m.x,m.y,'R');
 return sounds.sort((a,b)=>a.distance-b.distance||a.y-b.y||a.x-b.x).slice(0,3);
}
function hear(){const sounds=nearbySounds();$('hear').textContent=sounds.length?sounds.map(x=>x.text).join('\n\n'):'Nur via spirado kaj fora gutado. Iru plu por aŭdi pli.';}
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
  if(m.x===S.x&&m.y===S.y){guide('La paŝoj haltas apud vi. Vaganta estaĵo eniras la lumon de via torĉo.');startBattle(m);break;}
 }
 hear();render();
}
function advanceWorld(){worldTick();}
function move(dx,dy){if(blocked()||Math.abs(dx)+Math.abs(dy)!==1)return;const x=S.x+dx,y=S.y+dy,t=S.g[y]?.[x];if(!t||t==='#'){guide('Malvarma ŝtono. Provu alian koridoron.');return render();}S.x=x;S.y=y;const monster=S.monsters.find(m=>m.x===x&&m.y===y);if(monster)startBattle(monster);else encounter(t);hear();render();}
function waitTurn(){if(blocked())return;guide('Vi atente aŭskultas. La haloj daŭre moviĝas; la proksimaj paŝoj eble venas al vi.');hear();render();}
function potion(){if(blocked()||S.potions<1||S.hp>=S.max)return;const gain=Math.min(7,S.max-S.hp);S.potions--;S.hp+=gain;guide(`Vi trinkas pocion kaj reakiras ${gain} vivpoentojn.`);render();}
function clearTile(){S.g[S.y][S.x]='.';}
function encounter(tile){
 if(tile==='N'){S.revealedFriends[`${S.x},${S.y}`]=true;return openNPC();}
 if(tile==='B')return openShop();
 if(tile==='M')return startBattle();
 if(tile==='G'){const gold=5+r(8);S.gold+=gold;clearTile();guide(`Vi trovis ${gold} ormonerojn sub malfiksita ŝtono.`);}
 if(tile==='K'){S.keys++;clearTile();guide('Latuna ŝlosilo. Vi nun povas malŝlosi la ŝtuparon sur ĉi tiu etaĝo.');}
 if(tile==='T'){S.potions++;S.gold+=5;clearTile();guide('Proviza kesto: unu pocio kaj 5 ormoneroj.');}
 if(tile==='L'){const text=`Etaĝo ${S.floor}: ${pick(storyBits.slice(0,4))}`;if(!S.lore.includes(text))S.lore.push(text);S.lore=S.lore.slice(-100);clearTile();guide('Memoro revenas. Nova fragmento aldoniĝis al viaj rakontoj.');showDialog('Postlasita paĝo',`<div class="note">${escapeHTML(text)}</div><button onclick="closeModal()">Konservu la fragmenton</button>`);}
 if(tile==='E'){if(!S.keys){guide('La ŝtupara pordo estas ŝlosita. Aŭskultu la klakadon de latuna ŝlosilo.');return;}showDialog('La ŝtuparo daŭras',`<p>Uzu unu ŝlosilon por atingi etaĝon ${S.floor+1}. Reakiru 5 vivpoentojn kaj gajnu 1 atakpoenton. Novaj haloj, voĉoj kaj estaĵoj atendas malsupre.</p><div class="actions"><button onclick="closeModal()">Daŭrigu esplori</button><button class="primary" onclick="descend()">Malsupreniru →</button></div>`);}
}
function descend(){if(battle||S.over||S.g[S.y][S.x]!=='E'||S.keys<1)return;S.keys--;S.floor++;S.atk++;S.hp=Math.min(S.max,S.hp+5);loadFloor();closeModal();guide(`Vi atingas novan lokon: ${S.floorName}. +1 atako kaj ĝis 5 vivpoentoj reakiritaj. Rekordo: etaĝo ${bestFloor}.`);hear();render();}
// Battle turns alternate between deliberate language choices and short dodge rounds.
const enemyTypes = [
 {name:'inka fantomo',kind:'ink',attackStyle:'rain',symbol:'◕',quote:'“Ĉu vi memoras, kion vi venis ĉi tien por diri?”',pattern:'INKA DILUVO',hint:'La breĉo en la pluvo ŝoviĝas. Poste venas oblikvaj gutoj kaj markitaj lumkolonoj.',color:'#c2afe7'},
 {name:'muska gardanto',kind:'moss',attackStyle:'roots',symbol:'♣',quote:'“Mildaj vortoj kreskas tie, kie akraj ne povas.”',pattern:'RADIKA LABIRINTO',hint:'Radikaj muroj alternas inter la flankoj. Serĉu la malfermaĵon kaj atentu la lumstriojn.',color:'#b9d391'},
 {name:'perdita skribisto',kind:'scribe',attackStyle:'letters',symbol:'✧',quote:'“Mi konas la literojn. Mi forgesis la signifon.”',pattern:'ĈASANTAJ FRAZOJ',hint:'Literaj ventumiloj celas vian lastan lokon. Moviĝu post ĉiu salvo; ne kaptiĝu en angulo.',color:'#e4c38a'},
 {name:'sonorila tineo',kind:'ink',attackStyle:'chimes',symbol:'♢',quote:'“Se mi sonoros, ĉu iu respondos?”',pattern:'SONORILA ONDADO',hint:'Sonoriloj svingiĝas dum ili falas. La lasta ondo aldonas sonorilojn venantajn de sube.',color:'#b6cfe2'},
 {name:'dorna tajloro',kind:'moss',attackStyle:'threads',symbol:'×',quote:'“Mi povus fliki tiun silenton por vi.”',pattern:'DORNA TEKSAĴO',hint:'Oblikvaj kudreroj teksas krucvojojn. Antaŭ ĉiu lumtranĉo aperas averta strio.',color:'#e1a3b0'},
 {name:'kandela vaganto',kind:'scribe',attackStyle:'embers',symbol:'♨',quote:'“Mia flamo memoras alian ĉielon.”',pattern:'BRAĜA SPIRALO',hint:'Braĝoj kurbiĝas dumfluge. Sekvu la larĝan breĉon kaj preparu vin por ŝanĝi direkton.',color:'#e8b275'}
];
function generateEnemy(){
 const type=pick(enemyTypes),name=pick(['Velo','Nim','Aru','Sori','Fen','Ilo','Tavi','Eru'])+pick(['na','ri','lo','mi','sa','vo']);
 return {...type,name:`${name}, ${pick(['maltrankvila','dormema','scivola','singarda','sopira','tremanta'])} ${type.name}`,hp:8+S.floor*2,max:8+S.floor*2,peace:0};
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
function battleFrame(content,caption='VIA VICO'){
 const b=battle;
 showDialog(b.name,`<div class="battle-topline"><span>RENKONTO / ${String(S.floor).padStart(2,'0')}</span><span>VICO ${b.turn} · ${caption}</span></div><div class="enemy-stage">${enemyPortrait(b)}<p>${b.quote}</p></div><div class="battle-meters"><div><span>ESTAĴO <b>${b.hp}/${b.max}</b></span><div class="meter enemy-meter"><i style="width:${b.hp/b.max*100}%"></i></div></div><div><span>FIDO <b>${b.peace}/2</b></span><div class="meter trust-meter"><i style="width:${b.peace/2*100}%"></i></div></div></div>${content}<div class="battle-bottom"><strong>♥ XII <span id="battleHP">${S.hp}/${S.max}</span></strong><span>${S.potions} ${S.potions===1?'POCIO':'POCIOJ'} · ${b.assist?'TRANKVILA':'NORMA'}</span></div>`);
 $('box').classList.add('combat-box');
}
function drawBattle(){
 if(!battle)return;const b=battle;b.phase='menu';
 battleFrame(`<div class="battle-message"><span class="turn-label">01 / ELEKTU VIAN AGON</span><p>${b.peace>=2?'La estaĵo malstreĉiĝas. Vi nun povas indulgi ĝin.':'Batalu per tio, kion vi scias. Amikiĝu per tio, kion vi lernas.'}</p></div><div class="battle-actions"><button class="fight-action" onclick="chooseAction('fight')">⚔ BATALU<small>Respondu por ataki</small></button><button class="act-action" onclick="chooseAction('act')">✧ PAROLU<small>Respondu por gajni fidon</small></button><button onclick="battlePotion()" ${S.potions<1||S.hp===S.max?'disabled':''}>♡ UZU<small>Pocio · +7 vivo</small></button><button class="mercy-action" onclick="resolveBattle(true)" ${b.peace<2?'disabled':''}>☀ INDULGU<small>${b.peace>=2?'Lasu la estaĵon foriri':'Bezonas 2 fidpoentojn'}</small></button></div><div class="battle-options"><button onclick="toggleAssist()">${b.assist?'✓ Trankvila reĝimo':'Trankvila reĝimo: ne'}</button><button onclick="flee()">Retiriĝu · −1 vivo ↗</button></div>`);
}
function toggleAssist(){if(battle?.phase!=='menu')return;battle.assist=!battle.assist;drawBattle();}
function chooseAction(action){if(battle?.phase!=='menu'||!['fight','act'].includes(action))return;const b=battle;b.action=action;b.phase='question';question();
 battleFrame(`<div class="battle-message"><span class="turn-label">02 / ${action==='fight'?'PREPARU VIAN ATAKON':'PAROLU BONKORE'}</span><p>Kion signifas ĉi tiu vorto en la angla? Ne rapidu.</p></div><div class="question" lang="eo">${escapeHTML(b.word.eo)}</div><div class="answers">${b.options.map((x,i)=>`<button lang="en" onclick="answer(${i})"><kbd>${i+1}</kbd> ${escapeHTML(x)}</button>`).join('')}</div><p class="battle-tip">Ĝusta respondo = ${action==='fight'?'pli forta atako':'unu fidpoento'} + ŝildo por la sekva atako.</p>`,action==='fight'?'BATALU':'PAROLU');
}
function answer(index){
 if(battle?.phase!=='question'||battle.answered||!Number.isInteger(index)||index<0||index>=battle.options.length)return;
 const b=battle;b.answered=true;b.correct=b.options[index]===b.word.en;b.phase='feedback';b.shield=b.correct?1:0;S.notebook[b.word.eo]=b.word.en;
 if(b.correct){if(b.action==='fight')b.hp=Math.max(0,b.hp-S.atk-2);else b.peace=Math.min(2,b.peace+1);}
 render();if(b.hp===0)return resolveBattle(false);
 battleFrame(`<div class="answer-result ${b.correct?'correct':'incorrect'}"><span>${b.correct?'✦ BONE DIRITE':'✎ VORTO MEMORINDA'}</span><p><b lang="eo">${escapeHTML(b.word.eo)}</b> signifas <b lang="en">${escapeHTML(b.word.en)}</b>.</p><small>${b.correct?(b.action==='fight'?`Vi kaŭzis ${S.atk+2} damaĝpoentojn. `:'La estaĵo iom pli fidas vin. ')+'Via ŝildo sorbos unu trafon.':'Eraro ne rekte damaĝas vin. La sekva atako daŭros iom pli longe.'}</small></div><div class="pattern-preview"><span>VENAS / ${b.pattern}</span><p>${b.hint}</p><small>Movu vian koron per WASD / sagoj aŭ trenu ĝin en la areno. Eskapo paŭzigas.</small></div><div class="actions"><button class="primary" onclick="startDodge()">Preta · evitu →</button></div>`,'VORTO MALKAŜITA');
}
function battlePotion(){if(battle?.phase!=='menu'||S.potions<1||S.hp===S.max)return;const gain=Math.min(7,S.max-S.hp);S.hp+=gain;S.potions--;battle.correct=true;battle.shield=0;battle.phase='feedback';render();battleFrame(`<div class="answer-result correct"><span>♡ MOMENTO POR SPIRI</span><p>Vi reakiras ${gain} vivpoentojn.</p></div><div class="pattern-preview"><span>VENAS / ${battle.pattern}</span><p>${battle.hint}</p></div><div class="actions"><button class="primary" onclick="startDodge()">Preta · evitu →</button></div>`,'UZU');}
function combatTuning(b){
 const depth=Math.min(8,Math.floor((Math.max(1,S.floor)-1)/2)),round=Math.min(4,Math.max(0,b.turn-1)),pressure=Math.min(10,depth+round);
 const extra=Math.min(4,Math.floor((Math.max(1,S.floor)-1)/3)+Math.floor(Math.max(0,b.turn-1)/2));
 return {duration:b.assist?7:(b.correct?12:15)+extra,speed:b.assist?20:30+pressure*1.4,interval:b.assist?1.25:Math.max(.62,.9-pressure*.022),warning:b.assist?1.25:Math.max(.78,1-pressure*.02)};
}
function combatRules(){return '<div class="combat-rules"><span class="rule-avoid">◇ BLANKA: EVITU</span><span class="rule-still">Ⅱ BLUA: HALTU</span><span class="rule-move">» ORANĜA: MOVIĜU</span></div>';}
function startDodge(){
 if(battle?.phase!=='feedback')return;stopDodge();const b=battle;
 const tuning=combatTuning(b);
 Object.assign(b,{phase:'dodge',elapsed:0,tuning,duration:tuning.duration,stage:0,patternCount:0,hazardCount:0,spawnClock:.7,hazardClock:2.2,bullets:[],hazards:[],heart:{x:50,y:76},moving:false,invulnerable:0,hits:0,paused:false,pointer:null});
 battleFrame(`<div class="dodge-heading"><div><span class="turn-label" id="waveLabel">ONDO 1 / 3 · TROVU LA RITMON</span><p id="dodgeStatus">La strioj avertas antaŭ ol ili trafas.</p></div><button id="pauseButton" onclick="pauseDodge()">Paŭzu Ⅱ</button></div>${combatRules()}<div class="dodge-arena" id="dodgeArena" tabindex="0" aria-label="Evitada areno. Moviĝu per sagoj aŭ WASD, aŭ trenu. Evitu blankon, haltu en bluo, moviĝu en oranĝo. Eskapo paŭzigas."><div class="arena-grid"></div><div id="hazardLayer" aria-hidden="true"></div><div id="bulletLayer" aria-hidden="true"></div><div id="soul" class="soul-heart" aria-hidden="true">♥</div><div id="arenaOverlay" class="arena-overlay" hidden><strong>PROFUNDE SPIRU</strong><button onclick="resumeDodge()">Daŭrigu →</button></div></div><div class="dodge-progress"><i id="dodgeProgress"></i></div><div class="arena-hints"><span>WASD / ↑↓←→ · trenu por moviĝi</span><span id="shieldStatus">${b.shield?'◇ ŜILDO PRETA':'♥ EVITU LA TRAFOJN'}</span></div>`,'EVITU');
 $('box').classList.add('dodge-mode');
 const arena=$('dodgeArena');
 const setTarget=e=>{const rect=arena.getBoundingClientRect();b.pointer={x:Math.max(3,Math.min(97,(e.clientX-rect.left)/rect.width*100)),y:Math.max(5,Math.min(95,(e.clientY-rect.top)/rect.height*100))};};
 arena.addEventListener('pointerdown',e=>{if(b.phase!=='dodge'||b.paused||e.target.closest('button'))return;e.preventDefault();arena.setPointerCapture(e.pointerId);setTarget(e);});
 arena.addEventListener('pointermove',e=>{if(arena.hasPointerCapture(e.pointerId)&&!b.paused)setTarget(e);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])arena.addEventListener(event,()=>{b.pointer=null;});
 arena.focus();drawDodge();dodgeFrame=requestAnimationFrame(dodgeTick);
}
function spawnPattern(){
 const b=battle;if(b?.phase!=='dodge')return;
 const stage=b.stage,speed=b.tuning.speed+stage*(b.assist?1:2.5),n=b.patternCount++,style=b.attackStyle||({ink:'rain',moss:'roots',scribe:'letters'}[b.kind]),count=b.assist?5:8;
 const add=(x,y,vx,vy,glyph='◇',extra={})=>{if(b.bullets.length<160)b.bullets.push({x,y,vx,vy,glyph,age:0,rule:'avoid',...extra});};
 const fan=(x,y,aim,spread,total,glyph,extra={})=>{for(let i=0;i<total;i++){const angle=aim+(i-(total-1)/2)*spread;add(x,y,Math.cos(angle)*speed,Math.sin(angle)*speed/.56,glyph,extra);}};
 if(style==='rain'){
  const gap=(n+Math.floor(count/2))%count;
  for(let i=0;i<count;i++)if(i!==gap)add(5+i*90/(count-1),-7,stage===2?Math.sin(n*.7)*7:0,speed/.56,'♦');
  if(stage===2&&!b.assist&&n%3===0)fan(n%2?-7:107,25,n%2?0:Math.PI,.18,3,'·');
 }else if(style==='roots'){
  const lanes=b.assist?4:6,gap=(n*2+1)%lanes,left=n%2===0;
  for(let i=0;i<lanes;i++)if(i!==gap)add(left?-7:107,8+i*84/(lanes-1),left?speed:-speed,stage===2?Math.sin(n)*8:0,'✦');
 }else if(style==='letters'){
  const x=15+(n*29)%70,y=stage===2&&n%3===0?107:-7;
  const aim=Math.atan2((b.heart.y-y)*.56,b.heart.x-x);
  fan(x,y,aim,b.assist?.28:.22,b.assist?3:stage===2?7:5,['a','o','i'][n%3]);
 }else if(style==='chimes'){
  const fromBelow=stage===2&&n%2===1,gap=(n+2)%count;
  for(let i=0;i<count;i++)if(i!==gap)add(5+i*90/(count-1),fromBelow?107:-7,0,(fromBelow?-1:1)*speed/.56,'♢',{sway:stage===0?9:15,offset:i*.8});
 }else if(style==='threads'){
  const left=n%2===0,lanes=b.assist?4:6,gap=n%lanes;
  for(let i=0;i<lanes;i++)if(i!==gap)add(left?-7:107,5+i*18,left?speed:-speed,(n%3-1)*speed*.65,'×');
  if(stage===2&&!b.assist&&n%2===0)fan(50,-7,Math.PI/2,.45,3,'×');
 }else{
  const below=stage===2&&n%3===0,x=50+Math.sin(n*.8)*25,aim=below?-Math.PI/2:Math.PI/2;
  fan(x,below?107:-7,aim,.3,b.assist?3:5,'✧',{curve:(n%2?1:-1)*(stage===0?.22:.38)});
 }
}
function spawnHazard(){
 const b=battle;if(b?.phase!=='dodge'||b.hazards.length>=2)return;
 const style=b.attackStyle||b.kind,axis=['roots','moss'].includes(style)?'y':['rain','ink'].includes(style)?'x':b.hazardCount%2?'y':'x';
 const rule=b.stage===0?'avoid':b.hazardCount%2?'still':'move';b.hazardCount++;
 b.hazards.push({axis,at:Math.max(12,Math.min(88,b.heart[axis])),width:b.assist?10:12+b.stage*2,warning:b.tuning.warning,active:b.assist?.45:.65,age:0,rule});
 $('dodgeStatus').textContent=rule==='still'?'Blua strio: haltu interne aŭ eliru antaŭ la ekbrilo.':rule==='move'?'Oranĝa strio: moviĝu dum la ekbrilo aŭ eliru.':'Blanka strio: foriru antaŭ la ekbrilo!';
}
function attackHurts(rule,moving){return rule==='still'?moving:rule==='move'?!moving:true;}
function hurtHeart(){
 const b=battle;if(b?.phase!=='dodge'||b.invulnerable>0)return;
 b.invulnerable=b.assist?1.2:.95;b.hits++;
 if(b.shield){b.shield=0;$('dodgeStatus').textContent='Via vortŝildo sorbis la trafon.';}
 else{const damage=b.assist?1:Math.max(1,Math.min(5,1+Math.ceil(S.floor/2))-S.def);S.hp=Math.max(0,S.hp-damage);$('dodgeStatus').textContent=`Trafo · −${damage} vivo. Daŭrigu!`;}
 render();if(S.hp===0)finish(false);
}
// Simulation uses seconds and bounded steps so refresh rate cannot change difficulty.
function updateDodge(dt){
 if(!Number.isFinite(dt)||dt<=0)return;
 let remaining=Math.min(dt,0.25);
 while(remaining>0&&battle?.phase==='dodge'&&!battle.paused){const step=Math.min(remaining,0.02);stepDodge(step);remaining-=step;}
}
function stepDodge(dt){
 const b=battle;if(!b||b.phase!=='dodge'||b.paused)return;dt=Math.min(Math.max(dt,0),0.04);b.elapsed+=dt;b.invulnerable=Math.max(0,b.invulnerable-dt);
 if(b.elapsed>=b.duration)return endDodge();
 const stage=Math.min(2,Math.floor(b.elapsed/b.duration*3));
 if(stage!==b.stage){
  b.stage=stage;b.bullets=[];b.hazards=[];b.spawnClock=.5;b.hazardClock=1.15;
  $('dodgeStatus').textContent=stage===1?'La ritmo ŝanĝiĝas. Legu la kolorojn!':'La lasta ondo. Atentu ambaŭ flankojn!';
 }
 const oldX=b.heart.x,oldY=b.heart.y;
 let dx=(dodgeKeys.has('d')||dodgeKeys.has('arrowright')?1:0)-(dodgeKeys.has('a')||dodgeKeys.has('arrowleft')?1:0);
 let dy=(dodgeKeys.has('s')||dodgeKeys.has('arrowdown')?1:0)-(dodgeKeys.has('w')||dodgeKeys.has('arrowup')?1:0);
 if(b.pointer){dx=b.pointer.x-b.heart.x;dy=(b.pointer.y-b.heart.y)*.56;}
 const distance=Math.hypot(dx,dy);if(distance){const step=b.pointer?Math.min(distance,dt*58):dt*58;b.heart.x+=dx/distance*step;b.heart.y+=dy/distance*step/.56;}
 b.heart.x=Math.max(3,Math.min(97,b.heart.x));b.heart.y=Math.max(5,Math.min(95,b.heart.y));
 b.moving=Math.hypot(b.heart.x-oldX,(b.heart.y-oldY)*.56)>dt*3;
 b.spawnClock-=dt;if(b.spawnClock<=0){spawnPattern();b.spawnClock=Math.max(.48,b.tuning.interval-b.stage*(b.assist?.025:.065));}
 b.hazardClock-=dt;if(b.hazardClock<=0){spawnHazard();b.hazardClock=b.assist?3.6:3.2-b.stage*.35;}
 for(const p of b.bullets){
  p.age=(p.age||0)+dt;
  if(p.curve){const angle=p.curve*dt,vx=p.vx,vy=p.vy*.56;p.vx=vx*Math.cos(angle)-vy*Math.sin(angle);p.vy=(vx*Math.sin(angle)+vy*Math.cos(angle))/.56;}
  p.x+=(p.vx+(p.sway?Math.sin(p.age*4+(p.offset||0))*p.sway:0))*dt;p.y+=p.vy*dt;
  if(Math.hypot(p.x-b.heart.x,(p.y-b.heart.y)*.56)<3.2&&attackHurts(p.rule,b.moving))hurtHeart();
  if(battle!==b||S.over)return;
 }
 for(const h of b.hazards){
  h.age+=dt;const margin=h.axis==='x'?2.5:4.5;
  if(h.age>=h.warning&&h.age<h.warning+h.active&&Math.abs(b.heart[h.axis]-h.at)<h.width/2+margin&&attackHurts(h.rule,b.moving))hurtHeart();
  if(battle!==b||S.over)return;
 }
 b.hazards=b.hazards.filter(h=>h.age<h.warning+h.active);
 b.bullets=b.bullets.filter(p=>p.x>-12&&p.x<112&&p.y>-15&&p.y<115);
}
function drawDodge(){
 const b=battle;if(!b||b.phase!=='dodge')return;
 $('soul').style.left=`${b.heart.x}%`;$('soul').style.top=`${b.heart.y}%`;$('soul').className=`soul-heart${b.shield?' shielded':''}${b.invulnerable>0?' invulnerable':''}`;
 $('waveLabel').textContent=`ONDO ${b.stage+1} / 3 · ${['TROVU LA RITMON','LEGU LA KOLOROJN','LA LASTA PUŜO'][b.stage]}`;
 $('bulletLayer').innerHTML=b.bullets.map(p=>`<span class="projectile ${b.kind} rule-${p.rule||'avoid'}" style="left:${p.x}%;top:${p.y}%">${p.glyph}</span>`).join('');
 $('hazardLayer').innerHTML=b.hazards.map(h=>`<div class="hazard-lane rule-${h.rule} ${h.age<h.warning?'warning':'active'} ${h.axis==='x'?'vertical':'horizontal'}" style="${h.axis==='x'?`left:${h.at-h.width/2}%;width:${h.width}%`:`top:${h.at-h.width/2}%;height:${h.width}%`}"><span>${h.age<h.warning?'! ':''}${h.rule==='still'?'Ⅱ HALTU':h.rule==='move'?'» MOVIĜU':'◇ EVITU'}</span></div>`).join('');
 $('dodgeProgress').style.width=`${Math.max(0,1-b.elapsed/b.duration)*100}%`;$('battleHP').textContent=`${S.hp}/${S.max}`;$('shieldStatus').textContent=b.shield?'◇ ŜILDO PRETA':`${Math.ceil(b.duration-b.elapsed)}s RESTAS`;
}
function dodgeTick(now){dodgeFrame=0;if(!battle||battle.phase!=='dodge'||battle.paused)return;if(dodgeLast)updateDodge((now-dodgeLast)/1000);dodgeLast=now;if(battle?.phase==='dodge'&&!battle.paused){drawDodge();dodgeFrame=requestAnimationFrame(dodgeTick);}}
function pauseDodge(){if(battle?.phase!=='dodge'||battle.paused)return;battle.paused=true;stopDodge();$('arenaOverlay').hidden=false;$('pauseButton').disabled=true;$('arenaOverlay').querySelector('button').focus();}
function resumeDodge(){if(battle?.phase!=='dodge'||!battle.paused)return;battle.paused=false;$('arenaOverlay').hidden=true;$('pauseButton').disabled=false;$('dodgeArena').focus();dodgeLast=0;dodgeFrame=requestAnimationFrame(dodgeTick);}
function endDodge(){if(battle?.phase!=='dodge')return;stopDodge();battle.turn++;drawBattle();}
function nextQuestion(){if(battle?.phase==='feedback')startDodge();}
function resolveBattle(mercy){if(!battle||(mercy&&(battle.peace<2||battle.phase!=='menu'))||(!mercy&&battle.hp>0))return;stopDodge();const name=battle.name,source=battle.source;S.gold+=8;S[mercy?'mercy':'kills']++;
 if(source.kind==='roamer')S.monsters=S.monsters.filter(m=>m.id!==source.id);else{S.g[source.y][source.x]='.';delete S.enemies[`${source.x},${source.y}`];}
 battle=null;S.roamGrace=WORLD_GRACE_TICKS;guide(`${mercy?'Vi indulgis':'Vi venkis'} la estaĵon ${name}. +8 ormoneroj. Ĝiaj vortoj restas en via kajero.`);showDialog(mercy?'Neatendita amiko':'La vojo estas libera',`<div class="note">${mercy?'“Dankon, amiko. Mi memoros vian bonkorecon.”':'La disaj literoj trankviliĝas. Vojo malfermiĝas.'}</div><p>+8 ormoneroj · Novaj vortoj konservitaj en via kajero.</p><button class="primary" onclick="closeModal()">Daŭrigu esplori →</button>`);hear();render();}
function flee(){if(battle?.phase!=='menu')return;stopDodge();Object.assign(battle.profile,{hp:battle.hp,peace:battle.peace});S.hp=Math.max(0,S.hp-1);battle=null;S.x=1;S.y=1;S.roamGrace=WORLD_GRACE_TICKS;if(!S.hp)return finish(false);closeModal();guide('Vi retiriĝas al la enirejo kaj perdas 1 vivpoenton. La estaĵo memoras vin. Vi havas momenton por trovi ŝirmejon.');hear();render();}
function finish(){if(typeof stopStory==='function')stopStory();stopWorld();stopDodge();battle=null;S.over=true;recordDepth();guide('Via torĉo estingiĝas. La vortoj, kiujn vi lernis, restas viaj.');render();showDialog('La lumo silentiĝas',`<p>Via ekspedicio finiĝas sur etaĝo ${S.floor}. La haloj estos malsamaj venontfoje.</p><div class="note">Plej profunda etaĝo: ${S.floor}<br>Persona rekordo: ${bestFloor}<br>${Object.keys(S.notebook).length} vortoj malkovritaj · ${S.gold} ormoneroj<br>${S.mercy} estaĵoj indulgitaj</div><p>${scoreSaved?'Via rekordo estas konservita en ĉi tiu retumilo.':'Retumila konservado ne disponeblas; via rekordo restas dum ĉi tiu sesio.'}</p><button class="primary" onclick="newRun()">Komencu novan ekspedicion →</button>`);}
function showNotebook(){if(battle||S.over)return;showDialog('La kajero de la vortgardanto',`<p>Ĉiu vorto renkontita dum batalo estas konservita ĉi tie, ankaŭ post eraro.</p>${Object.entries(S.notebook).map(([eo,en])=>`<div class="word-row"><b lang="eo">${escapeHTML(eo)}</b><span lang="en">${escapeHTML(en)}</span></div>`).join('')||'<div class="note">Malplena paĝo estas komenco. Renkontu estaĵon por lerni vian unuan vorton.</div>'}<div class="actions"><button onclick="closeModal()">Reiru al la submondo</button></div>`);}
function showLore(){if(battle||S.over)return;showDialog('Fragmentoj de la submondo',S.lore.map(x=>`<div class="note">${escapeHTML(x)}</div>`).join('')+'<p>Sekvu la susuradon de paĝoj. Ĉiu etaĝo tenas memoron; viaj lastaj 100 fragmentoj restas ĉi tie.</p><button onclick="closeModal()">Reiru al la submondo</button>');}
function help(){if(battle||S.over)return;showDialog('Gvidilo tra la mallumo','<p>Moviĝu po unu kahelo per <b>WASD</b>, sagoj aŭ la direktobutonoj. Premu <b>.</b> aŭ la mezan butonon por denove aŭskulti. Vagantaj estaĵoj moviĝas ĉiun <b>0,7 sekundon</b>, eĉ kiam vi staras senmove. Ili sekvas vin se ili vidas vin je distanco de ĝis sep kaheloj. Kaŝu vin malantaŭ muro: ili serĉos ĉe via lasta konata loko antaŭ ol denove vagi. La haloj paŭzas dum dialogoj, bataloj kaj kiam la ludo ne estas aktiva.</p><p>Nekonataj renkontoj ĉiuj portas la signon <b>?</b>. Vizitu amikon por konstante marki ĝin per <b>☻</b> sur tiu etaĝo. Videblaj monstroj montras <b>♟</b> ene de du kaheloj; poste vi rekonas ilin dum ili restas videblaj. “Kion vi aŭdas” montras direktojn kaj distancojn laŭ la koridoroj. Grumblo aŭ paŝoj povas signifi danĝeron. Voĉoj, sonoriloj, moneroj, knaranta ligno, paĝoj, latuno kaj aerblovoj rakontas diversajn historiojn. Nekonatoj malaperas en la nebulo; la mapo restas en via memoro.</p><p>Trovu ŝlosilon kaj ŝtuparon sur ĉiu etaĝo. Ne ekzistas lasta etaĝo. Via <b>plej profunda atingita etaĝo</b> estas konservita en ĉi tiu retumilo, eĉ post nova ekspedicio.</p><p>Elektu <b>BATALU</b> por ataki per ĝusta vortrespondo, aŭ <b>PAROLU</b> por gajni fidon. Elektu la anglan signifon de la montrita Esperanta vorto. Poste evitu <b>tri ondojn dum 12 sekundoj</b> post ĝusta respondo, aŭ <b>15 sekundojn</b> post eraro; pli profundaj etaĝoj kaj postaj vicoj aldonas premon. Blankaj atakoj ĉiam devas esti evititaj. Bluaj strioj postulas, ke vi haltu; oranĝaj strioj postulas, ke vi moviĝu. La avertaj strioj unue montras sin, do legu la regulon kaj ŝanĝu vian ritmon. Ĝusta respondo donas ŝildon kontraŭ unu trafo. Du fidpoentoj ebligas <b>INDULGU</b> post la evitado. Trankvila reĝimo daŭras 7 sekundojn kun pli malrapidaj atakoj. La klavo <b>Esc</b> paŭzigas. <b>UZU</b> sanigas vin kaj uzas vicon; retiriĝo kostas 1 vivpoenton.</p><p>Vojaĝantoj kaj vendejoj aperas en hazardaj lokoj. Renkontu novajn homojn, lernu vortojn, akceptu donacon kaj aĉetu provizojn per oro. Ĉiu vojaĝanto povas doni unu donacon. Amikoj restas markitaj en la memorata mapo. Monstroj malaperas en la nebulo; vi ne povas spuri ilin tra muroj.</p><button class="primary" onclick="closeModal()">Mi pretas →</button>');}
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
