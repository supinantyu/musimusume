const SAVE_KEY = "mushimusume_rogue_garden_v1";

const GIRLS = [
  {
    id:"butterfly",
    name:"モンシロチョウ娘",
    role:"回復・回避",
    img:"./assets/butterfly.png",
    desc:"おとなしい白い蝶娘。花蜜集めと回復が得意。",
    base:{hp:11, atk:2, def:1, luck:4},
    cost:{honey:14, pollen:8, sap:0}
  },
  {
    id:"beetle",
    name:"カブトムシ娘",
    role:"防御・樹液",
    img:"./assets/beetle.png",
    desc:"頼れる甲虫娘。打たれ強く、樹液探索に強い。",
    base:{hp:17, atk:3, def:4, luck:1},
    cost:{honey:8, pollen:0, sap:14}
  },
  {
    id:"mantis",
    name:"カマキリ娘",
    role:"攻撃・会心",
    img:"./assets/mantis.png",
    desc:"緑髪短髪のヤンキー風お姉さん。攻撃性能が高い。",
    base:{hp:13, atk:5, def:1, luck:2},
    cost:{honey:10, pollen:4, sap:8}
  }
];

let state = load();

function defaultState(){
  const now = Date.now();
  return {
    resources:{honey:20, sap:10, pollen:10},
    girls:Object.fromEntries(GIRLS.map(g=>[g.id,{level:1, exp:0}])),
    lastTick:now,
    log:["ゲーム開始。虫かご庭園に3人の虫娘が集まりました。"],
    run:null
  };
}

function load(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {...defaultState(), ...parsed};
  }catch(e){
    return defaultState();
  }
}

function save(){
  state.lastTick = Date.now();
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  toastLog("保存しました。");
  render();
}

function addLog(text){
  state.log.unshift(text);
  state.log = state.log.slice(0,60);
}

function toastLog(text){
  addLog(text);
}

function offlineGain(){
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - state.lastTick)/1000));
  if(diffSec < 5) return;
  const minutes = Math.min(480, diffSec / 60);
  const gain = {
    honey: Math.floor(minutes * 1.2),
    sap: Math.floor(minutes * 0.7),
    pollen: Math.floor(minutes * 0.9),
  };
  state.resources.honey += gain.honey;
  state.resources.sap += gain.sap;
  state.resources.pollen += gain.pollen;
  if(gain.honey+gain.sap+gain.pollen > 0){
    addLog(`放置報酬：蜜+${gain.honey}、樹液+${gain.sap}、花粉+${gain.pollen}`);
  }
  state.lastTick = now;
}

function statsFor(girlId){
  const girl = GIRLS.find(g=>g.id===girlId);
  const lv = state.girls[girlId].level;
  return {
    hp: girl.base.hp + (lv-1)*3,
    atk: girl.base.atk + Math.floor((lv-1)*1.5),
    def: girl.base.def + Math.floor((lv-1)*1.2),
    luck: girl.base.luck + Math.floor((lv-1)*0.7)
  };
}

function canPay(cost){
  return Object.entries(cost).every(([k,v]) => state.resources[k] >= v);
}

function pay(cost){
  for(const [k,v] of Object.entries(cost)) state.resources[k] -= v;
}

function levelUp(id){
  const girl = GIRLS.find(g=>g.id===id);
  const data = state.girls[id];
  const cost = Object.fromEntries(Object.entries(girl.cost).map(([k,v])=>[k, Math.floor(v * data.level * 1.35)]));
  if(!canPay(cost)){
    addLog(`${girl.name}の育成素材が足りません。`);
    render(); return;
  }
  pay(cost);
  data.level++;
  addLog(`${girl.name}がLv.${data.level}になりました。`);
  render();
}

function collect(){
  const gain = {honey:5, sap:3, pollen:4};
  const bonus = GIRLS.reduce((sum,g)=>sum + state.girls[g.id].level,0);
  state.resources.honey += gain.honey + bonus;
  state.resources.sap += gain.sap + Math.floor(bonus/2);
  state.resources.pollen += gain.pollen + Math.floor(bonus/2);
  addLog(`手動回収：蜜+${gain.honey+bonus}、樹液+${gain.sap+Math.floor(bonus/2)}、花粉+${gain.pollen+Math.floor(bonus/2)}`);
  render();
}

function startRun(){
  const id = document.getElementById("explorerSelect").value;
  const st = statsFor(id);
  state.run = {girlId:id, floor:1, maxFloor:5, hp:st.hp, maxHp:st.hp, rewards:{honey:0,sap:0,pollen:0}};
  addLog(`${GIRLS.find(g=>g.id===id).name}が探索に出発しました。`);
  nextEvent();
}

function nextEvent(){
  if(!state.run) return;
  if(state.run.floor > state.run.maxFloor){
    completeRun();
    return;
  }
  const events = [
    {
      title:"花畑を見つけた",
      text:"甘い香りがする。蜜を集めるか、休むか、奥まで進むか。",
      choices:[
        ["蜜を集める",()=>gainReward({honey:8,pollen:2},"蜜を集めました。")],
        ["少し休む",()=>heal(4,"少し休んでHPを回復しました。")],
        ["奥へ進む",()=>riskReward({honey:14,pollen:6},3,"奥で多めの素材を見つけました。")]
      ]
    },
    {
      title:"朽木の道",
      text:"樹液の匂いがする。足元は少し危ない。",
      choices:[
        ["樹液を採る",()=>gainReward({sap:10},"樹液を採りました。")],
        ["慎重に歩く",()=>advance("慎重に進みました。")],
        ["強引に割る",()=>battle("朽木ムカデ",5,3,{sap:18})]
      ]
    },
    {
      title:"敵の気配",
      text:"草むらが揺れている。戦うか、避けるか。",
      choices:[
        ["戦う",()=>battle("草むらアブラムシ群",4,2,{honey:7,pollen:7})],
        ["回避する",()=>luckCheck("回避成功。静かに通り抜けました。","見つかって少し傷を負いました。",2)],
        ["威嚇する",()=>battle("縄張りハチ",6,3,{honey:5,sap:5,pollen:5})]
      ]
    },
    {
      title:"朝露の泉",
      text:"葉の上にきらめく朝露が溜まっている。",
      choices:[
        ["回復する",()=>heal(7,"朝露でHPが回復しました。")],
        ["花粉を集める",()=>gainReward({pollen:12},"花粉を集めました。")],
        ["祈る",()=>luckyBlessing()]
      ]
    }
  ];
  const ev = events[Math.floor(Math.random()*events.length)];
  renderEvent(ev);
}

function renderEvent(ev){
  document.getElementById("explorePanel").classList.remove("hidden");
  document.getElementById("floorText").textContent = `深度 ${state.run.floor} / ${state.run.maxFloor}`;
  document.getElementById("hpText").textContent = `HP ${state.run.hp} / ${state.run.maxHp}`;
  document.getElementById("eventTitle").textContent = ev.title;
  document.getElementById("eventText").textContent = ev.text;
  const choices = document.getElementById("choices");
  choices.innerHTML = "";
  ev.choices.forEach(([label,fn])=>{
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.onclick = fn;
    choices.appendChild(btn);
  });
}

function advance(msg){
  addLog(msg);
  state.run.floor++;
  nextEvent();
  render();
}

function gainReward(obj,msg){
  for(const [k,v] of Object.entries(obj)) state.run.rewards[k]+=v;
  advance(msg);
}

function heal(amount,msg){
  state.run.hp = Math.min(state.run.maxHp, state.run.hp + amount);
  advance(msg);
}

function riskReward(obj,damage,msg){
  state.run.hp -= damage;
  for(const [k,v] of Object.entries(obj)) state.run.rewards[k]+=v;
  if(state.run.hp <= 0) failRun("無理をしすぎて撤退しました。");
  else advance(`${msg} ただしHP-${damage}`);
}

function luckCheck(success,fail,damage){
  const st = statsFor(state.run.girlId);
  if(Math.random() < Math.min(.75,.32 + st.luck*.08)){
    advance(success);
  }else{
    state.run.hp -= damage;
    if(state.run.hp <= 0) failRun("逃げ切れず撤退しました。");
    else advance(`${fail} HP-${damage}`);
  }
}

function luckyBlessing(){
  const roll = Math.random();
  if(roll < .4) heal(5,"静かな加護でHPが回復しました。");
  else if(roll < .8) gainReward({honey:5,sap:5,pollen:5},"不思議な素材を得ました。");
  else riskReward({pollen:18},4,"強い光を浴びて花粉を得ました。");
}

function battle(enemy, enemyAtk, enemyHp, reward){
  const st = statsFor(state.run.girlId);
  let playerHits = Math.max(1, Math.ceil(enemyHp / Math.max(1, st.atk)));
  let damage = Math.max(1, enemyAtk * playerHits - st.def);
  if(Math.random() < st.luck * .06){
    damage = Math.floor(damage/2);
    addLog("会心の立ち回りで被害を抑えました。");
  }
  state.run.hp -= damage;
  if(state.run.hp <= 0){
    failRun(`${enemy}との戦闘で撤退しました。`);
    return;
  }
  for(const [k,v] of Object.entries(reward)) state.run.rewards[k]+=v;
  advance(`${enemy}に勝利。HP-${damage}`);
}

function completeRun(){
  for(const [k,v] of Object.entries(state.run.rewards)) state.resources[k]+=v;
  const girl = GIRLS.find(g=>g.id===state.run.girlId);
  addLog(`${girl.name}が探索完了。蜜+${state.run.rewards.honey}、樹液+${state.run.rewards.sap}、花粉+${state.run.rewards.pollen}`);
  state.run = null;
  document.getElementById("explorePanel").classList.add("hidden");
  render();
}

function failRun(msg){
  addLog(msg + " 持ち帰り素材は半分になりました。");
  for(const [k,v] of Object.entries(state.run.rewards)){
    state.resources[k] += Math.floor(v/2);
  }
  state.run = null;
  document.getElementById("explorePanel").classList.add("hidden");
  render();
}

function render(){
  document.getElementById("honey").textContent = state.resources.honey;
  document.getElementById("sap").textContent = state.resources.sap;
  document.getElementById("pollen").textContent = state.resources.pollen;

  const gardenGirls = document.getElementById("gardenGirls");
  gardenGirls.innerHTML = "";
  GIRLS.forEach(g=>{
    const d = document.createElement("div");
    d.className = "gardenSprite";
    d.innerHTML = `<img src="${g.img}" alt="${g.name}"><span>${g.name} Lv.${state.girls[g.id].level}</span>`;
    gardenGirls.appendChild(d);
  });

  const cards = document.getElementById("girlCards");
  cards.innerHTML = "";
  GIRLS.forEach(g=>{
    const lv = state.girls[g.id].level;
    const st = statsFor(g.id);
    const cost = Object.fromEntries(Object.entries(g.cost).map(([k,v])=>[k, Math.floor(v * lv * 1.35)]));
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img src="${g.img}" alt="${g.name}">
      <div class="cardTop"><h3>${g.name}</h3><span class="level">Lv.${lv}</span></div>
      <p class="stats">${g.desc}<br>役割：${g.role}<br>HP ${st.hp} / 攻撃 ${st.atk} / 防御 ${st.def} / 運 ${st.luck}</p>
      <p class="stats">育成素材：蜜${cost.honey || 0} / 樹液${cost.sap || 0} / 花粉${cost.pollen || 0}</p>
      <button data-level="${g.id}">育成する</button>
    `;
    cards.appendChild(card);
  });
  document.querySelectorAll("[data-level]").forEach(btn=>{
    btn.onclick = () => levelUp(btn.dataset.level);
  });

  const select = document.getElementById("explorerSelect");
  select.innerHTML = "";
  GIRLS.forEach(g=>{
    const option = document.createElement("option");
    option.value = g.id;
    option.textContent = `${g.name} Lv.${state.girls[g.id].level}`;
    select.appendChild(option);
  });

  const logList = document.getElementById("logList");
  logList.innerHTML = "";
  state.log.forEach(item=>{
    const div = document.createElement("div");
    div.className = "logItem";
    div.textContent = item;
    logList.appendChild(div);
  });

  if(state.run){
    document.getElementById("explorePanel").classList.remove("hidden");
    document.getElementById("floorText").textContent = `深度 ${state.run.floor} / ${state.run.maxFloor}`;
    document.getElementById("hpText").textContent = `HP ${state.run.hp} / ${state.run.maxHp}`;
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

document.querySelectorAll(".tab").forEach(tab=>{
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.view).classList.add("active");
  };
});

document.getElementById("collectBtn").onclick = collect;
document.getElementById("saveBtn").onclick = save;
document.getElementById("startExploreBtn").onclick = startRun;
document.getElementById("resetBtn").onclick = () => {
  if(confirm("セーブデータをリセットしますか？")){
    localStorage.removeItem(SAVE_KEY);
    state = defaultState();
    render();
  }
};

offlineGain();
render();

if("serviceWorker" in navigator){
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
