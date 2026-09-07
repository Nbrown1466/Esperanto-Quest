'use strict';
// Each encounter keeps its identity on its tile, with a fresh cast next floor.
let storySession = null;
let storyTimer = 0;
const storyPeople = {
 moth: {role:'MOTH POSTMASTER',art:'moth',icon:'✉',place:'THE UNDELIVERED POST',
  greetings:['A traveler with pockets! Excellent. I have been delivering letters to the walls. Reliable recipients. Terrible conversationalists.','Please stand still. I need to establish whether you are a person or an unusually mobile mailbox.'],
  lessons:[['amiko','friend','A good word to carry into a room with someone frightening. They might be frightened, too.'],['letero','letter','A letter is a conversation brave enough to travel alone.'],['flugilo','wing','Two wings carry a moth. One kind word can carry a traveler.']],
  lore:'These halls were an archive. I still deliver the letters. Even a place that keeps changing deserves its post.',wish:'A letter addressed to me. Nothing grand. Just my name, and somebody asking how I am.',reply:'I would answer on my best paper. The one that has only been slightly eaten.',
  offer:'An undelivered care package! It says “For whoever needs it.” A remarkably efficient address.',cups:['honey tea','a warm nectar cup'],parcels:['a ribbon-tied care parcel','an undelivered tonic']},
 kettle: {role:'KEEPER OF THE LITTLE KETTLE',art:'kettle',icon:'♨',place:'THE STEAMING NOOK',
  greetings:['Sit, if you like. The kettle has told the same story for forty years. I am trying to be a good listener.','Do you take your tea with sugar, honey, or a brief but sincere silence? I have all three.'],
  lessons:[['kuraĝo','courage','It means being afraid, and putting the kettle on anyway.'],['varma','warm','A warm welcome is a kind of shelter you can carry.'],['trinki','to drink','Even an enormous adventure needs a small drink now and then.']],
  lore:'Every conversation warms this place a little. When the corridors shift, I follow the steam to find my kettle again.',wish:'A window. A small one. I would like to hear what rain sounds like when it is outside.',reply:'Until then, I let the kettle whistle. It sounds a little like weather if you believe in it.',
  offer:'A difficult journey calls for something warm now, or something useful in your pocket.',cups:['spiced tea','a cup of cloud broth'],parcels:['a bottled kettle tonic','a tiny flask of comfort']},
 mushroom: {role:'GARDENER OF LOST THINGS',art:'mushroom',icon:'❀',place:'THE POCKET GARDEN',
  greetings:['Mind the seedlings. The little one on the left is a misplaced Tuesday. It needs shade.','You smell like outside! Or perhaps that is your backpack. Either way, please tell my flowers.'],
  lessons:[['floro','flower','A flower does not need to know where the ceiling ends to reach upward.'],['kreski','to grow','Growing can be so quiet that only your friends notice.'],['verda','green','The smallest green shoot still changes the color of a room.']],
  lore:'I plant whatever travelers lose. Buttons grow into button bushes. Hope grows slowly, but it survives almost anything.',wish:'A real sunrise for my garden. The mushrooms pretend they do not care. I know they do.',reply:'You can visit again if the halls bring us together. I will keep a patch of soil for your stories.',
  offer:'The garden made more than I need today. Pick something before the flowers become smug about it.',cups:['mushroom broth','a cup of petal tea'],parcels:['a leaf-wrapped tonic','a dew-filled potion']},
 clock: {role:'APPRENTICE TO TOMORROW',art:'clock',icon:'⌚',place:'THE PAUSE BETWEEN TICKS',
  greetings:['You are precisely on time. I have not decided what time it is, so that was exceptionally considerate.','Tick. Tock. Sorry, that was me. The clock is taking a well-earned break.'],
  lessons:[['tempo','time','You do not have to fill every moment to make it count.'],['atendi','to wait','Waiting is easier when somebody waits beside you.'],['hodiaŭ','today','Today is the only day that is always right here.']],
  lore:'The corridors rearrange when nobody is watching. I keep a timetable of the changes. It is mostly crossed-out guesses.',wish:'One entire minute in which nobody feels late.',reply:'We might just have made one. Do not check your watch. That would frighten it away.',
  offer:'My lunch break has lasted three years. Please help me finish these supplies.',cups:['slow-steeped tea','a minute of warm cocoa'],parcels:['a clockwork tonic','a carefully timed potion']},
 fox: {role:'CARTOGRAPHER OF MAYBES',art:'fox',icon:'✎',place:'THE UNFINISHED ATLAS',
  greetings:['I have a map of this floor! Unfortunately it is a map of the floor as it was before breakfast.','A fork in the road is an opportunity. A fork in my lunch is also an opportunity. I am very optimistic.'],
  lessons:[['vojo','path','A path is something you discover one step at a time.'],['aŭskulti','to listen','When every marker looks the same, let your ears help your feet.'],['dekstre','to the right','Knowing where right is does not always mean knowing the right way.']],
  lore:'No two journeys through these halls are quite alike. Listen around corners: moving footsteps are worth remembering.',wish:'To draw a map with a place marked “Here is where I belong.”',reply:'For now I put a tiny star beside each place where somebody shares a conversation.',
  offer:'My pack is heavier than my sense of direction. Could you carry one of these for me?',cups:['trail soup','a cup of compass tea'],parcels:['an explorer’s tonic','a potion in a map sleeve']},
 star: {role:'COLLECTOR OF LITTLE LIGHTS',art:'star',icon:'✧',place:'THE BORROWED CONSTELLATION',
  greetings:['Your footsteps sound like someone who still makes wishes. I collect those. Only with permission.','I found a star in a puddle. It was a reflection, but I kept it company until the water dried.'],
  lessons:[['lumo','light','A little light can be enough for the next step.'],['stelo','star','Stars are very good at looking close to friends who are far away.'],['espero','hope','Hope is how you leave a place in your pocket for something good.']],
  lore:'I hang borrowed lights where the ceiling forgets to be a sky. The deeper you go, the more useful a small light becomes.',wish:'To see the whole sky at once. I keep finding it in pieces.',reply:'If you find the sky, tell it that somebody down here is doing their best to remember it.',
  offer:'These are bottled wishes. Mostly they wish to be tea. It is important to support reasonable ambitions.',cups:['starlit tea','a warm cup of moon milk'],parcels:['a softly glowing tonic','a potion with a silver cork']},
 snail: {role:'TRAVELER IN NO PARTICULAR HURRY',art:'snail',icon:'☂',place:'THE VERY SMALL REST STOP',
  greetings:['I started crossing this room last week. Excellent progress. You must be the express service.','Welcome to my home. My home is also my luggage. Packing is wonderfully straightforward.'],
  lessons:[['malrapide','slowly','Slowly still gets you somewhere. It just gives you more to notice.'],['hejmo','home','Sometimes home is a place. Sometimes it is someone glad you arrived.'],['ripozi','to rest','Resting is part of traveling. I am an expert at this part.']],
  lore:'I have been below for a very long time. There always seems to be another staircase. Take each floor at your own pace.',wish:'To meet someone twice without either of us having to hurry.',reply:'I will practice by remaining exactly this comfortable. You should practice too.',
  offer:'I packed for a very long trip. There is certainly enough to share.',cups:['rainwater tea','a little bowl of travel stew'],parcels:['a shell-stamped tonic','a potion wrapped in a napkin']},
 lantern: {role:'CARETAKER OF STRAY ECHOES',art:'lantern',icon:'♫',place:'THE ECHO REHEARSAL',
  greetings:['Shh. The echo is rehearsing. It wants to sound more like itself and less like everyone else.','Hello! ...hello! That second one was my assistant. A little repetitive, but a wonderful listener.'],
  lessons:[['sono','sound','A sound can tell you what your eyes have not found yet.'],['paŝo','step','Listen for steps that are not yours. Some travelers never stand still.'],['silento','silence','Silence leaves room to hear what matters.']],
  lore:'All the little marks on your map hide their names. Nearby sounds are clues. Listen, move carefully, and listen again.',wish:'For my echo to say something first, just once.',reply:'I think it almost did yesterday. It sounded like “thank you.” I had not said that yet.',
  offer:'The echoes cannot drink, and I made enough for a choir. Please rescue a cup.',cups:['humming herbal tea','a warm cup of quiet'],parcels:['a bell-stoppered tonic','a softly rattling potion']}
};
const storyTraits=[
 {name:'a hopeful daydreamer',line:'I have a very good feeling about a very small thing. I have not found the thing yet.'},
 {name:'an easily distracted collector',line:'If you see a particularly interesting pebble, please tell it I said hello.'},
 {name:'a shy storyteller',line:'I had a wonderful greeting prepared. Naturally, I have forgotten every word.'},
 {name:'a cheerfully dramatic traveler',line:'At last! A visitor! I have been practicing that entrance all morning.'},
 {name:'a careful listener',line:'Take your time. Good conversations do not need to race the corridors.'},
 {name:'an incurable optimist',line:'We are both here, and that seems like a promising start.'},
 {name:'a sleepy philosopher',line:'I was just considering the meaning of a nap. My research remains unfinished.'},
 {name:'a curious tinkerer',line:'I wonder where you have been. The dust on your shoes looks unusually adventurous.'}
];
function storyPick(items){return items[Math.floor(Math.random()*items.length)];}
function getFloorCharacter(kind='npc'){
 S.characters ||= {};
 const key=`${S.x},${S.y}`,cached=S.characters[key];
 if(cached?.kind===kind&&cached.floor===S.floor)return cached;
 const archetype=storyPick(Object.keys(storyPeople)),base=storyPeople[archetype],trait=storyPick(storyTraits),lesson=storyPick(base.lessons);
 const name=storyPick(['Lu','Fe','Soli','Rumi','Tavi','Ni','Belo','Ari','Velo','Dori','Eko','Zori'])+storyPick(['na','lo','mi','ra','vi','nel','ko','la','rin','si','mo','li']);
 const person={...base,kind,floor:S.floor,id:`${S.floor}:${key}:${kind}`,archetype,name,trait:trait.name,
  greeting:`${storyPick(base.greetings)} ${trait.line}`,word:lesson[0],meaning:lesson[1],lesson:lesson[2],
  cup:storyPick(base.cups),parcel:storyPick(base.parcels),giftClaimed:false,
  shopTitle:`${name}’s ${storyPick(['Pocket Emporium','Little Supply Stop','Wandering Wares','Lantern Market','Traveling Cabinet','Corner of Useful Things'])}`,
  shopGreeting:storyPick(['Everything has a price. Looking is free. So is the terrible advice.','Welcome! I have supplies for a long journey, and a chair for a short rest.','New floor, new faces. The potions are reassuringly familiar.','Please browse. I alphabetized the stock, then forgot which alphabet.'])};
 S.characters[key]=person;return person;
}
function stopStory(){clearTimeout(storyTimer);storyTimer=0;storySession=null;}
function closeStory(){stopStory();closeModal();}
function storyPortrait(person){return `<div class="story-portrait ${escapeHTML(person.art)}" aria-hidden="true"><span class="portrait-orbit">✦</span><div class="portrait-shape"><span class="portrait-face">• •<br>⌣</span></div><span class="portrait-prop">${escapeHTML(person.icon)}</span></div>`;}
function openNPC(){
 if(!S||battle||S.over)return;
 stopStory();const person=getFloorCharacter('npc');
 storySession={kind:'npc',person,line:'',typing:false,choices:[]};
 storySay(person.greeting,storyTopics());
}
function storyTopics(){return [
 {label:'Teach me a word.',run:storyLesson},
 {label:'What is this place?',run:storyLore},
 {label:'Could you help me?',run:storyGift},
 {label:'See you around. · Ĝis revido',run:closeStory}
];}
function storySay(line,choices){
 if(storySession?.kind!=='npc')return;
 clearTimeout(storyTimer);const session=storySession,person=session.person;
 session.line=line;session.choices=choices;session.typing=true;session.position=0;
 showDialog(escapeHTML(person.name),`<div class="story-scene ${escapeHTML(person.art)}"><div class="story-scene-glow"></div>${storyPortrait(person)}<div class="story-location"><span>${escapeHTML(person.place)}</span><small>Floor ${String(S.floor).padStart(2,'0')} · ${escapeHTML(person.trait)}</small></div></div><div class="story-dialogue"><div class="story-speaker"><b>${escapeHTML(person.name)}</b><span>${escapeHTML(person.role)}</span></div><p id="storyText" aria-hidden="true"></p><p class="sr-only">${escapeHTML(line)}</p><button id="storySkip" class="story-skip" onclick="storyAdvance()">Reveal text · Enter ↵</button></div><div id="storyChoices" class="story-choices" hidden></div>`);
 $('box').classList.add('story-box');
 const tick=()=>{
  if(storySession!==session||!$('storyText')||!$('modal').classList.contains('show'))return;
  session.position=Math.min(line.length,session.position+2);$('storyText').textContent=line.slice(0,session.position);
  if(session.position<line.length)storyTimer=setTimeout(tick,22);else storyReveal();
 };
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)storyReveal();else tick();
}
function storyReveal(){
 clearTimeout(storyTimer);storyTimer=0;const session=storySession;
 if(session?.kind!=='npc'||!$('storyText'))return;
 session.typing=false;$('storyText').textContent=session.line;$('storySkip').hidden=true;
 $('storyChoices').hidden=false;$('storyChoices').innerHTML=session.choices.map((choice,index)=>`<button onclick="storyChoose(${index})"><span>✦</span>${escapeHTML(choice.label)}</button>`).join('');
}
function storyAdvance(){if(storySession?.kind!=='npc')return;if(storySession.typing)storyReveal();else if(storySession.choices.length===1)storyChoose(0);}
function storyChoose(index){
 if(storySession?.kind!=='npc'||storySession.typing||battle||S.over||!$('storyText')||!Number.isInteger(index)||!$('modal').classList.contains('show'))return;
 const choice=storySession.choices[index];if(choice)choice.run();
}
function storyBack(){if(storySession?.kind!=='npc')return;storySay('What else is on your mind, traveler?',storyTopics());}
function storyLesson(){
 if(storySession?.kind!=='npc')return;
 const person=storySession.person;S.notebook[person.word]=person.meaning;render();
 storySay(`${person.word.charAt(0).toUpperCase()+person.word.slice(1)} means ${person.meaning}. ${person.lesson}`,[
  {label:`${person.word} means ${person.meaning}. I’ll remember.`,run:()=>storySay('Then the word belongs to you now. I tucked it into your notebook. Use ACT in battle to listen, and MERCY when a creature trusts you.',[{label:'Keep talking →',run:storyBack}])},
  {label:'Could you say that once more?',run:storyLesson}
 ]);
}
function storyLore(){
 if(storySession?.kind!=='npc')return;
 const person=storySession.person;
 const peaceful=S.mercy>0?`I heard you spared ${S.mercy} ${S.mercy===1?'creature':'creatures'}. News like that travels faster than footsteps.`:'The creatures here have forgotten how to ask for company. Try listening before you reach for your weapon.';
 storySay(`${person.lore} ${peaceful}`,[
  {label:'And what do you wish for?',run:()=>storySay(person.wish,[
   {label:'I hope you find it.',run:()=>storySay(person.reply,[{label:'I’m glad we met.',run:storyBack}])},
   {label:'Maybe I could help?',run:()=>storySay(`You already stopped to listen, ${person.name} says softly. That is how most good things begin. ${person.reply}`,[{label:'Keep talking →',run:storyBack}])}
  ])},
  {label:'Ask something else →',run:storyBack}
 ]);
}
function storyGift(){
 if(storySession?.kind!=='npc')return;
 const person=storySession.person;S.npcGifts ||= {};
 if(person.giftClaimed||S.npcGifts[person.id])return storySay('I have already given you my spare supplies. But you are welcome to stay a little. Rest is not something you need to earn.',[{label:'Thank you. · Dankon',run:storyBack}]);
 storySay(person.offer,[
  {label:`Share ${person.cup}. · Restore up to 7 HP`,run:()=>claimStoryGift('heal')},
  {label:`Take ${person.parcel}. · Receive 1 potion`,run:()=>claimStoryGift('potion')},
  {label:'Maybe later.',run:storyBack}
 ]);
}
function claimStoryGift(kind){
 if(storySession?.kind!=='npc'||battle||S.over||!$('storyText')||!$('modal').classList.contains('show'))return;
 const person=storySession.person;S.npcGifts ||= {};if(person.giftClaimed||S.npcGifts[person.id])return storyGift();
 if(kind==='heal'&&S.hp===S.max)return storySay('You look quite well already! Take the potion for the road, or leave the cup here for later.',[{label:`Take ${person.parcel}.`,run:()=>claimStoryGift('potion')},{label:'Save the gift for later.',run:storyBack}]);
 if(!['heal','potion'].includes(kind))return;
 person.giftClaimed=true;S.npcGifts[person.id]=true;const gain=Math.min(7,S.max-S.hp);if(kind==='heal')S.hp+=gain;else S.potions++;
 S.notebook.dankon='thank you';guide(`${person.name} shares ${kind==='heal'?`${person.cup} (+${gain} health)`:`${person.parcel} (+1 potion)`}. Dankon means thank you.`);render();
 storySay('There you are. No debt, no favor owed. Just say “dankon.” It means thank you. That is quite enough.',[{label:'Dankon. ♥',run:storyBack}]);
}
const storyStock={potion:{name:'Pocket tonic',desc:'A potion for the road. Restores 7 HP when used.',price:8,icon:'♧'},attack:{name:'Sharpened quill',desc:'Permanently gain 1 attack for this expedition.',price:20,icon:'✎'},defense:{name:'Woven scarf',desc:'Permanently gain 1 defense. Maximum defense: 3.',price:18,icon:'≋'}};
function openShop(message){
 if(!S||battle||S.over)return;stopStory();const person=getFloorCharacter('shop');storySession={kind:'shop',person};
 showDialog(escapeHTML(person.shopTitle),`<div class="shop-heading"><div class="shop-character">${storyPortrait(person)}</div><div><span class="eyebrow">${escapeHTML(person.role)} · TRAVELING MERCHANT</span><p id="shopMessage" role="status">${escapeHTML(message??person.shopGreeting)}</p><span class="shop-personality">${escapeHTML(person.name)}, ${escapeHTML(person.trait)}</span></div></div><div class="shop-wallet">YOUR PURSE <strong>◈ ${S.gold} gold</strong></div><div class="shop-stock">${Object.entries(storyStock).map(([key,item])=>{const capped=key==='defense'&&S.def>=3;return `<div class="shop-item"><span class="shop-item-icon" aria-hidden="true">${escapeHTML(item.icon)}</span><div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.desc)}</p></div><button onclick="buyStoryItem('${key}')" ${capped||S.gold<item.price?'disabled':''}>${capped?'MAX':`${item.price} gold`}</button></div>`;}).join('')}</div><p class="shop-footnote">You carry ${S.potions} potions · ${S.atk} attack · ${S.def} defense<br>Supplies last for this expedition. Different merchants await in the shifting halls.</p><button class="primary" onclick="closeStory()">Back to the halls →</button>`);
 $('box').classList.add('story-box','shop-box');
}
function buyStoryItem(key){
 if(storySession?.kind!=='shop'||!$('shopMessage')||!$('modal').classList.contains('show')||!S||battle||S.over)return;
 const item=Object.hasOwn(storyStock,key)?storyStock[key]:null;if(!item||S.gold<item.price||(key==='defense'&&S.def>=3))return;
 S.gold-=item.price;if(key==='potion')S.potions++;else if(key==='attack')S.atk++;else S.def++;
 guide(`Bought ${item.name} for ${item.price} gold.`);render();openShop(`Sold! ${item.name} is yours. “Dankon!” That means thank you. Also: no refunds on things you drink.`);
}
window.addEventListener('keydown',event=>{
 if(storySession?.kind!=='npc'||!$('storyText')||!$('modal').classList.contains('show')||event.key!=='Enter')return;
 if(!storySession.typing&&event.target?.tagName==='BUTTON')return;
 event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)storyAdvance();
},true);
