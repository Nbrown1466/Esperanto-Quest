const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');

class Element {
  constructor(tag = 'div') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.style = { setProperty(name, value) { this[name] = value; } };
    this.dataset = {};
    this.attributes = {};
    this.className = '';
    this.textContent = '';
    this._html = '';
    this.listeners = {};
    this.classList = {
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/), ...names])].join(' ').trim(); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(n => !names.includes(n)).join(' '); },
      contains: name => this.className.split(/\s+/).includes(name),
      toggle: (name, force) => { const on = force ?? !this.classList.contains(name); this.classList[on ? 'add' : 'remove'](name); return on; },
    };
  }
  set innerHTML(value) { this._html = value; this.children = []; }
  get innerHTML() { return this._html; }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(name, handler) { (this.listeners[name] ||= []).push(handler); }
  querySelector() { return new Element(); }
  querySelectorAll() { return []; }
  focus() {}
  remove() {}
}

const elements = new Map();
const listeners = {};
const document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); },
  createElement: tag => new Element(tag),
  createDocumentFragment: () => new Element('fragment'),
  querySelector: selector => document.getElementById(selector.replace(/^#/, '')),
  querySelectorAll: () => [],
  addEventListener(name, handler) { (listeners[name] ||= []).push(handler); },
  body: new Element('body'),
};
const storage = new Map();
const timers = new Map();
let nextTimer = 1;
let simulationTime = 0;
const frames = new Map();
let nextFrame = 1;
const context = vm.createContext({
  console, document, Math, Set, Map, Date,
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,String(value)), removeItem: key => storage.delete(key) },
  setTimeout: (callback, delay) => { const id=nextTimer++; timers.set(id,{callback,delay,repeat:false}); return id; }, clearTimeout: id => timers.delete(id),
  setInterval: (callback, delay) => { const id=nextTimer++; timers.set(id,{callback,delay,repeat:true}); return id; }, clearInterval: id => timers.delete(id),
  performance: { now: () => simulationTime },
  requestAnimationFrame: callback => { const id = nextFrame++; frames.set(id, callback); return id; }, cancelAnimationFrame(id) { frames.delete(id); },
  matchMedia: () => ({ matches: false }),
  addEventListener(name, handler) { (listeners[name] ||= []).push(handler); },
});
context.window = context;
const gameDirectory = process.argv[2] || (fs.existsSync(path.join(__dirname, 'aventuro.js')) ? __dirname : path.join(__dirname, 'game'));
for (const file of ['n1.js', 'v1.js', 'aventuro.js', 'aventuro-story.js']) vm.runInContext(fs.readFileSync(path.join(gameDirectory, file), 'utf8'), context, { filename: file });
const run = source => vm.runInContext(source, context);
let checks = 0;
function test(name, body) { try { body(); checks++; console.log(`PASS ${name}`); } catch (error) { console.error(`FAIL ${name}: ${error.stack}`); process.exitCode = 1; } }

// Gameplay checks are appended after the implementation is available.
test('startup initializes a playable state and opening note', () => {
 assert.equal(run('S.hp'), 20); assert.equal(run('S.floor'), 1);
 assert.match(elements.get('box').innerHTML, /A note in your coat/);
 assert.equal(elements.get('map').children.length, 225);
});
test('200 generated dungeons have connected passages and all required objects', () => {
 const signatures=new Set();
 for(let i=0;i<200;i++) {
  const g=run('grid()'); signatures.add(g.map(row=>row.map(tile=>tile==='#'?'#':'.').join('')).join('')); const seen=new Set(['1,1']), queue=[[1,1]];
  for(let j=0;j<queue.length;j++) {const [x,y]=queue[j];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {const a=x+dx,b=y+dy,k=`${a},${b}`;if(g[b]?.[a]&&g[b][a]!=='#'&&!seen.has(k)){seen.add(k);queue.push([a,b]);}}}
  const counts={}; for(let y=0;y<15;y++)for(let x=0;x<15;x++){const tile=g[y][x];counts[tile]=(counts[tile]||0)+1;if(tile!=='#')assert.ok(seen.has(`${x},${y}`));if(!x||!y||x===14||y===14)assert.equal(tile,'#');}
  for(const tile of ['K','L','E','B'])assert.equal(counts[tile],1);assert.ok(counts.N>=2&&counts.N<=4);assert.equal(counts.M,3);assert.equal(counts.R,3);assert.equal(g[1][1],'.');
 }
 assert.ok(signatures.size>=20,`expected varied maps, got ${signatures.size}`);
});
test('modal blocks movement, waiting, and potion consumption', () => {
 run('S.hp=10');const before=run('JSON.stringify([S.x,S.y,S.hp,S.potions,S.log])');
 run('move(1,0);waitTurn();potion()');assert.equal(run('JSON.stringify([S.x,S.y,S.hp,S.potions,S.log])'),before);
 run('closeModal();S.g[1][2]=".";move(1,0)');assert.equal(run('S.x'),2);
});
test('gold, chest, key, and lore consume their tiles once', () => {
 run('newRun();closeModal();S.monsters=[];S.g[1][2]="G";move(1,0)');assert.ok(run('S.gold>=5&&S.gold<=12'));const gold=run('S.gold');run('move(-1,0);move(1,0)');assert.equal(run('S.gold'),gold);
 run('S.g[1][3]="T";move(1,0)');assert.equal(run('S.potions'),3);assert.equal(run('S.gold'),gold+5);
 run('S.g[2][3]="K";move(0,1)');assert.equal(run('S.keys'),1);assert.equal(run('S.g[2][3]'),'.');
 run('S.g[3][3]="L";move(0,1)');assert.equal(run('S.lore.length'),1);assert.ok(elements.get('modal').classList.contains('show'));run('closeModal()');
});
test('potions cap healing, report actual gain, and full-health use is free',()=>{
 run('S.hp=18;potion()');assert.equal(run('S.hp'),20);assert.equal(run('S.potions'),2);assert.match(run('S.log.at(-1)'),/2 health/);run('potion()');assert.equal(run('S.potions'),2);
});
test('stairs require a key and floor progression preserves inventory and notebook',()=>{
 run('newRun();closeModal();S.monsters=[];S.g[1][2]="E";move(1,0);descend()');assert.equal(run('S.floor'),1);
 run('S.keys=1;S.hp=10;S.notebook.amiko="friend";encounter("E");descend()');assert.equal(run('S.floor'),2);assert.equal(run('S.keys'),0);assert.equal(run('S.hp'),15);assert.equal(run('S.atk'),4);assert.equal(run('S.notebook.amiko'),'friend');assert.equal(run('S.x'),1);
});
function freshBattle() {run('newRun();closeModal();S.monsters=[];S.g[1][2]="M";move(1,0)');}
function correct(action='act') {run(`chooseAction('${action}');answer(battle.options.indexOf(battle.word.en))`);}
function collide() {run('battle.bullets=[{x:battle.heart.x,y:battle.heart.y,vx:0,vy:0,glyph:"•"}];updateDodge(0.01)');}
test('fight answers teach words and damage enemies only once',()=>{
 freshBattle();assert.equal(run('battle.phase'),'menu');run('chooseAction("fight")');assert.equal(run('battle.phase'),'question');
 assert.equal(run('new Set(battle.options).size'),4);assert.equal(run('battle.options.length'),4);
 run('answer(battle.options.indexOf(battle.word.en))');assert.equal(run('battle.hp'),5);assert.equal(run('battle.shield'),1);assert.equal(run('Object.keys(S.notebook).length'),1);
 run('answer(0)');assert.equal(run('battle.hp'),5);assert.equal(run('battle.phase'),'feedback');
 run('startDodge();endDodge()');correct('fight');assert.equal(run('battle'),null);assert.equal(run('S.kills'),1);assert.equal(run('S.gold'),8);
});
test('two ACT turns build trust without damage and mercy requires finishing dodge',()=>{
 freshBattle();correct();assert.equal(run('battle.hp'),10);assert.equal(run('battle.peace'),1);run('startDodge();endDodge()');correct();
 assert.equal(run('battle.peace'),2);run('resolveBattle(true)');assert.notEqual(run('battle'),null);run('startDodge();endDodge();resolveBattle(true)');
 assert.equal(run('battle'),null);assert.equal(run('S.mercy'),1);assert.equal(run('S.gold'),8);assert.equal(run('S.g[1][2]'),'.');
});
test('wrong answer teaches without instant damage and creates a longer dodge',()=>{
 freshBattle();run('chooseAction("fight");answer(battle.options.findIndex(x=>x!==battle.word.en))');assert.equal(run('S.hp'),20);assert.equal(run('battle.hp'),10);assert.equal(run('battle.shield'),0);assert.equal(run('Object.keys(S.notebook).length'),1);run('startDodge()');assert.equal(run('battle.duration'),11);
});
test('shield absorbs a hit and invulnerability prevents consecutive-frame damage',()=>{
 freshBattle();correct();run('startDodge()');collide();assert.equal(run('S.hp'),20);assert.equal(run('battle.shield'),0);collide();assert.equal(run('S.hp'),20);
 run('battle.invulnerable=0');collide();assert.equal(run('S.hp'),18);
});
test('dodge movement clamps the heart and never moves the dungeon player',()=>{
 freshBattle();correct();run('startDodge();dodgeKeys.add("d");for(let i=0;i<50;i++)updateDodge(.04)');assert.equal(run('battle.heart.x'),97);assert.equal(run('S.x'),2);assert.equal(run('S.y'),1);
});
test('pause freezes simulation and resume schedules only one frame',()=>{
 run('pauseDodge()');assert.equal(frames.size,0);const before=run('battle.elapsed');run('updateDodge(.04)');assert.equal(run('battle.elapsed'),before);assert.equal(run('dodgeKeys.size'),0);run('resumeDodge();resumeDodge()');assert.equal(frames.size,1);run('updateDodge(.04)');assert.ok(run('battle.elapsed')>before);
});
test('all enemy patterns spawn projectiles and complete a turn',()=>{
 for(const kind of ['ink','moss','scribe']){freshBattle();correct();run(`battle.kind='${kind}';startDodge();spawnPattern()`);assert.ok(run('battle.bullets.length')>=3);run('battle.elapsed=battle.duration-.01;updateDodge(.02)');assert.equal(run('battle.phase'),'menu');assert.equal(run('battle.turn'),2);assert.equal(frames.size,0);}
});
test('gentle mode shortens dodge and reduces collision damage',()=>{
 freshBattle();run('toggleAssist()');correct();run('startDodge();battle.shield=0');assert.equal(run('battle.duration'),7);collide();assert.equal(run('S.hp'),19);
});
test('battle potion uses inventory and enters an enemy turn',()=>{
 freshBattle();run('S.hp=18;battlePotion()');assert.equal(run('S.hp'),20);assert.equal(run('S.potions'),1);assert.equal(run('battle.phase'),'feedback');run('battlePotion()');assert.equal(run('S.potions'),1);run('startDodge()');assert.equal(run('battle.shield'),0);
});
test('lethal arena hit ends combat and cancels animation',()=>{
 freshBattle();correct();run('startDodge();S.hp=1;battle.shield=0');collide();assert.equal(run('S.hp'),0);assert.equal(run('S.over'),true);assert.equal(run('battle'),null);assert.equal(frames.size,0);run('closeModal();move(-1,0)');assert.equal(run('S.x'),2);assert.ok(elements.get('modal').classList.contains('show'));run('newRun()');assert.equal(run('S.hp'),20);assert.equal(run('S.over'),false);
});
test('restart cancels an active arena and clears movement input',()=>{
 freshBattle();correct();run('startDodge();dodgeKeys.add("d");newRun()');assert.equal(frames.size,0);assert.equal(run('battle'),null);assert.equal(run('dodgeKeys.size'),0);run('updateDodge(.04)');assert.equal(run('S.hp'),20);
});
test('retreat preserves creature and applies damage',()=>{
 run('closeModal();S.g[1][2]="M";move(1,0);flee()');assert.equal(run('S.hp'),19);assert.equal(run('S.x'),1);assert.equal(run('S.g[1][2]'),'M');assert.equal(run('battle'),null);
});
test('endless descent passes floors five and fifty and preserves the best across restart',()=>{
 run('newRun();closeModal();S.monsters=[];S.floor=5;S.keys=1;S.g[S.y][S.x]="E";descend()');assert.equal(run('S.floor'),6);assert.equal(run('S.over'),false);
 run('S.floor=50;S.keys=1;S.g[S.y][S.x]="E";descend()');assert.equal(run('S.floor'),51);assert.equal(run('S.over'),false);assert.equal(run('bestFloor'),51);
 assert.equal(storage.get(run('BEST_FLOOR_KEY')),'51');run('newRun()');assert.equal(run('S.floor'),1);assert.equal(run('bestFloor'),51);assert.equal(storage.get(run('BEST_FLOOR_KEY')),'51');
});
test('keyboard repeats cannot move multiple tiles until released',()=>{
 run('closeModal();S.monsters=[];S.g[1][2]=".";S.g[1][3]="."');const fire=(type,key,repeat=false)=>listeners[type].forEach(f=>f({key,repeat,preventDefault(){},target:document.body}));
 fire('keydown','d');assert.equal(run('S.x'),2);fire('keydown','d',true);fire('keydown','d');assert.equal(run('S.x'),2);fire('keyup','d');fire('keydown','d');assert.equal(run('S.x'),3);
});
test('new-run menu cannot hide an active battle',()=>{
 run('newRun();closeModal();S.monsters=[];S.g[1][2]="M";move(1,0)');const before=elements.get('box').innerHTML;run('requestNewRun()');assert.equal(elements.get('box').innerHTML,before);
});
test('dodge substeps produce the same state for 100 ms or five 20 ms frames',()=>{
 const setup=()=>{freshBattle();correct();run('startDodge();battle.spawnClock=100;battle.bullets=[{x:10,y:10,vx:4,vy:8,glyph:"a"}];dodgeKeys.add("d")');};
 setup();run('updateDodge(.1)');const single=JSON.parse(run('JSON.stringify({elapsed:battle.elapsed,heart:battle.heart,bullets:battle.bullets})'));
 setup();run('for(let i=0;i<5;i++)updateDodge(.02)');const split=JSON.parse(run('JSON.stringify({elapsed:battle.elapsed,heart:battle.heart,bullets:battle.bullets})'));
 assert.ok(Math.abs(single.elapsed-split.elapsed)<1e-12);assert.ok(Math.abs(single.heart.x-split.heart.x)<1e-12);assert.ok(Math.abs(single.bullets[0].y-split.bullets[0].y)<1e-12);
});
test('NPC conversation reveals choices, teaches a word, and limits gifts',()=>{
 run('newRun();closeModal();S.monsters=[];S.g[1][2]="N";move(1,0)');assert.equal(run('storySession.kind'),'npc');const word=run('storySession.person.word'),meaning=run('storySession.person.meaning');run('storyReveal();storyChoose(0)');assert.equal(run('S.notebook')[word],meaning);
 run('storyReveal();storyBack();storyReveal();storyChoose(2);storyReveal();storyChoose(1)');assert.equal(run('S.potions'),3);assert.equal(run('S.notebook.dankon'),'thank you');run('claimStoryGift("potion")');assert.equal(run('S.potions'),3);run('closeStory()');assert.equal(run('storySession'),null);assert.equal(elements.get('modal').classList.contains('show'),false);
});
test('shop spending checks affordability and caps defense',()=>{
 run('newRun();closeModal();S.monsters=[];S.g[2][1]="B";move(0,1)');assert.equal(run('storySession.kind'),'shop');run('buyStoryItem("potion")');assert.equal(run('S.potions'),2);
 run('S.gold=100;buyStoryItem("potion");buyStoryItem("attack");buyStoryItem("defense");buyStoryItem("defense");buyStoryItem("defense")');assert.equal(run('S.gold'),18);assert.equal(run('S.potions'),3);assert.equal(run('S.atk'),4);assert.equal(run('S.def'),3);run('buyStoryItem("defense")');assert.equal(run('S.gold'),18);run('closeStory();buyStoryItem("potion")');assert.equal(run('S.gold'),18);
});
function emptyFloor(){run('newRun();closeModal();S.monsters=[];S.roamGrace=0;S.turn=0;S.g=Array.from({length:H},()=>Array(W).fill("#"));S.x=1;S.y=1;S.g[1][1]=".";S.seen={}');}
function carve(points){context.testPoints=points;run('for(const [x,y] of testPoints)S.g[y][x]="."');}
function addRoamer(id,x,y){context.testMonster={id,x,y};run('S.monsters.push({...testMonster,profile:generateEnemy(),target:null})');}
test('loaded floors convert roaming spawn markers to separate entities',()=>{
 run('newRun()');assert.equal(run('S.monsters.length'),3);assert.equal(run('S.g.flat().includes("R")'),false);assert.equal(run('new Set(S.monsters.map(m=>m.id)).size'),3);assert.equal(run('S.monsters.every(m=>S.g[m.y][m.x]===".")'),true);
});
test('unvisited encounters and distant monsters share a generic appearance',()=>{
 emptyFloor();carve([[2,1],[3,1],[4,1]]);const appearances=[];
 for(const tile of ['M','N','B','T','G','K','L','E']){run(`S.g[1][4]='${tile}';render()`);const cell=elements.get('map').children[19];appearances.push([cell.textContent,cell.title,cell.className]);}
 run('S.g[1][4]="."');addRoamer('r',4,1);run('render()');const cell=elements.get('map').children[19];appearances.push([cell.textContent,cell.title,cell.className]);
 for(const appearance of appearances)assert.deepEqual(appearance,['?','Unknown presence','cell floor mystery']);
});
test('idle scheduled ticks move visible creatures and trigger battle without a player turn',()=>{
 emptyFloor();carve([[1,1],[2,1],[3,1],[4,1]]);addRoamer('a',4,1);
 const tick=()=>{const id=run('worldTimer'),timer=timers.get(id);assert.ok(timer,'world timer is scheduled');assert.equal(timer.delay,run('WORLD_STEP_MS'));timers.delete(id);simulationTime+=timer.delay;timer.callback();};
 tick();assert.equal(run('S.monsters[0].x'),3);assert.equal(run('S.x'),1);assert.equal(run('S.y'),1);tick();assert.equal(run('S.monsters[0].x'),2);tick();assert.equal(run('battle.source.id'),'a');assert.equal(run('worldTimer'),0);
});
test('wall-blocked creatures cannot acquire hidden players',()=>{
 emptyFloor();carve([[1,1],[1,2],[2,2],[3,2],[3,1]]);addRoamer('a',3,1);run('S.monsters[0].target=[3,2]');assert.equal(run('canSee(3,1,1,1,8)'),false);run('worldTick()');assert.equal(run('S.monsters[0].lastSeen ?? null'),null);
});
test('after losing sight creatures pursue the last seen position rather than hidden movement',()=>{
 emptyFloor();carve([[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[4,2],[1,3],[2,3],[3,3],[4,3]]);addRoamer('a',4,1);run('worldTick()');assert.equal(run('JSON.stringify(S.monsters[0].lastSeen)'),'[1,1]');
 run('S.x=1;S.y=3;S.g[2][2]="#";S.g[2][3]="#";worldTick()');assert.equal(run('JSON.stringify(S.monsters[0].lastSeen)'),'[1,1]');assert.equal(run('S.monsters[0].x'),2);assert.equal(run('S.monsters[0].y'),1);
});
test('invalid movement does not advance creatures; dialogs, battles and death freeze AI',()=>{
 emptyFloor();carve([[2,1],[3,1]]);addRoamer('a',3,1);run('move(0,-1)');assert.equal(run('S.turn'),0);run('help()');const before=run('JSON.stringify(S.monsters)');run('waitTurn();advanceWorld();move(1,0)');assert.equal(run('S.turn'),0);assert.equal(run('JSON.stringify(S.monsters)'),before);
 run('closeModal();startBattle(S.monsters[0]);advanceWorld()');assert.equal(run('S.turn'),0);run('finish(false);advanceWorld()');assert.equal(run('S.turn'),0);
});
test('creatures avoid special tiles and never occupy the same tile',()=>{
 emptyFloor();carve([[1,1],[2,1],[3,1],[1,2],[2,2],[3,2],[1,3],[2,3],[3,3],[4,3]]);run('S.g[2][2]="K";S.g[3][2]="N";S.x=4;S.y=3');addRoamer('a',1,1);addRoamer('b',1,2);
 for(let i=0;i<20;i++){run('worldTick()');assert.equal(run('S.g[2][2]'),'K');assert.equal(run('S.g[3][2]'),'N');assert.equal(run('S.monsters.every(m=>S.g[m.y][m.x]===".")'),true);assert.equal(run('new Set(S.monsters.map(m=>`${m.x},${m.y}`)).size'),2);if(run('!!battle'))break;}
});
test('resolving a roaming battle removes only that entity; static tiles remain',()=>{
 emptyFloor();carve([[2,1],[3,1]]);run('S.g[1][3]="M"');addRoamer('target',2,1);addRoamer('other',1,1);run('move(1,0);battle.hp=0;resolveBattle(false)');assert.equal(run('S.monsters.length'),1);assert.equal(run('S.monsters[0].id'),'other');assert.equal(run('S.g[1][3]'),'M');assert.equal(run('S.g[1][2]'),'.');
 run('closeModal();move(1,0);battle.hp=0;resolveBattle(false)');assert.equal(run('S.monsters.length'),1);assert.equal(run('S.g[1][3]'),'.');
});
test('fleeing preserves a creature identity and its battle progress',()=>{
 emptyFloor();carve([[2,1]]);addRoamer('a',2,1);run('move(1,0)');const name=run('battle.name');run('battle.hp=3;battle.peace=1;flee();move(1,0)');assert.equal(run('battle.name'),name);assert.equal(run('battle.hp'),3);assert.equal(run('battle.peace'),1);
});
test('heard clues follow corridor distance and closest three sources',()=>{
 emptyFloor();carve([[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2]]);run('S.g[1][2]="N";S.g[2][1]="B";S.g[1][3]="G";S.g[1][4]="E"');const sounds=run('nearbySounds()');assert.equal(sounds.length,3);assert.equal(sounds[0].distance,1);assert.equal(sounds[2].distance,2);assert.equal(sounds.some(s=>s.x===4),false);
 run('S.g[1][2]="#";S.g[2][2]="#";S.g[2][3]="#"');assert.equal(run('nearbySounds().some(s=>s.x>=3)'),false);
});
test('fog remembers terrain without revealing stale moving encounters',()=>{
 emptyFloor();carve([[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1]]);addRoamer('a',2,1);run('render();S.x=9;render()');const cell=elements.get('map').children[17];assert.equal(cell.textContent,'');assert.equal(cell.title,'Passage');assert.equal(cell.className,'cell floor seen');
});
test('one thousand floors initialize with valid entities, score and names',()=>{
 run('newRun();closeModal();for(let depth=1;depth<=1000;depth++){S.floor=depth;loadFloor();if(S.monsters.length!==3||!S.floorName||!S.g.flat().includes("E")||!S.g.flat().includes("K"))throw new Error("Invalid floor "+depth);}render()');assert.equal(run('S.floor'),1000);assert.equal(run('bestFloor'),1000);assert.equal(storage.get(run('BEST_FLOOR_KEY')),'1000');assert.match(String(elements.get('floor').textContent),/1000/);assert.doesNotMatch(String(elements.get('floorName').textContent),/undefined/);
 run('newRun()');assert.equal(run('bestFloor'),1000);
});
test('generated characters stay consistent on revisit and vary across floors',()=>{
 run('newRun();closeModal();S.monsters=[];S.g[1][2]="N";move(1,0)');const person=run('storySession.person');run('closeStory();openNPC()');assert.equal(run('storySession.person'),person);
 const archetypes=new Set(),names=new Set();for(let floor=1;floor<=50;floor++){context.testDepth=floor;run('closeStory();S.floor=testDepth;loadFloor();openNPC()');archetypes.add(run('storySession.person.archetype'));names.add(run('storySession.person.name'));assert.equal(run('storySession.person.floor'),floor);}
 assert.ok(archetypes.size>=4);assert.ok(names.size>=20);
});
test('player movement and waiting do not accelerate the real-time world',()=>{
 emptyFloor();carve([[2,1],[3,1],[4,1],[5,1]]);addRoamer('a',5,1);run('move(1,0);waitTurn();waitTurn()');assert.equal(run('S.monsters[0].x'),5);run('worldTick()');assert.equal(run('S.monsters[0].x'),4);
});
test('world timer is unique and cleans up across dialogs, floors, restart and death',()=>{
 run('newRun()');assert.equal(run('worldTimer'),0);run('closeModal()');const first=run('worldTimer');assert.ok(timers.has(first));run('startWorld();startWorld()');assert.equal(run('worldTimer'),first);
 run('help()');assert.equal(run('worldTimer'),0);assert.equal(timers.has(first),false);run('closeModal()');const second=run('worldTimer');run('loadFloor()');assert.equal(run('worldTimer'),0);assert.equal(timers.has(second),false);
 run('startWorld()');const third=run('worldTimer');run('newRun()');assert.equal(timers.has(third),false);assert.equal(run('worldTimer'),0);run('closeModal()');const fourth=run('worldTimer');run('finish()');assert.equal(run('worldTimer'),0);assert.equal(timers.has(fourth),false);
});
test('browser blur and visibility changes pause world movement and focus resumes it',()=>{
 emptyFloor();carve([[2,1],[3,1],[4,1]]);addRoamer('a',4,1);for(const fn of listeners.blur)fn({});assert.equal(run('worldTimer'),0);run('worldTick()');assert.equal(run('S.monsters[0].x'),4);for(const fn of listeners.focus)fn({});assert.ok(run('worldTimer'));
 document.hidden=true;for(const fn of listeners.visibilitychange)fn({});assert.equal(run('worldTimer'),0);run('worldTick()');assert.equal(run('S.monsters[0].x'),4);document.hidden=false;for(const fn of listeners.visibilitychange)fn({});assert.ok(run('worldTimer'));
});
test('a cancelled world callback cannot move a restarted expedition or duplicate timers',()=>{
 run('newRun();closeModal()');const oldCallback=timers.get(run('worldTimer')).callback;run('newRun();closeModal()');const active=run('worldTimer');const before=run('JSON.stringify([S.monsters,S.turn,S.roamGrace])');oldCallback();assert.equal(run('worldTimer'),active);assert.equal(run('JSON.stringify([S.monsters,S.turn,S.roamGrace])'),before);assert.ok(timers.has(active));
});
test('a fresh floor gives a short real-time grace period before pursuit',()=>{
 emptyFloor();carve([[2,1],[3,1],[4,1]]);addRoamer('a',4,1);run('S.roamGrace=3;worldTick();worldTick();worldTick()');assert.equal(run('S.monsters[0].x'),4);run('worldTick()');assert.equal(run('S.monsters[0].x'),3);
});
test('static and roaming monsters reveal at the two-tile boundary and retain recognition',()=>{
 for(const kind of ['static','roamer']){
  emptyFloor();carve([[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1]]);
  if(kind==='static')run('S.g[1][4]="M"');else addRoamer('a',4,1);
  run('render()');assert.equal(elements.get('map').children[19].textContent,'?');run('S.x=2;render()');assert.equal(elements.get('map').children[19].textContent,'♟');
  run('S.x=1;render()');assert.equal(elements.get('map').children[19].textContent,'♟');run('S.x=9;render()');assert.equal(elements.get('map').children[19].textContent,'');
  run('S.x=1;render()');assert.equal(elements.get('map').children[19].textContent,'♟');
 }
});
test('diagonal monster reveals use two-tile Chebyshev distance and require sight',()=>{
 emptyFloor();const points=[];for(let y=1;y<=4;y++)for(let x=1;x<=4;x++)points.push([x,y]);carve(points);run('S.g[3][3]="M";render()');assert.equal(elements.get('map').children[48].textContent,'♟');
 emptyFloor();carve([[2,1],[3,1],[1,2],[3,2],[1,3],[2,3],[3,3]]);run('S.g[3][3]="M";render()');assert.equal(run('S.revealedMonsters["3,3"] ?? false'),false);
});
test('roaming recognition follows the entity after it moves and leaves no stale marker',()=>{
 emptyFloor();carve([[2,1],[3,1],[4,1],[5,1]]);addRoamer('a',3,1);run('render()');assert.equal(elements.get('map').children[18].textContent,'♟');run('S.monsters[0].x=4;render()');assert.equal(elements.get('map').children[18].textContent,'');assert.equal(elements.get('map').children[19].textContent,'♟');
});
test('visited friends remain recognizable during backtracking and in explored fog',()=>{
 emptyFloor();carve([[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1]]);run('S.g[1][2]="N";render()');assert.equal(elements.get('map').children[17].textContent,'?');
 run('move(1,0);closeStory();move(-1,0)');assert.equal(elements.get('map').children[17].textContent,'☻');run('S.x=9;render()');assert.equal(elements.get('map').children[17].textContent,'☻');assert.match(elements.get('map').children[17].className,/seen/);
});
test('floor changes reset remembered friend and monster discoveries',()=>{
 run('S.revealedFriends["2,1"]=true;S.revealedMonsters["3,1"]=true;loadFloor()');assert.equal(run('Object.keys(S.revealedFriends).length'),0);assert.equal(run('Object.keys(S.revealedMonsters).length'),0);assert.equal(run('S.monsters.some(m=>m.revealed)'),false);
});
console.log(`${checks} regression checks passed.`);
