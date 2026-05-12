const SAVE_KEY="mushimusume_v7_true_janken";
const HANDS={rock:{label:"グー",icon:"✊",beats:"scissors"},scissors:{label:"チョキ",icon:"✌️",beats:"paper"},paper:{label:"パー",icon:"🖐️",beats:"rock"}};
const TYPES=[
{id:"butterfly",species:"モンシロチョウ娘",hand:"paper",role:"回復・回避",img:"./butterfly.png",desc:"おとなしい白い蝶娘。花蜜集めと回復が得意。",base:{hp:32,atk:7,def:2,luck:6},skill:{name:"りんぷんヒール",type:"heal",power:14,cost:3,text:"白い鱗粉が舞い、HPを回復した。"}},
{id:"beetle",species:"カブトムシ娘",hand:"paper",role:"防御・樹液",img:"./beetle.png",desc:"頼れる甲虫娘。グー枠追加まで、あえてパー担当。",base:{hp:46,atk:8,def:7,luck:2},skill:{name:"甲殻ガード",type:"guard",power:9,cost:3,text:"甲殻で構えた。次の被ダメージを大きく減らす。"}},
{id:"mantis",species:"カマキリ娘",hand:"scissors",role:"攻撃・会心",img:"./mantis.png",desc:"緑髪短髪のヤンキー風お姉さん。チョキ攻撃が得意。",base:{hp:36,atk:13,def:2,luck:4},skill:{name:"一閃カマ斬り",type:"damage",power:22,cost:3,text:"鋭い鎌の一撃を叩き込んだ。"}}
];
const ENEMIES=[
{id:"aphid",name:"アブラムシ群",icon:"●",hand:"rock",hp:24,atk:5,def:0,reward:{honey:9,pollen:7,sap:0},exp:5,text:"小さな敵が群れでまとわりつく。"},
{id:"wasp",name:"縄張りハチ",icon:"◆",hand:"scissors",hp:30,atk:8,def:1,reward:{honey:7,pollen:5,sap:4},exp:7,text:"鋭い羽音が近づいてくる。"},
{id:"centipede",name:"朽木ムカデ",icon:"〽",hand:"rock",hp:38,atk:9,def:2,reward:{honey:2,pollen:0,sap:15},exp:9,text:"朽木の隙間から危険な影が這い出した。"},
{id:"spider",name:"網張りグモ",icon:"✦",hand:"paper",hp:34,atk:7,def:3,reward:{honey:4,pollen:12,sap:5},exp:8,text:"粘る糸が行く手をふさいでいる。"}
];
const STRONG_ENEMIES=[
{id:"hornet",name:"怒れるスズメバチ",icon:"◇",hand:"scissors",hp:48,atk:12,def:3,reward:{honey:12,pollen:8,sap:8},exp:15,text:"黒と黄色の影が、低い羽音を響かせている。"},
{id:"stag",name:"夜闇クワガタ",icon:"🪲",hand:"scissors",hp:54,atk:11,def:5,reward:{honey:5,pollen:5,sap:18},exp:16,text:"硬い顎が月明かりを裂くように開いた。"},
{id:"giantspider",name:"古巣の大蜘蛛",icon:"✦",hand:"paper",hp:58,atk:10,def:6,reward:{honey:8,pollen:18,sap:8},exp:17,text:"巣の中心から、古い主がゆっくり降りてくる。"}
];
const RELIC_POOL=[
{id:"stag_pincer",name:"クワガタのハサミ",icon:"🪲",rarity:"R",hand:"scissors",effect:{atk:5,crit:.06},desc:"チョキ攻撃の威力+5。会心率も少し上がる。"},
{id:"wasp_stinger",name:"スズメバチの針",icon:"◆",rarity:"R",hand:"scissors",effect:{atk:4,pierce:2},desc:"チョキ攻撃の威力+4。敵防御を少し貫通する。"},
{id:"cockroach_antenna",name:"ゴキブリの触覚",icon:"⌁",rarity:"N",hand:"paper",effect:{luck:4,evade:.06},desc:"パー攻撃時、運+4。被弾回避も少し上がる。"},
{id:"beetle_shell",name:"カナブンの甲殻",icon:"◒",rarity:"N",hand:"rock",effect:{atk:2,guard:3},desc:"グー攻撃の威力+2。防御時の軽減量+3。"},
{id:"cicada_shell",name:"セミの抜け殻",icon:"◇",rarity:"SR",hand:"paper",effect:{atk:3,heal:3},desc:"パー攻撃の威力+3。攻撃後にHPを少し回復する。"},
{id:"dragonfly_wing",name:"トンボの透明翅",icon:"∴",rarity:"R",hand:"paper",effect:{atk:2,evade:.10},desc:"パー攻撃の威力+2。回避率が上がる。"},
{id:"ant_jaw",name:"アリの大顎",icon:"⌒",rarity:"N",hand:"rock",effect:{atk:4},desc:"グー攻撃の威力+4。"},
{id:"mantis_foreleg",name:"古い鎌脚",icon:"⌐",rarity:"SR",hand:"scissors",effect:{atk:7,crit:.04},desc:"チョキ攻撃の威力+7。"},
{id:"moth_powder",name:"蛾の夜鱗粉",icon:"✧",rarity:"R",hand:"paper",effect:{atk:2,debuff:2},desc:"パー攻撃の威力+2。敵の次の攻撃を少し弱める。"}
];

let pendingType=null;
let pendingModalAction=null;
let state=load();

function defaultState(){return{resources:{honey:25,sap:12,pollen:12},active:null,relics:[],equipped:{rock:null,scissors:null,paper:null},best:{level:0,depth:0,wins:0,name:""},graves:[],lastTick:Date.now(),log:["卵を選んで挑戦を開始してください。"],run:null,battle:null}}
function load(){try{let raw=localStorage.getItem(SAVE_KEY);return raw?{...defaultState(),...JSON.parse(raw)}:defaultState()}catch(e){return defaultState()}}
function save(){state.lastTick=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state));addLog("保存しました。");render()}
function addLog(t){state.log.unshift(t);state.log=state.log.slice(0,100)}
function handLabel(h){return`${HANDS[h].icon} ${HANDS[h].label}`}
function resultVs(a,b){return a===b?"draw":HANDS[a].beats===b?"win":"lose"}
function typeDef(id){return TYPES.find(t=>t.id===id)}
function activeType(){return state.active?typeDef(state.active.typeId):null}
function rb(uid){return state.relics.find(r=>r.uid===uid)}
function eq(hand){let uid=state.equipped[hand];return uid?rb(uid):null}
function stats(){let t=activeType(),lv=state.active.level;return{hp:t.base.hp+(lv-1)*6,atk:t.base.atk+Math.floor((lv-1)*2.2),def:t.base.def+Math.floor((lv-1)*1.5),luck:t.base.luck+Math.floor((lv-1)*.8),maxSp:6+Math.floor(lv/2)}}
function modal(title,text,icon="✦",after=null){pendingModalAction=after;document.getElementById("modalIcon").textContent=icon;document.getElementById("modalTitle").textContent=title;document.getElementById("modalText").textContent=text;document.getElementById("resultModal").classList.remove("hidden")}
function closeModal(){document.getElementById("resultModal").classList.add("hidden");let fn=pendingModalAction;pendingModalAction=null;if(fn)fn()}
function offlineGain(){let now=Date.now(),diff=Math.max(0,Math.floor((now-state.lastTick)/1000));if(diff<5)return;let m=Math.min(480,diff/60),gain={honey:Math.floor(m*1.2),sap:Math.floor(m*.7),pollen:Math.floor(m*.9)};state.resources.honey+=gain.honey;state.resources.sap+=gain.sap;state.resources.pollen+=gain.pollen;if(gain.honey+gain.sap+gain.pollen>0)addLog(`放置報酬：蜜+${gain.honey}、樹液+${gain.sap}、花粉+${gain.pollen}`);state.lastTick=now}
function selectEgg(id){pendingType=id;let t=typeDef(id);document.getElementById("eggScreen").classList.add("hidden");document.getElementById("nameScreen").classList.remove("hidden");document.getElementById("nameTitle").textContent=`${t.species}が孵りました`;document.getElementById("namePreview").src=t.img;document.getElementById("nameInput").value=t.species}
function confirmName(){if(!pendingType)return;let t=typeDef(pendingType);let name=document.getElementById("nameInput").value.trim()||t.species;state.active={typeId:t.id,name,level:1,exp:0,wins:0,maxDepth:0,bornAt:Date.now()};state.relics=[];state.equipped={rock:null,scissors:null,paper:null};state.run=null;state.battle=null;addLog(`${name}が孵化しました。`);pendingType=null;render()}
function collect(){if(!state.active)return;let bonus=state.active.level;state.resources.honey+=5+bonus;state.resources.sap+=3+Math.floor(bonus/2);state.resources.pollen+=4+Math.floor(bonus/2);addLog(`手動回収：蜜+${5+bonus}、樹液+${3+Math.floor(bonus/2)}、花粉+${4+Math.floor(bonus/2)}`);render()}
function levelCost(){let lv=state.active.level;return{honey:Math.floor(14*lv*1.25),sap:Math.floor(8*lv*1.25),pollen:Math.floor(8*lv*1.25)}}
function levelUp(){let c=levelCost();if(Object.entries(c).some(([k,v])=>state.resources[k]<v)){addLog("育成素材が足りません。");render();return}for(let[k,v]of Object.entries(c))state.resources[k]-=v;state.active.level++;addLog(`${state.active.name}がLv.${state.active.level}になりました。`);updateBest();render()}
function rollRelic(src="探索"){let weights=RELIC_POOL.map(r=>r.rarity==="SR"?1:r.rarity==="R"?2.3:4),sum=weights.reduce((a,b)=>a+b,0),roll=Math.random()*sum,p=RELIC_POOL[0];for(let i=0;i<RELIC_POOL.length;i++){roll-=weights[i];if(roll<=0){p=RELIC_POOL[i];break}}let relic={...p,uid:`${p.id}_${Date.now()}_${Math.floor(Math.random()*99999)}`};state.relics.push(relic);addLog(`${src}で形見「${relic.name}」を入手しました。`);return relic}
function equipRelic(uid,hand){let r=rb(uid);if(!r)return;state.equipped[hand]=uid;addLog(`「${r.name}」を${handLabel(hand)}に装備しました。`);render()}
function unequip(hand){let r=eq(hand);state.equipped[hand]=null;if(r)addLog(`「${r.name}」を外しました。`);render()}
function startRun(){if(!state.active)return;if(state.battle){addLog("戦闘中です。");render();return}let st=stats();state.run={floor:1,maxFloor:5,hp:st.hp,maxHp:st.hp,sp:st.maxSp,maxSp:st.maxSp,rewards:{honey:0,sap:0,pollen:0},exp:0};addLog(`${state.active.name}が探索に出発しました。`);document.getElementById("explorePanel").classList.remove("hidden");nextEvent()}
function nextEvent(){if(!state.run||state.battle)return;if(state.run.floor>state.run.maxFloor){completeRun();return}state.active.maxDepth=Math.max(state.active.maxDepth,state.run.floor);updateBest();let event=createExploreEvent();renderEvent(event)}
const FLAVORS={
 battle:["葉陰から小さな羽音が重なって聞こえる。近い。","草むらの奥で何かが跳ねた。敵意は小さいが、数がいる。","花の蜜を狙う影がこちらに気づいた。"],
 strong:["空気が重い。普通の虫ではない気配がする。","古い樹皮の下から、強い殺気が滲み出ている。","踏み込めば危険だが、勝てば得るものは大きい。"],
 heal:["朝露が葉の上で淡く光っている。少し休めそうだ。","柔らかな花粉が舞っている。傷を癒すには良い場所だ。","静かな木漏れ日の下に、安全な葉陰を見つけた。"],
 relic:["抜け殻や翅の欠片が、小さな祭壇のように積もっている。","古い戦いの跡がある。誰かの形見が眠っているかもしれない。","朽木の裂け目に、妙に光る虫の部位が引っかかっている。"],
 none:["風が草を揺らすだけで、何も起こらなかった。","静かすぎる。けれど、危険も報酬もない。","少し歩いたが、収穫はなかった。足音だけが残った。"],
 damage:["足元の葉が急に沈んだ。棘のある茎が隠れている。","粘る糸に足を取られた。強引に抜けるしかない。","突然の雨粒が翅を打つ。体力を削られそうだ。"]
};
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function createExploreEvent(){
 const pool=[
  {kind:"battle",label:"戦闘",title:"ざわめく草むら",text:pick(FLAVORS.battle),weight:26},
  {kind:"strong",label:"強敵との戦闘",title:"危険な気配",text:pick(FLAVORS.strong),weight:13},
  {kind:"heal",label:"回復",title:"朝露の休息地",text:pick(FLAVORS.heal),weight:18},
  {kind:"relic",label:"形見",title:"形見の気配",text:pick(FLAVORS.relic),weight:18},
  {kind:"none",label:"何もなし",title:"静かな小径",text:pick(FLAVORS.none),weight:13},
  {kind:"damage",label:"ダメージを受ける",title:"危ない足場",text:pick(FLAVORS.damage),weight:12},
 ];
 let choices=[];
 while(choices.length<3){
  let total=pool.reduce((s,p)=>s+p.weight,0),r=Math.random()*total,chosen=pool[0];
  for(let p of pool){r-=p.weight;if(r<=0){chosen=p;break}}
  if(!choices.some(c=>c.kind===chosen.kind))choices.push(chosen);
 }
 return {title:"探索先を選ぶ",text:"どの気配を追いますか。選んだ行動の結果が表示されます。",choices:choices.map(c=>[`${c.label}：${c.title}`,()=>resolveExploreChoice(c),c])};
}
function resolveExploreChoice(c){
 if(c.kind==="battle"){modal("戦闘発生",`${c.text}\n\n敵が現れました。`, "⚔️", ()=>startBattle(randomEnemyId()));return}
 if(c.kind==="strong"){modal("強敵出現",`${c.text}\n\n強敵との戦闘に入ります。勝てば報酬と形見の期待値が高めです。`, "💀", ()=>startBattle(randomStrongEnemyId(),true));return}
 if(c.kind==="heal"){let amount=8+Math.floor(Math.random()*8)+Math.floor(state.active.level/2);state.run.hp=Math.min(state.run.maxHp,state.run.hp+amount);addLog(`探索でHPを${amount}回復しました。`);modal("回復",`${c.text}\n\nHPが${amount}回復しました。`, "💧", ()=>advanceNoModal("休息を終えました。"));render();return}
 if(c.kind==="relic"){if(Math.random()<.78){let relic=rollRelic("探索");modal("形見を発見",`${c.text}\n\n「${relic.name}」を入手しました。\n${relic.desc}`, relic.icon, ()=>advanceNoModal("形見を手に入れました。"))}else{addLog("形見を探しましたが、見つかりませんでした。");modal("何も見つからない",`${c.text}\n\n探してみましたが、形見は見つかりませんでした。`, "…", ()=>advanceNoModal("形見は見つかりませんでした。"))}render();return}
 if(c.kind==="none"){modal("何もなし",`${c.text}\n\n今回は収穫も危険もありませんでした。`, "🍃", ()=>advanceNoModal("何も起こりませんでした。"));return}
 if(c.kind==="damage"){let damage=5+Math.floor(Math.random()*8)+Math.floor(state.run.floor/2);state.run.hp-=damage;addLog(`探索中に${damage}ダメージを受けました。`);if(state.run.hp<=0){modal("致命傷",`${c.text}\n\n${damage}ダメージを受けました。`, "💥", ()=>permaDeath("探索中の事故で力尽きました。"))}else{modal("ダメージ",`${c.text}\n\n${damage}ダメージを受けました。`, "💥", ()=>advanceNoModal("傷を負いながら先へ進みました。"))}render();return}
}
function randomEnemyId(){return ENEMIES[Math.floor(Math.random()*ENEMIES.length)].id}
function randomStrongEnemyId(){return STRONG_ENEMIES[Math.floor(Math.random()*STRONG_ENEMIES.length)].id}
function enemyDef(id){return ENEMIES.concat(STRONG_ENEMIES).find(e=>e.id===id)}
function renderEvent(ev){hideBattle();document.getElementById("explorePanel").classList.remove("hidden");document.getElementById("floorText").textContent=`深度 ${state.run.floor} / ${state.run.maxFloor}`;document.getElementById("hpText").textContent=`HP ${state.run.hp}/${state.run.maxHp}　SP ${state.run.sp}/${state.run.maxSp}`;document.getElementById("eventTitle").textContent=ev.title;document.getElementById("eventText").textContent=ev.text;let c=document.getElementById("choices");c.innerHTML="";ev.choices.forEach(([label,fn])=>{let b=document.createElement("button");b.textContent=label;b.onclick=fn;c.appendChild(b)})}
function advanceNoModal(msg){addLog(msg);state.run.floor++;nextEvent();render()}
function completeRun(){for(let[k,v]of Object.entries(state.run.rewards))state.resources[k]+=v;addLog(`${state.active.name}が探索完了。蜜+${state.run.rewards.honey}、樹液+${state.run.rewards.sap}、花粉+${state.run.rewards.pollen}`);state.run=null;state.battle=null;hideExplore();render()}
function scaledEnemy(id,strong=false){let e=enemyDef(id),f=state.run?.floor||1,m=STRONG_ENEMIES.some(x=>x.id===id)?1.25:1;return{...e,strong:STRONG_ENEMIES.some(x=>x.id===id),maxHp:Math.floor((e.hp+(f-1)*5)*m),hp:Math.floor((e.hp+(f-1)*5)*m),atk:Math.floor((e.atk+Math.floor((f-1)*1.5))*m),def:e.def+Math.floor((f-1)*.7)}}
function startBattle(id){let enemy=scaledEnemy(id);state.battle={enemy,playerGuard:0,enemyWeak:0,text:`${enemy.name}が現れた。${enemy.text}`};document.getElementById("explorePanel").classList.add("hidden");document.getElementById("battlePanel").classList.remove("hidden");renderBattle();render()}
function randomHand(){return ["rock","scissors","paper"][Math.floor(Math.random()*3)]}
function handAttack(hand){
 let t=activeType(),st=stats(),b=state.battle,e=b.enemy,relic=eq(hand),eff=relic?.effect||{};
 let enemyHand=randomHand();
 let vs=resultVs(hand,enemyHand);

 if(vs==="win"){
  let dmg=st.atk+(Math.floor(Math.random()*5)-2);
  if(hand===t.hand)dmg=Math.floor(dmg*1.45)+4;
  dmg+=eff.atk||0;
  dmg=Math.max(1,dmg-Math.max(0,e.def-(eff.pierce||0)));
  let crit=Math.random()<st.luck*.025+(eff.crit||0);
  if(crit)dmg=Math.floor(dmg*1.7);
  b.enemy.hp-=dmg;

  let parts=[
   `こちらは${handLabel(hand)}、${e.name}は${handLabel(enemyHand)}。`,
   "じゃんけん勝利。"
  ];
  if(hand===t.hand)parts.push("得意手ボーナス。");
  if(relic)parts.push(`形見「${relic.name}」。`);
  if(crit)parts.push("会心。");
  parts.push(`${e.name}に${dmg}ダメージ。こちらはダメージを受けません。`);
  b.text=parts.join(" ");

  if(eff.heal){
   state.run.hp=Math.min(state.run.maxHp,state.run.hp+eff.heal);
   b.text+=` HP+${eff.heal}。`;
  }
  if(eff.debuff){
   b.enemyWeak=Math.max(b.enemyWeak,eff.debuff);
   b.text+=" 敵の次の攻撃力が少し落ちた。";
  }

  if(b.enemy.hp<=0){winBattle();return}
  renderBattle();render();return;
 }

 if(vs==="lose"){
  let enemyEff=enemyHand===e.hand?1.45:1;
  let atk=Math.floor((e.atk-(b.enemyWeak||0))*enemyEff);
  let dmg=Math.max(1,atk-st.def);
  b.text=[
   `こちらは${handLabel(hand)}、${e.name}は${handLabel(enemyHand)}。`,
   "じゃんけん敗北。",
   enemyHand===e.hand?"敵の得意手ボーナス。":"",
   `${dmg}ダメージを受けました。こちらの攻撃は通りません。`
  ].filter(Boolean).join(" ");
  state.run.hp-=dmg;
  b.enemyWeak=0;

  if(state.run.hp<=0){permaDeath(`${e.name}とのじゃんけんに敗北しました。`);return}
  renderBattle();render();return;
 }

 b.text=`こちらは${handLabel(hand)}、${e.name}も${handLabel(enemyHand)}。あいこです。どちらにもダメージは入りません。`;
 renderBattle();render();
}
function playerDefend(){
 state.battle.text="この版では防御より、じゃんけんの読み合いが優先されます。手を選んでください。";
 renderBattle();render();
}
function playerSkill(){
 state.battle.text="この版では固有スキルより、じゃんけんの勝敗が絶対です。手を選んでください。";
 renderBattle();render();
}
function afterPlayerAction(){}
function enemyTurn(){}
function playerEscape(){let st=stats();if(Math.random()<Math.min(.7,.28+st.luck*.07)){addLog("逃走成功。");state.battle=null;state.run.floor++;nextEvent()}else{state.battle.text="逃げそこねた。";enemyTurn()}}
function winBattle(){let b=state.battle;for(let[k,v]of Object.entries(b.enemy.reward))state.run.rewards[k]+=v;state.run.exp+=b.enemy.exp;state.active.wins++;addLog(`${b.enemy.name}に勝利。経験値+${b.enemy.exp}。`);let dropChance=b.enemy.strong?.72:.42;if(Math.random()<dropChance){let relic=rollRelic("戦闘後");modal("戦利品",`${b.enemy.name}に勝利しました。\n\n形見「${relic.name}」を入手しました。\n${relic.desc}`, relic.icon, ()=>{state.battle=null;state.run.floor++;maybeAutoLevelByExp();updateBest();nextEvent();render()})}else{modal("勝利",`${b.enemy.name}に勝利しました。\n\n素材と経験値を獲得しました。`, "🏆", ()=>{state.battle=null;state.run.floor++;maybeAutoLevelByExp();updateBest();nextEvent();render()})}}
function maybeAutoLevelByExp(){let need=12+state.active.level*5;if(state.run.exp>=need){state.run.exp-=need;state.active.level++;let st=stats();state.run.maxHp=st.hp;state.run.hp=Math.min(st.hp,state.run.hp+12);state.run.maxSp=st.maxSp;state.run.sp=Math.min(st.maxSp,state.run.sp+2);addLog(`${state.active.name}が探索経験でLv.${state.active.level}になりました。`)}}
function permaDeath(reason){let a=state.active,t=activeType();state.graves.unshift({name:a.name,species:t.species,level:a.level,depth:a.maxDepth,wins:a.wins,reason,date:new Date().toLocaleString("ja-JP")});state.graves=state.graves.slice(0,30);addLog(`${a.name}はロストしました。${reason}`);state.active=null;state.relics=[];state.equipped={rock:null,scissors:null,paper:null};state.run=null;state.battle=null;hideExplore();render()}
function retire(){if(!state.active)return;if(confirm(`${state.active.name}を引退させて卵選択に戻りますか？`)){permaDeath("引退しました。")}}
function updateBest(){if(!state.active)return;let b=state.best,a=state.active;if(a.level>b.level||a.maxDepth>b.depth||a.wins>b.wins)state.best={level:Math.max(b.level,a.level),depth:Math.max(b.depth,a.maxDepth),wins:Math.max(b.wins,a.wins),name:a.name}}
function hideBattle(){document.getElementById("battlePanel").classList.add("hidden")}
function hideExplore(){document.getElementById("explorePanel").classList.add("hidden");hideBattle()}
function renderBattle(){if(!state.battle||!state.run)return;let b=state.battle,t=activeType();document.getElementById("playerImg").src=t.img;document.getElementById("playerName").textContent=`${state.active.name} Lv.${state.active.level} / 得意 ${handLabel(t.hand)}`;document.getElementById("enemySprite").textContent=b.enemy.icon;document.getElementById("enemyName").textContent=b.enemy.name;document.getElementById("enemyHandText").textContent=`得意手：${handLabel(b.enemy.hand)}`;document.getElementById("playerHpText").textContent=`HP ${state.run.hp}/${state.run.maxHp}　SP ${state.run.sp}/${state.run.maxSp}`;document.getElementById("enemyHpText").textContent=`HP ${b.enemy.hp}/${b.enemy.maxHp}`;document.getElementById("playerHpBar").style.width=`${Math.max(0,state.run.hp/state.run.maxHp*100)}%`;document.getElementById("enemyHpBar").style.width=`${Math.max(0,b.enemy.hp/b.enemy.maxHp*100)}%`;document.getElementById("battleText").textContent=b.text;let actions=document.getElementById("battleActions");actions.innerHTML="";[[`${handLabel("rock")}を出す`,()=>handAttack("rock")],[`${handLabel("scissors")}を出す`,()=>handAttack("scissors")],[`${handLabel("paper")}を出す`,()=>handAttack("paper")],["逃げる",playerEscape]].forEach(([label,fn])=>{let btn=document.createElement("button");btn.textContent=label;btn.onclick=fn;actions.appendChild(btn)})}
function render(){document.getElementById("honey").textContent=state.resources.honey;document.getElementById("sap").textContent=state.resources.sap;document.getElementById("pollen").textContent=state.resources.pollen;document.getElementById("eggScreen").classList.toggle("hidden",!!state.active||!!pendingType);document.getElementById("nameScreen").classList.toggle("hidden",!pendingType);document.getElementById("gameUI").classList.toggle("hidden",!state.active);renderEggs();if(state.active){renderActive();renderGirl();renderRelics();renderRecord();if(state.battle)renderBattle()}localStorage.setItem(SAVE_KEY,JSON.stringify(state))}
function renderEggs(){let box=document.getElementById("eggCards");box.innerHTML="";TYPES.forEach(t=>{let card=document.createElement("article");card.className="card eggCard";card.innerHTML=`<div class="eggIcon">🥚</div><h3>${t.species}の卵</h3><p class="eggType">得意手：${handLabel(t.hand)}</p><p class="stats">${t.desc}</p><button data-egg="${t.id}">この卵を選ぶ</button>`;box.appendChild(card)});document.querySelectorAll("[data-egg]").forEach(b=>b.onclick=()=>selectEgg(b.dataset.egg))}
function renderActive(){let t=activeType(),st=stats();document.getElementById("runSummary").textContent=`${state.active.name} / ${t.species} / Lv.${state.active.level} / 最高深度 ${state.active.maxDepth} / 勝利 ${state.active.wins}`;document.getElementById("activeGirlBox").innerHTML=`<img src="${t.img}" alt="${state.active.name}"><div><h3>${state.active.name}</h3><p><span class="handBadge">得意手：${handLabel(t.hand)}</span></p><p class="stats">${t.desc}<br>HP ${st.hp} / 攻撃 ${st.atk} / 防御 ${st.def} / 運 ${st.luck} / SP ${st.maxSp}</p></div>`}
function renderGirl(){let t=activeType(),st=stats(),c=levelCost();document.getElementById("girlCard").innerHTML=`<article class="card"><img src="${t.img}" alt="${state.active.name}"><div class="cardTop"><h3>${state.active.name}</h3><span class="level">Lv.${state.active.level}</span></div><p><span class="handBadge">${t.species} / 得意手：${handLabel(t.hand)}</span></p><p class="stats">HP ${st.hp} / 攻撃 ${st.atk} / 防御 ${st.def} / 運 ${st.luck} / SP ${st.maxSp}<br>スキル：${t.skill.name}<br>育成素材：蜜${c.honey} / 樹液${c.sap} / 花粉${c.pollen}</p><button onclick="levelUp()">育成する</button></article>`}
function renderRelics(){let slots=document.getElementById("equipSlots");slots.innerHTML="";["rock","scissors","paper"].forEach(hand=>{let r=eq(hand),div=document.createElement("div");div.className="slot";div.innerHTML=`<h3>${handLabel(hand)}スロット</h3><p>${r?`${r.icon} ${r.name}`:"未装備"}</p><p>${r?r.desc:"この手の攻撃に形見効果を乗せられます。"}</p>${r?`<button data-unequip="${hand}">外す</button>`:""}`;slots.appendChild(div)});document.querySelectorAll("[data-unequip]").forEach(btn=>btn.onclick=()=>unequip(btn.dataset.unequip));let list=document.getElementById("relicList");list.innerHTML="";if(state.relics.length===0){let empty=document.createElement("div");empty.className="panel";empty.innerHTML="<h3>形見なし</h3><p>探索イベントや戦闘後にランダムで入手できます。</p>";list.appendChild(empty);return}state.relics.slice().reverse().forEach(r=>{let equipped=Object.values(state.equipped).includes(r.uid),card=document.createElement("article");card.className="card relicCard"+(equipped?" equipped":"");card.innerHTML=`<div class="relicIcon">${r.icon}</div><div class="cardTop"><h3>${r.name}</h3><span class="rarity">${r.rarity}</span></div><p><span class="handBadge">推奨：${handLabel(r.hand)}</span></p><p class="stats">${r.desc}</p><div class="smallBtns"><button data-equip="${r.uid}" data-hand="rock">グーへ</button><button data-equip="${r.uid}" data-hand="scissors">チョキへ</button><button data-equip="${r.uid}" data-hand="paper">パーへ</button></div>`;list.appendChild(card)});document.querySelectorAll("[data-equip]").forEach(btn=>btn.onclick=()=>equipRelic(btn.dataset.equip,btn.dataset.hand))}
function renderRecord(){document.getElementById("bestRecord").textContent=`最高Lv ${state.best.level} / 最高深度 ${state.best.depth} / 最大勝利数 ${state.best.wins} / 記録保持者 ${state.best.name||"なし"}`;let grave=document.getElementById("graveList");grave.innerHTML="";if(state.graves.length===0){grave.innerHTML='<div class="logItem">まだ墓標はありません。</div>'}else state.graves.forEach(g=>{let d=document.createElement("div");d.className="logItem";d.textContent=`${g.name}（${g.species}） Lv.${g.level} / 深度${g.depth} / 勝利${g.wins} / ${g.reason} / ${g.date}`;grave.appendChild(d)});let log=document.getElementById("logList");log.innerHTML="";state.log.forEach(item=>{let div=document.createElement("div");div.className="logItem";div.textContent=item;log.appendChild(div)})}
document.querySelectorAll(".tab").forEach(tab=>{tab.onclick=()=>{document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));tab.classList.add("active");document.getElementById(tab.dataset.view).classList.add("active")}});
document.getElementById("collectBtn").onclick=collect;
document.getElementById("saveBtn").onclick=save;
document.getElementById("startExploreBtn").onclick=startRun;
document.getElementById("confirmNameBtn").onclick=confirmName;
document.getElementById("retireBtn").onclick=retire;
document.getElementById("resetBtn").onclick=()=>{if(confirm("全データをリセットしますか？")){localStorage.removeItem(SAVE_KEY);pendingType=null;state=defaultState();render()}};
document.getElementById("modalOkBtn").onclick=closeModal;
offlineGain();render();
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
