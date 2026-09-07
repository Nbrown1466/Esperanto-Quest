'use strict';
// Esperanto is spoken first. The original English is available on demand.
const storyTranslations = new Map([
 ['MOTH POSTMASTER','POŜTESTRO DE LA NOKTOPAPILIOJ'],['KEEPER OF THE LITTLE KETTLE','GARDANTO DE LA TEKRUCETO'],['GARDENER OF LOST THINGS','ĜARDENISTO DE PERDITAJ AĴOJ'],['APPRENTICE TO TOMORROW','LERNANTO DE MORGAŬ'],['CARTOGRAPHER OF MAYBES','MAPISTO DE EBLAĴOJ'],['COLLECTOR OF LITTLE LIGHTS','KOLEKTANTO DE LUMETOJ'],['TRAVELER IN NO PARTICULAR HURRY','VOJAĜANTO SEN HASTO'],['CARETAKER OF STRAY ECHOES','ZORGANTO PRI VAGANTAJ EĤOJ'],
 ['THE UNDELIVERED POST','LA NELIVERITA POŜTO'],['THE STEAMING NOOK','LA VAPORA ANGULETO'],['THE POCKET GARDEN','LA POŜĜARDENO'],['THE PAUSE BETWEEN TICKS','LA PAŬZO INTER TIKOJ'],['THE UNFINISHED ATLAS','LA NEFINITA ATLASO'],['THE BORROWED CONSTELLATION','LA PRUNTITA KONSTELACIO'],['THE VERY SMALL REST STOP','LA ETA RIPOZEJO'],['THE ECHO REHEARSAL','LA PROVLUDO DE LA EĤO'],
 ['A traveler with pockets! Excellent. I have been delivering letters to the walls. Reliable recipients. Terrible conversationalists.','Vojaĝanto kun poŝoj! Bonege. Mi liveradis leterojn al la muroj. Fidindaj ricevantoj, sed teruraj kunparolantoj.'],
 ['Please stand still. I need to establish whether you are a person or an unusually mobile mailbox.','Bonvolu resti senmova. Mi devas ekscii, ĉu vi estas homo aŭ nekutime moviĝema leterkesto.'],
 ['Sit, if you like. The kettle has told the same story for forty years. I am trying to be a good listener.','Sidiĝu, se vi volas. La tekruĉo rakontas la saman historion jam kvardek jarojn. Mi provas bone aŭskulti.'],
 ['Do you take your tea with sugar, honey, or a brief but sincere silence? I have all three.','Ĉu vi deziras teon kun sukero, mielo aŭ mallonga sed sincera silento? Mi havas ĉiujn tri.'],
 ['Mind the seedlings. The little one on the left is a misplaced Tuesday. It needs shade.','Atentu la plantidojn. La malgranda maldekstre estas mislokita mardo. Ĝi bezonas ombron.'],
 ['You smell like outside! Or perhaps that is your backpack. Either way, please tell my flowers.','Vi odoras kiel la ekstera mondo! Aŭ eble tio estas via dorsosako. Ĉiuokaze, bonvolu rakonti al miaj floroj.'],
 ['You are precisely on time. I have not decided what time it is, so that was exceptionally considerate.','Vi venis ĝustatempe. Mi ankoraŭ ne decidis, kioma horo estas, do tio estis aparte afabla.'],
 ['Tick. Tock. Sorry, that was me. The clock is taking a well-earned break.','Tik. Tak. Pardonu, tio estis mi. La horloĝo ĝuas merititan paŭzon.'],
 ['I have a map of this floor! Unfortunately it is a map of the floor as it was before breakfast.','Mi havas mapon de ĉi tiu etaĝo! Bedaŭrinde ĝi montras la etaĝon tia, kia ĝi estis antaŭ la matenmanĝo.'],
 ['A fork in the road is an opportunity. A fork in my lunch is also an opportunity. I am very optimistic.','Vojforko estas ŝanco. Forko en mia tagmanĝo ankaŭ estas ŝanco. Mi estas tre optimisma.'],
 ['Your footsteps sound like someone who still makes wishes. I collect those. Only with permission.','Viaj paŝoj sonas kiel tiuj de iu, kiu ankoraŭ deziras ion. Mi kolektas dezirojn. Nur kun permeso.'],
 ['I found a star in a puddle. It was a reflection, but I kept it company until the water dried.','Mi trovis stelon en flako. Ĝi estis reflekto, sed mi restis apud ĝi ĝis la akvo sekiĝis.'],
 ['I started crossing this room last week. Excellent progress. You must be the express service.','Mi ektransiris ĉi tiun ĉambron pasintsemajne. Bonega progreso. Vi certe estas la rapidservo.'],
 ['Welcome to my home. My home is also my luggage. Packing is wonderfully straightforward.','Bonvenon al mia hejmo. Mia hejmo ankaŭ estas mia pakaĵo. Paki estas mirinde facile.'],
 ['Shh. The echo is rehearsing. It wants to sound more like itself and less like everyone else.','Ŝŝ. La eĥo ekzercas sin. Ĝi volas soni pli kiel si mem kaj malpli kiel ĉiuj aliaj.'],
 ['Hello! ...hello! That second one was my assistant. A little repetitive, but a wonderful listener.','Saluton! ...saluton! La dua estis mia helpanto. Iom ripetema, sed bonega aŭskultanto.'],
 ['a hopeful daydreamer','esperplena revulo'],['an easily distracted collector','facile distriĝanta kolektanto'],['a shy storyteller','timema rakontisto'],['a cheerfully dramatic traveler','gaja, teatrema vojaĝanto'],['a careful listener','atenta aŭskultanto'],['an incurable optimist','nekuracebla optimisto'],['a sleepy philosopher','dormema filozofo'],['a curious tinkerer','scivolema riparisto'],
 ['I have a very good feeling about a very small thing. I have not found the thing yet.','Mi havas tre bonan senton pri tre malgranda afero. Mi ankoraŭ ne trovis la aferon.'],
 ['If you see a particularly interesting pebble, please tell it I said hello.','Se vi vidos aparte interesan ŝtoneton, bonvolu saluti ĝin nome de mi.'],
 ['I had a wonderful greeting prepared. Naturally, I have forgotten every word.','Mi preparis mirindan saluton. Kompreneble mi forgesis ĉiun vorton.'],
 ['At last! A visitor! I have been practicing that entrance all morning.','Finfine! Vizitanto! Mi ekzercadis tiun eniron la tutan matenon.'],
 ['Take your time. Good conversations do not need to race the corridors.','Ne rapidu. Bonaj konversacioj ne devas kuri tra la koridoroj.'],
 ['We are both here, and that seems like a promising start.','Ni ambaŭ estas ĉi tie, kaj tio ŝajnas promesplena komenco.'],
 ['I was just considering the meaning of a nap. My research remains unfinished.','Mi ĵus pripensis la signifon de dormeto. Mia esploro ankoraŭ ne finiĝis.'],
 ['I wonder where you have been. The dust on your shoes looks unusually adventurous.','Mi scivolas, kie vi estis. La polvo sur viaj ŝuoj aspektas nekutime aventurema.'],
 ['A good word to carry into a room with someone frightening. They might be frightened, too.','Bona vorto por kunporti en ĉambron kun iu timiga. Eble ankaŭ tiu timas.'],
 ['A letter is a conversation brave enough to travel alone.','Letero estas konversacio sufiĉe kuraĝa por vojaĝi sola.'],
 ['Two wings carry a moth. One kind word can carry a traveler.','Du flugiloj portas noktopapilion. Unu afabla vorto povas porti vojaĝanton.'],
 ['It means being afraid, and putting the kettle on anyway.','Tio signifas timi, kaj tamen ekboligi la akvon por teo.'],
 ['A warm welcome is a kind of shelter you can carry.','Varma bonveno estas ŝirmejo, kiun oni povas kunporti.'],
 ['Even an enormous adventure needs a small drink now and then.','Eĉ grandega aventuro bezonas trinketon de tempo al tempo.'],
 ['A flower does not need to know where the ceiling ends to reach upward.','Floro ne bezonas scii, kie finiĝas la plafono, por kreski supren.'],
 ['Growing can be so quiet that only your friends notice.','Kreskado povas esti tiel kvieta, ke nur viaj amikoj rimarkas ĝin.'],
 ['The smallest green shoot still changes the color of a room.','Eĉ la plej eta verda ŝoso ŝanĝas la koloron de ĉambro.'],
 ['You do not have to fill every moment to make it count.','Vi ne devas plenigi ĉiun momenton por doni al ĝi valoron.'],
 ['Waiting is easier when somebody waits beside you.','Atendi estas pli facile, kiam iu atendas apud vi.'],
 ['Today is the only day that is always right here.','Hodiaŭ estas la sola tago, kiu ĉiam estas ĝuste ĉi tie.'],
 ['A path is something you discover one step at a time.','Vojon oni malkovras paŝon post paŝo.'],
 ['When every marker looks the same, let your ears help your feet.','Kiam ĉiuj signoj aspektas same, lasu viajn orelojn helpi viajn piedojn.'],
 ['Knowing where right is does not always mean knowing the right way.','Scii, kie estas dekstre, ne ĉiam signifas scii la ĝustan vojon.'],
 ['A little light can be enough for the next step.','Iom da lumo povas sufiĉi por la sekva paŝo.'],
 ['Stars are very good at looking close to friends who are far away.','Steloj ŝajnas proksimaj eĉ al amikoj, kiuj estas malproksime.'],
 ['Hope is how you leave a place in your pocket for something good.','Espero estas lasi lokon en via poŝo por io bona.'],
 ['Slowly still gets you somewhere. It just gives you more to notice.','Eĉ malrapide oni atingas iun lokon. Oni simple rimarkas pli da aferoj survoje.'],
 ['Sometimes home is a place. Sometimes it is someone glad you arrived.','Foje hejmo estas loko. Foje ĝi estas iu, kiu ĝojas pro via alveno.'],
 ['Resting is part of traveling. I am an expert at this part.','Ripozi estas parto de vojaĝado. Pri tiu parto mi estas spertulo.'],
 ['A sound can tell you what your eyes have not found yet.','Sono povas diri al vi tion, kion viaj okuloj ankoraŭ ne trovis.'],
 ['Listen for steps that are not yours. Some travelers never stand still.','Aŭskultu paŝojn, kiuj ne estas viaj. Kelkaj vojaĝantoj neniam restas senmovaj.'],
 ['Silence leaves room to hear what matters.','Silento lasas spacon por aŭdi tion, kio gravas.'],
 ['These halls were an archive. I still deliver the letters. Even a place that keeps changing deserves its post.','Ĉi tiuj haloj iam estis arkivo. Mi ankoraŭ liveras la leterojn. Eĉ loko, kiu ĉiam ŝanĝiĝas, meritas sian poŝton.'],
 ['Every conversation warms this place a little. When the corridors shift, I follow the steam to find my kettle again.','Ĉiu konversacio iom varmigas ĉi tiun lokon. Kiam la koridoroj ŝanĝiĝas, mi sekvas la vaporon por retrovi mian tekruĉon.'],
 ['I plant whatever travelers lose. Buttons grow into button bushes. Hope grows slowly, but it survives almost anything.','Mi plantas ĉion, kion vojaĝantoj perdas. Butonoj fariĝas butonarbustoj. Espero kreskas malrapide, sed travivas preskaŭ ĉion.'],
 ['The corridors rearrange when nobody is watching. I keep a timetable of the changes. It is mostly crossed-out guesses.','La koridoroj rearanĝiĝas, kiam neniu rigardas. Mi registras la ŝanĝojn. Plejparte temas pri forstrekitaj divenoj.'],
 ['No two journeys through these halls are quite alike. Listen around corners: moving footsteps are worth remembering.','Neniuj du vojaĝoj tra ĉi tiuj haloj estas tute samaj. Aŭskultu ĉe anguloj: indas memori moviĝantajn paŝojn.'],
 ['I hang borrowed lights where the ceiling forgets to be a sky. The deeper you go, the more useful a small light becomes.','Mi pendigas pruntitajn lumojn tie, kie la plafono forgesas esti ĉielo. Ju pli profunden vi iras, des pli utilas lumeto.'],
 ['I have been below for a very long time. There always seems to be another staircase. Take each floor at your own pace.','Mi estas ĉi-sube jam tre longe. Ĉiam ŝajnas esti plia ŝtuparo. Esploru ĉiun etaĝon laŭ via propra ritmo.'],
 ['All the little marks on your map hide their names. Nearby sounds are clues. Listen, move carefully, and listen again.','La etaj signoj sur via mapo kaŝas siajn nomojn. Proksimaj sonoj estas indikoj. Aŭskultu, moviĝu singarde, kaj denove aŭskultu.'],
 ['A letter addressed to me. Nothing grand. Just my name, and somebody asking how I am.','Leteron adresitan al mi. Nenion grandiozan. Nur mian nomon, kaj iun demandantan, kiel mi fartas.'],
 ['A window. A small one. I would like to hear what rain sounds like when it is outside.','Fenestron. Malgrandan. Mi ŝatus aŭdi, kiel sonas pluvo, kiam ĝi estas ekstere.'],
 ['A real sunrise for my garden. The mushrooms pretend they do not care. I know they do.','Veran sunleviĝon por mia ĝardeno. La fungoj ŝajnigas, ke tio ne gravas al ili. Mi scias, ke ĝi gravas.'],
 ['One entire minute in which nobody feels late.','Unu tutan minuton, dum kiu neniu sentas sin malfrua.'],
 ['To draw a map with a place marked “Here is where I belong.”','Desegni mapon kun loko markita: “Ĉi tie estas mia loko.”'],
 ['To see the whole sky at once. I keep finding it in pieces.','Vidi la tutan ĉielon samtempe. Mi ĉiam trovas nur pecojn de ĝi.'],
 ['To meet someone twice without either of us having to hurry.','Renkonti iun dufoje sen tio, ke iu el ni devu rapidi.'],
 ['For my echo to say something first, just once.','Ke mia eĥo diru ion unue, almenaŭ unufoje.'],
 ['I would answer on my best paper. The one that has only been slightly eaten.','Mi respondus sur mia plej bona papero. Tiu, kiu estas nur iom manĝita.'],
 ['Until then, I let the kettle whistle. It sounds a little like weather if you believe in it.','Ĝis tiam mi lasas la tekruĉon fajfi. Ĝi iom sonas kiel vetero, se oni kredas je tio.'],
 ['You can visit again if the halls bring us together. I will keep a patch of soil for your stories.','Vi povas reveni, se la haloj denove kunvenigos nin. Mi konservos pecon da grundo por viaj rakontoj.'],
 ['We might just have made one. Do not check your watch. That would frighten it away.','Eble ni ĵus kreis tian minuton. Ne rigardu vian horloĝon. Tio fortimigus ĝin.'],
 ['For now I put a tiny star beside each place where somebody shares a conversation.','Dume mi desegnas steleton apud ĉiu loko, kie iu kunparolas kun mi.'],
 ['If you find the sky, tell it that somebody down here is doing their best to remember it.','Se vi trovos la ĉielon, diru al ĝi, ke iu ĉi-sube faras sian plejeblon por memori ĝin.'],
 ['I will practice by remaining exactly this comfortable. You should practice too.','Mi ekzercos min restante ĝuste tiel komforta. Ankaŭ vi provu.'],
 ['I think it almost did yesterday. It sounded like “thank you.” I had not said that yet.','Mi pensas, ke tio preskaŭ okazis hieraŭ. Ĝi sonis kiel “dankon”. Mi ankoraŭ ne diris tion.'],
 ['An undelivered care package! It says “For whoever needs it.” A remarkably efficient address.','Neliverita zorgopakaĵo! Sur ĝi estas skribite: “Por tiu, kiu bezonas ĝin.” Mirinde efika adreso.'],
 ['A difficult journey calls for something warm now, or something useful in your pocket.','Malfacila vojaĝo postulas ion varman nun, aŭ ion utilan en via poŝo.'],
 ['The garden made more than I need today. Pick something before the flowers become smug about it.','La ĝardeno produktis pli ol mi bezonas hodiaŭ. Elektu ion antaŭ ol la floroj tro fieriĝos.'],
 ['My lunch break has lasted three years. Please help me finish these supplies.','Mia tagmanĝa paŭzo daŭras jam tri jarojn. Bonvolu helpi min fini ĉi tiujn provizojn.'],
 ['My pack is heavier than my sense of direction. Could you carry one of these for me?','Mia pakaĵo estas pli peza ol mia direktsento. Ĉu vi povus porti unu el ĉi tiuj por mi?'],
 ['These are bottled wishes. Mostly they wish to be tea. It is important to support reasonable ambitions.','Ĉi tiuj estas enboteligitaj deziroj. Plejparte ili deziras esti teo. Gravas subteni prudentajn ambiciojn.'],
 ['I packed for a very long trip. There is certainly enough to share.','Mi pakis por tre longa vojaĝo. Certe sufiĉas por dividi.'],
 ['The echoes cannot drink, and I made enough for a choir. Please rescue a cup.','La eĥoj ne povas trinki, kaj mi preparis sufiĉe por ĥoro. Bonvolu savi tason.'],
 ['Teach me a word.','Instruu al mi vorton.'],['What is this place?','Kio estas ĉi tiu loko?'],['Could you help me?','Ĉu vi povus helpi min?'],['See you around. · Ĝis revido','Ĝis revido.'],['What else is on your mind, traveler?','Pri kio alia vi pensas, vojaĝanto?'],['Keep talking →','Ni plu parolu →'],['Could you say that once more?','Ĉu vi povus ripeti tion?'],['And what do you wish for?','Kaj kion vi deziras?'],['I hope you find it.','Mi esperas, ke vi trovos tion.'],['I’m glad we met.','Mi ĝojas, ke ni renkontiĝis.'],['Maybe I could help?','Eble mi povus helpi?'],['Ask something else →','Demandu ion alian →'],['Maybe later.','Eble poste.'],['Save the gift for later.','Konservu la donacon por poste.'],['Thank you. · Dankon','Dankon.'],
 ['I have already given you my spare supplies. But you are welcome to stay a little. Rest is not something you need to earn.','Mi jam donis al vi miajn kromajn provizojn. Sed vi bonvenas resti iomete. Vi ne devas meriti ripozon.'],
 ['You look quite well already! Take the potion for the road, or leave the cup here for later.','Vi jam aspektas tute sana! Prenu la pocion por la vojo, aŭ lasu la tason ĉi tie por poste.'],
 ['There you are. No debt, no favor owed. Just say “dankon.” It means thank you. That is quite enough.','Jen. Neniu ŝuldo, neniu repagenda favoro. Nur diru “dankon”. Tio signifas “thank you” en la angla. Tio tute sufiĉas.'],
 ['Then the word belongs to you now. I tucked it into your notebook. Use ACT in battle to listen, and MERCY when a creature trusts you.','Nun la vorto apartenas al vi. Mi metis ĝin en vian kajeron. Elektu PAROLU en batalo por aŭskulti, kaj INDULGU kiam estaĵo fidas vin.'],
 ['The creatures here have forgotten how to ask for company. Try listening before you reach for your weapon.','La estaĵoj ĉi tie forgesis, kiel peti kuneston. Provu aŭskulti antaŭ ol preni vian armilon.'],
 ['Everything has a price. Looking is free. So is the terrible advice.','Ĉio havas prezon. Rigardi estas senpage. Ankaŭ la teruraj konsiloj.'],['Welcome! I have supplies for a long journey, and a chair for a short rest.','Bonvenon! Mi havas provizojn por longa vojaĝo, kaj seĝon por mallonga ripozo.'],['New floor, new faces. The potions are reassuringly familiar.','Nova etaĝo, novaj vizaĝoj. La pocioj estas trankvilige konataj.'],['Please browse. I alphabetized the stock, then forgot which alphabet.','Bonvolu rigardi. Mi ordigis la varojn laŭ la alfabeto, sed poste forgesis, kiun alfabeton.'],
 ['honey tea','miela teo'],['a warm nectar cup','taso da varma nektaro'],['spiced tea','spicita teo'],['a cup of cloud broth','taso da nuba buljono'],['mushroom broth','funga buljono'],['a cup of petal tea','taso da petala teo'],['slow-steeped tea','malrapide infuzita teo'],['a minute of warm cocoa','minuto da varma kakao'],['trail soup','vojaĝa supo'],['a cup of compass tea','taso da kompasa teo'],['starlit tea','stelluma teo'],['a warm cup of moon milk','varma taso da luna lakto'],['rainwater tea','pluvakva teo'],['a little bowl of travel stew','bovleto da vojaĝa stufaĵo'],['humming herbal tea','zumanta herba teo'],['a warm cup of quiet','varma taso da kvieto'],
 ['a ribbon-tied care parcel','rubandita zorgopakaĵo'],['an undelivered tonic','neliverita toniko'],['a bottled kettle tonic','enboteligita tekruĉa toniko'],['a tiny flask of comfort','boteleto da komforto'],['a leaf-wrapped tonic','folivolvita toniko'],['a dew-filled potion','pocio plena de roso'],['a clockwork tonic','horloĝmekanisma toniko'],['a carefully timed potion','precize tempigita pocio'],['an explorer’s tonic','esplorista toniko'],['a potion in a map sleeve','pocio en mapujo'],['a softly glowing tonic','milde brilanta toniko'],['a potion with a silver cork','pocio kun arĝenta ŝtopilo'],['a shell-stamped tonic','toniko kun ŝela stampo'],['a potion wrapped in a napkin','pocio volvita en buŝtuko'],['a bell-stoppered tonic','toniko kun sonorila ŝtopilo'],['a softly rattling potion','mallaŭte tintanta pocio'],
 ['Pocket Emporium','Poŝa Bazaro'],['Little Supply Stop','Eta Provizejo'],['Wandering Wares','Vagantaj Varoj'],['Lantern Market','Lanterna Bazaro'],['Traveling Cabinet','Vojaĝanta Ŝranko'],['Corner of Useful Things','Angulo de Utilaj Aĵoj']
]);
const storyTranslationEntries=[...storyTranslations].sort((a,b)=>b[0].length-a[0].length);
function toEsperanto(text){let value=String(text);for(const [en,eo] of storyTranslationEntries)value=value.split(en).join(eo);return value;}
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
function storySay(line,choices,english=line){
 if(storySession?.kind!=='npc')return;
 clearTimeout(storyTimer);const session=storySession,person=session.person;
 line=toEsperanto(line);session.line=line;session.translation=english;session.choices=choices;session.typing=true;session.position=0;
 showDialog(escapeHTML(person.name),`<div class="story-scene ${escapeHTML(person.art)}"><div class="story-scene-glow"></div>${storyPortrait(person)}<div class="story-location"><span>${escapeHTML(toEsperanto(person.place))}</span><small>Etaĝo ${String(S.floor).padStart(2,'0')} · ${escapeHTML(toEsperanto(person.trait))}</small></div></div><div class="story-dialogue"><div class="story-speaker"><b>${escapeHTML(person.name)}</b><span>${escapeHTML(toEsperanto(person.role))}</span></div><p id="storyText" lang="eo" aria-hidden="true"></p><p class="sr-only" lang="eo">${escapeHTML(line)}</p><div class="story-reading-controls"><button id="storyTranslate" class="story-skip" aria-expanded="false" aria-controls="storyTranslation" onclick="toggleStoryTranslation()">Montri la anglan</button><button id="storySkip" class="story-skip" onclick="storyAdvance()">Montri la tutan tekston · Enter ↵</button></div><p id="storyTranslation" lang="en" hidden>${escapeHTML(english)}</p></div><div id="storyChoices" class="story-choices" hidden></div>`);
 $('box').classList.add('story-box');
 const tick=()=>{
  if(storySession!==session||!$('storyText')||!$('modal').classList.contains('show'))return;
  session.position=Math.min(line.length,session.position+2);$('storyText').textContent=line.slice(0,session.position);
  if(session.position<line.length)storyTimer=setTimeout(tick,22);else storyReveal();
 };
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)storyReveal();else tick();
}
function toggleStoryTranslation(){
 if(storySession?.kind!=='npc'||!$('storyTranslation')||!$('modal').classList.contains('show'))return;
 const translation=$('storyTranslation');translation.hidden=!translation.hidden;
 $('storyTranslate').textContent=translation.hidden?'Montri la anglan':'Kaŝi la anglan';
 $('storyTranslate').setAttribute('aria-expanded',String(!translation.hidden));
}
function storyReveal(){
 clearTimeout(storyTimer);storyTimer=0;const session=storySession;
 if(session?.kind!=='npc'||!$('storyText'))return;
 session.typing=false;$('storyText').textContent=session.line;$('storySkip').hidden=true;
 $('storyChoices').hidden=false;$('storyChoices').innerHTML=session.choices.map((choice,index)=>`<button onclick="storyChoose(${index})"><span>✦</span>${escapeHTML(toEsperanto(choice.label))}</button>`).join('');
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
 storySay(`“${person.word}” signifas “${person.meaning}” en la angla. ${toEsperanto(person.lesson)}`,[
  {label:`Mi memoros la vorton “${person.word}”.`,run:()=>storySay('Then the word belongs to you now. I tucked it into your notebook. Use ACT in battle to listen, and MERCY when a creature trusts you.',[{label:'Keep talking →',run:storyBack}])},
  {label:'Could you say that once more?',run:storyLesson}
 ],`${person.word.charAt(0).toUpperCase()+person.word.slice(1)} means ${person.meaning}. ${person.lesson}`);
}
function storyLore(){
 if(storySession?.kind!=='npc')return;
 const person=storySession.person;
 const peaceful=S.mercy>0?`I heard you spared ${S.mercy} ${S.mercy===1?'creature':'creatures'}. News like that travels faster than footsteps.`:'The creatures here have forgotten how to ask for company. Try listening before you reach for your weapon.';
 const peacefulEO=S.mercy>0?`Mi aŭdis, ke vi indulgis ${S.mercy} estaĵojn. Tiaj novaĵoj vojaĝas pli rapide ol paŝoj.`:toEsperanto(peaceful);
 storySay(`${toEsperanto(person.lore)} ${peacefulEO}`,[
  {label:'And what do you wish for?',run:()=>storySay(person.wish,[
   {label:'I hope you find it.',run:()=>storySay(person.reply,[{label:'I’m glad we met.',run:storyBack}])},
   {label:'Maybe I could help?',run:()=>storySay(`Vi jam haltis por aŭskulti, diras ${person.name} mallaŭte. Tiel komenciĝas plej multaj bonaj aferoj. ${toEsperanto(person.reply)}`,[{label:'Keep talking →',run:storyBack}],`You already stopped to listen, ${person.name} says softly. That is how most good things begin. ${person.reply}`)}
  ])},
  {label:'Ask something else →',run:storyBack}
 ],`${person.lore} ${peaceful}`);
}
function storyGift(){
 if(storySession?.kind!=='npc')return;
 const person=storySession.person;S.npcGifts ||= {};
 if(person.giftClaimed||S.npcGifts[person.id])return storySay('I have already given you my spare supplies. But you are welcome to stay a little. Rest is not something you need to earn.',[{label:'Thank you. · Dankon',run:storyBack}]);
 storySay(person.offer,[
  {label:`Trinkaĵo: ${toEsperanto(person.cup)} · ĝis +7 vivo`,run:()=>claimStoryGift('heal')},
  {label:`Pocio: ${toEsperanto(person.parcel)} · +1 pocio`,run:()=>claimStoryGift('potion')},
  {label:'Maybe later.',run:storyBack}
 ]);
}
function claimStoryGift(kind){
 if(storySession?.kind!=='npc'||battle||S.over||!$('storyText')||!$('modal').classList.contains('show'))return;
 const person=storySession.person;S.npcGifts ||= {};if(person.giftClaimed||S.npcGifts[person.id])return storyGift();
 if(kind==='heal'&&S.hp===S.max)return storySay('You look quite well already! Take the potion for the road, or leave the cup here for later.',[{label:`Prenu la pocion: ${toEsperanto(person.parcel)}.`,run:()=>claimStoryGift('potion')},{label:'Save the gift for later.',run:storyBack}]);
 if(!['heal','potion'].includes(kind))return;
 person.giftClaimed=true;S.npcGifts[person.id]=true;const gain=Math.min(7,S.max-S.hp);if(kind==='heal')S.hp+=gain;else S.potions++;
 S.notebook.dankon='thank you';guide(`${person.name} donacas: ${kind==='heal'?`${toEsperanto(person.cup)} (+${gain} vivo)`:`${toEsperanto(person.parcel)} (+1 pocio)`}. “Dankon” signifas “thank you”.`);render();
 storySay('There you are. No debt, no favor owed. Just say “dankon.” It means thank you. That is quite enough.',[{label:'Dankon. ♥',run:storyBack}]);
}
const storyStock={potion:{name:'Poŝa pocio',desc:'Pocio por la vojo. Redonas 7 vivojn kiam uzata.',price:8,icon:'♧'},attack:{name:'Akra plumo',desc:'+1 atako dum la tuta ekspedicio.',price:20,icon:'✎'},defense:{name:'Teksita koltuko',desc:'+1 defendo dum la tuta ekspedicio. Maksimuma defendo: 3.',price:18,icon:'≋'}};
function openShop(message){
 if(!S||battle||S.over)return;stopStory();const person=getFloorCharacter('shop');storySession={kind:'shop',person};
 const title=toEsperanto(person.shopTitle).replace(/^(.+)’s (.+)$/,'$2 de $1');
 showDialog(escapeHTML(title),`<div class="shop-heading"><div class="shop-character">${storyPortrait(person)}</div><div><span class="eyebrow">${escapeHTML(toEsperanto(person.role))} · VAGANTA KOMERCISTO</span><p id="shopMessage" role="status">${escapeHTML(toEsperanto(message??person.shopGreeting))}</p><span class="shop-personality">${escapeHTML(person.name)}, ${escapeHTML(toEsperanto(person.trait))}</span></div></div><div class="shop-wallet">VIA ORO <strong>◈ ${S.gold}</strong></div><div class="shop-stock">${Object.entries(storyStock).map(([key,item])=>{const capped=key==='defense'&&S.def>=3;return `<div class="shop-item"><span class="shop-item-icon" aria-hidden="true">${escapeHTML(item.icon)}</span><div><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(item.desc)}</p></div><button onclick="buyStoryItem('${key}')" ${capped||S.gold<item.price?'disabled':''}>${capped?'MAKS':`${item.price} oro`}</button></div>`;}).join('')}</div><p class="shop-footnote">Vi portas ${S.potions} pociojn · ${S.atk} atako · ${S.def} defendo<br>La provizoj daŭras dum ĉi tiu ekspedicio. Aliaj komercistoj atendas en la ŝanĝiĝantaj haloj.</p><button class="primary" onclick="closeStory()">Reen al la haloj →</button>`);
 $('box').classList.add('story-box','shop-box');
}
function buyStoryItem(key){
 if(storySession?.kind!=='shop'||!$('shopMessage')||!$('modal').classList.contains('show')||!S||battle||S.over)return;
 const item=Object.hasOwn(storyStock,key)?storyStock[key]:null;if(!item||S.gold<item.price||(key==='defense'&&S.def>=3))return;
 S.gold-=item.price;if(key==='potion')S.potions++;else if(key==='attack')S.atk++;else S.def++;
 guide(`Vi aĉetis: ${item.name} por ${item.price} oro.`);render();openShop(`Vendite! ${item.name} nun apartenas al vi. Dankon! Cetere: neniu repago por io jam trinkita.`);
}
window.addEventListener('keydown',event=>{
 if(storySession?.kind!=='npc'||!$('storyText')||!$('modal').classList.contains('show')||event.key!=='Enter')return;
 if(!storySession.typing&&event.target?.tagName==='BUTTON')return;
 event.preventDefault();event.stopImmediatePropagation();if(!event.repeat)storyAdvance();
},true);
