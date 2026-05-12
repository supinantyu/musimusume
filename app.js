
const SAVE_KEY = "mushimusume_v17_github";
const ENERGY_MAX = 3;
const ENERGY_RECOVER_MS = 20 * 60 * 1000;

const HANDS = {
  rock: { label: "グー", icon: "✊", beats: "scissors" },
  scissors: { label: "チョキ", icon: "✌️", beats: "paper" },
  paper: { label: "パー", icon: "✋", beats: "rock" }
};
const COUNTER_HAND = { rock: "paper", scissors: "rock", paper: "scissors" };
const GROWTH_LABELS = { hp: "HP", def: "防御", rock: "✊", scissors: "✌️", paper: "✋" };
const TRAIN_CONFIG = {
  hp: { material: "honey", materialLabel: "蜜", max: 20, label: "HP", bonus: n => n * 2 },
  def: { material: "sap", materialLabel: "樹液", max: 10, label: "防御", bonus: n => Math.floor(n / 2) },
  rock: { material: "pollen", materialLabel: "花粉", max: 10, label: "✊攻撃", bonus: n => Math.floor(n / 2) },
  scissors: { material: "pollen", materialLabel: "花粉", max: 10, label: "✌️攻撃", bonus: n => Math.floor(n / 2) },
  paper: { material: "pollen", materialLabel: "花粉", max: 10, label: "✋攻撃", bonus: n => Math.floor(n / 2) }
};
const FEEDS = {
  unripe: { id: "unripe", name: "未熟フルーツ", stars: 1, exp: 8, icon: "🍏", desc: "朝露の森でよく見つかる青い果実。少しだけ成長経験値が入る。" },
  ripe: { id: "ripe", name: "完熟フルーツ", stars: 2, exp: 22, icon: "🍎", desc: "甘く熟した果実。食べさせるとしっかり成長する。" },
  super: { id: "super", name: "超熟フルーツ", stars: 3, exp: 55, icon: "🍑", desc: "濃い蜜を含んだ希少な果実。大きく成長経験値が入る。" }
};

const VARIANTS = {
  butterfly: [
    { id: "butterfly_1", label: "陽だまり個体", img: "./assets/characters/butterfly_1.png", trait: "草花の生息地背景つき。" },
    { id: "butterfly_2", label: "鋭翅個体", img: "./assets/characters/butterfly_2.png", trait: "草原の生息地背景つき。" },
    { id: "butterfly_3", label: "幽白個体", img: "./assets/characters/butterfly_3.png", trait: "野花の生息地背景つき。" },
    { id: "butterfly_4", label: "月白個体", img: "./assets/characters/butterfly_4.png", trait: "穏やかな草地背景つき。" }
  ],
  beetle: [
    { id: "beetle_1", label: "長角個体", img: "./assets/characters/beetle_1.png", trait: "樹液の森背景つき。" },
    { id: "beetle_2", label: "双房個体", img: "./assets/characters/beetle_2.png", trait: "明るい雑木林背景つき。" },
    { id: "beetle_3", label: "片影個体", img: "./assets/characters/beetle_3.png", trait: "深い森背景つき。" },
    { id: "beetle_4", label: "眠角個体", img: "./assets/characters/beetle_4.png", trait: "静かな林床背景つき。" }
  ],
  mantis: [
    { id: "mantis_1", label: "荒刃個体", img: "./assets/characters/mantis_1.png", trait: "緑の草むら背景つき。" },
    { id: "mantis_2", label: "疾風個体", img: "./assets/characters/mantis_2.png", trait: "明るい草地背景つき。" },
    { id: "mantis_3", label: "双角個体", img: "./assets/characters/mantis_3.png", trait: "濃い下草背景つき。" },
    { id: "mantis_4", label: "枯葉個体", img: "./assets/characters/mantis_4.png", trait: "枯草と落ち葉の背景つき。" }
  ]
};
const TYPES = [
  {
    id: "butterfly", species: "モンシロチョウ娘", role: "回復・パー成長", img: "./assets/characters/butterfly_1.png",
    desc: "おとなしい白い蝶娘。HPとパー攻撃が伸びやすい。",
    base: { hp: 34, def: 3, rock: 7, scissors: 7, paper: 9 },
    growth: { hp: 3, def: 2, rock: 2, scissors: 2, paper: 3 },
    trait: { name: "白愛の翅", desc: "探索中一回だけ、戦闘時に『にげる』を選ぶとHPを小回復する。", escapeHealRate: 0.12 }
  },
  {
    id: "beetle", species: "カブトムシ娘", role: "耐久・パー成長", img: "./assets/characters/beetle_1.png",
    desc: "頼れる甲虫娘。HP・防御・パー攻撃が伸びやすい。",
    base: { hp: 44, def: 5, rock: 7, scissors: 7, paper: 10 },
    growth: { hp: 3, def: 3, rock: 2, scissors: 2, paper: 4 },
    trait: { name: "兜の誇り", desc: "✌️技を受けた時のダメージが少し多くなる。", scissorsTakenMult: 1.2 }
  },
  {
    id: "mantis", species: "カマキリ娘", role: "攻撃・チョキ成長", img: "./assets/characters/mantis_1.png",
    desc: "緑髪の戦闘的な虫娘。チョキ攻撃が特に伸びやすい。",
    base: { hp: 30, def: 3, rock: 9, scissors: 11, paper: 8 },
    growth: { hp: 2, def: 2, rock: 3, scissors: 4, paper: 3 },
    trait: { name: "暴食", desc: "レベルアップに必要な経験値が少し多い。", expCostMult: 1.2 }
  }
];

const ENEMIES = [
  { id: "aphid", name: "アブラムシ群", img: "./assets/enemies/aphid_swarm.png", hand: "rock", iq: 1, hp: 26, atk: 6, def: 1, reward: { honey: 12, sap: 1, pollen: 8 }, exp: 5, text: "小さな敵が群れでまとわりつく。", rewardText: "蜜・花粉が多め。" },
  { id: "wasp", name: "縄張りハチ", img: "./assets/enemies/territorial_bee.png", hand: "scissors", iq: 2, hp: 30, atk: 8, def: 1, reward: { honey: 14, sap: 2, pollen: 5 }, exp: 7, text: "鋭い羽音が近づいてくる。", rewardText: "蜜が多め。" },
  { id: "centipede", name: "朽木ムカデ", img: "./assets/enemies/rotten_centipede.png", hand: "rock", iq: 1, hp: 36, atk: 9, def: 2, reward: { honey: 2, sap: 16, pollen: 3 }, exp: 8, text: "朽木の隙間から危険な影が這い出した。", rewardText: "樹液が多め。" },
  { id: "spider", name: "網張りグモ", img: "./assets/enemies/web_spider.png", hand: "paper", iq: 3, hp: 34, atk: 7, def: 3, reward: { honey: 5, sap: 8, pollen: 13 }, exp: 8, text: "粘る糸が行く手をふさいでいる。", rewardText: "花粉・樹液が多め。" }
];
const STRONG_ENEMIES = [
  { id: "hornet", name: "怒れるスズメバチ", img: "./assets/enemies/angry_hornet.png", hand: "scissors", iq: 2, hp: 54, atk: 13, def: 3, reward: { honey: 24, sap: 8, pollen: 10 }, exp: 15, text: "黒と黄色の影が低い羽音を響かせている。", rewardText: "蜜大量。エサも出やすい。" },
  { id: "nightstag", name: "夜闇クワガタ", img: "./assets/enemies/night_stag.png", hand: "scissors", iq: 2, hp: 62, atk: 12, def: 6, reward: { honey: 8, sap: 26, pollen: 8 }, exp: 16, text: "巨大な大顎が暗く光っている。", rewardText: "樹液大量。形見抽選あり。" },
  { id: "oldspider", name: "古巣の大蜘蛛", img: "./assets/enemies/old_nest_spider.png", hand: "paper", iq: 4, hp: 64, atk: 11, def: 6, reward: { honey: 10, sap: 14, pollen: 26 }, exp: 17, text: "古い巣の主が静かに睨んでいる。", rewardText: "花粉・樹液多め。高IQ。" }
];

const RELIC_DEFS = [
  { id: "beetle_shell", name: "カナブンの甲殻", hand: "rock", iconBase: "beetle", effectText: "✊あいこ時、相手にダメージ。", tiers: { 1: 0.2, 2: 0.3, 3: 0.5 } },
  { id: "mantis_foreleg", name: "古い鎌脚", hand: "scissors", iconBase: "mantis", effectText: "✌️勝利時、30%の確率で追撃ダメージ。", tiers: { 1: 0.5, 2: 0.6, 3: 0.8 } },
  { id: "cicada_shell", name: "セミの抜け殻", hand: "paper", iconBase: "cicada", effectText: "✋敗北時、受けるダメージを軽減。", tiers: { 1: 0.1, 2: 0.2, 3: 0.5 } }
];

const PLACE_EVENTS = [
  { id: "grass", label: "草むら", title: "ざわめく草むら", text: "背の高い草が揺れている。何かが潜んでいそうだ。", weights: { battle: 28, strong: 6, heal: 8, relic: 4, feed: 22, none: 21, damage: 11 }, mood: "草をかき分けて進みます。" },
  { id: "spring", label: "泉のほとり", title: "静かな泉のほとり", text: "澄んだ水がきらめいている。癒やしにも罠にも見える。", weights: { battle: 12, strong: 3, heal: 36, relic: 3, feed: 22, none: 19, damage: 5 }, mood: "水辺に近づいて気配を探ります。" },
  { id: "tree", label: "木の上", title: "樹液の香る木", text: "樹液の匂いに、甲虫や外敵が集まってきそうだ。", weights: { battle: 26, strong: 14, heal: 6, relic: 7, feed: 16, none: 17, damage: 14 }, mood: "幹をよじ登って調べます。" },
  { id: "cave", label: "洞穴", title: "湿った洞穴", text: "薄暗くひんやりした穴。奥から不穏な気配が漏れている。", weights: { battle: 30, strong: 22, heal: 4, relic: 7, feed: 9, none: 13, damage: 15 }, mood: "暗がりへ足を踏み入れます。" },
  { id: "fallen", label: "倒木の裏", title: "倒木の裏側", text: "苔むした倒木の裏には、小さな生命の痕跡がある。", weights: { battle: 22, strong: 10, heal: 8, relic: 8, feed: 24, none: 18, damage: 10 }, mood: "倒木を慎重に持ち上げます。" },
  { id: "flowers", label: "花畑", title: "白い花の群生地", text: "蜜の匂いが漂う穏やかな場所。食べられる果実も見つかるかもしれない。", weights: { battle: 15, strong: 4, heal: 22, relic: 4, feed: 31, none: 18, damage: 6 }, mood: "花の間を静かに進みます。" },
  { id: "roots", label: "木の根元", title: "古い木の根元", text: "根の隙間には抜け殻や欠片が溜まりやすい。", weights: { battle: 24, strong: 12, heal: 7, relic: 9, feed: 18, none: 19, damage: 11 }, mood: "根の周りを丁寧に探ります。" },
  { id: "sunny", label: "日だまり", title: "あたたかな日だまり", text: "日差しが柔らかい。ひと息つくには悪くない場所だ。", weights: { battle: 10, strong: 2, heal: 28, relic: 2, feed: 23, none: 30, damage: 5 }, mood: "しばらく周囲を見渡します。" },
  { id: "web", label: "糸のかかった枝", title: "糸のかかった枝", text: "蜘蛛の気配がありそうな危うい枝。果実や痕跡もあるかもしれない。", weights: { battle: 28, strong: 12, heal: 4, relic: 4, feed: 11, none: 17, damage: 24 }, mood: "糸を避けながら進みます。" }
];
const OUTCOME_TEXT = {
  battle: ["草の奥から敵意ある気配が飛び出した。", "足元で何かが弾け、敵が姿を現した。", "静けさが破れ、小さな影が襲いかかってきた。"],
  strong: ["空気が重くなる。これは普通の敵ではない。", "危険な主が縄張りを守るように立ちはだかった。", "一歩踏み込んだ瞬間、強敵と目が合った。"],
  heal: ["敵の気配はない。短い休息が取れそうだ。", "湿った空気が傷をゆっくり癒してくれる。", "安全な場所を見つけ、少し息を整えられた。"],
  relic: ["古い虫の痕跡が残っている。", "葉の下で、形見になりそうな遺物が光っている。", "朽ちた跡の中に、不思議な力を感じる欠片がある。"],
  none: ["しばらく調べたが、特に何も起こらなかった。", "風が通り抜けるだけで、収穫も危険もなかった。", "気配はあったが、すぐに消えた。今回は何もない。"],
  damage: ["足元の棘や枝で身体を傷つけてしまった。", "急な物音に驚き、無理な動きで体力を削られた。", "隠れていた障害物に引っかかり負傷した。"],
  feed: ["葉の陰に果実が実っている。", "甘い香りのする小さな果実を見つけた。", "朝露を含んだ果実が転がっている。"]
};

let pendingType = null;
let pendingModalAction = null;
let currentEvent = null;
let state = load();

function defaultState() {
  return {
    resources: { honey: 30, sap: 16, pollen: 16 },
    active: null,
    relics: [],
    equipped: { rock: null, scissors: null, paper: null },
    feeds: { unripe: 0, ripe: 0, super: 0 },
    energy: { value: ENERGY_MAX, updatedAt: Date.now() },
    best: { level: 0, depth: 0, wins: 0, name: "" },
    graves: [],
    log: ["卵を選んで挑戦を開始してください。"],
    run: null,
    battle: null
  };
}
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    const loaded = raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    if (!loaded.energy) loaded.energy = { value: ENERGY_MAX, updatedAt: Date.now() };
    return loaded;
  } catch (e) {
    return defaultState();
  }
}
function save(silent = false) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  if (!silent) addLog("保存しました。");
}
function addLog(text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, 120);
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid(prefix) { return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 99999)}`; }
function stars5(n) { return "⭐️".repeat(n) + "☆".repeat(5 - n); }
function stars3(n) { return "⭐️".repeat(n); }
function feedStars(feed) { return "★".repeat(feed.stars) + "☆".repeat(3 - feed.stars); }
function typeDef(id) { return TYPES.find(t => t.id === id); }
function activeType() { return state.active ? typeDef(state.active.typeId) : null; }
function activeImage() { return state.active?.variantImg || activeType()?.img || "./assets/characters/butterfly_1.png"; }
function handLabel(hand) { return `${HANDS[hand].icon} ${HANDS[hand].label}`; }
function handResult(a, b) { return a === b ? "draw" : HANDS[a].beats === b ? "win" : "lose"; }
function relicByUid(id) { return state.relics.find(r => r.uid === id); }
function equippedRelic(hand) { return relicByUid(state.equipped[hand]); }
function randomVariant(typeId) {
  const list = VARIANTS[typeId] || [];
  return pick(list) || { id: `${typeId}_1`, label: "標準個体", img: `./assets/characters/${typeId}_1.png`, trait: "標準的な個体。" };
}
function ensureFeeds() {
  if (!state.feeds) state.feeds = { unripe: 0, ripe: 0, super: 0 };
}
function updateEnergy() {
  if (!state.energy) state.energy = { value: ENERGY_MAX, updatedAt: Date.now() };
  const now = Date.now();
  if (state.energy.value >= ENERGY_MAX) {
    state.energy.value = ENERGY_MAX;
    state.energy.updatedAt = now;
    return;
  }
  const elapsed = now - state.energy.updatedAt;
  const gained = Math.floor(elapsed / ENERGY_RECOVER_MS);
  if (gained > 0) {
    state.energy.value = Math.min(ENERGY_MAX, state.energy.value + gained);
    state.energy.updatedAt += gained * ENERGY_RECOVER_MS;
    if (state.energy.value >= ENERGY_MAX) state.energy.updatedAt = now;
  }
}
function nextEnergyText() {
  updateEnergy();
  if (state.energy.value >= ENERGY_MAX) return "全回復中";
  const remain = Math.max(0, ENERGY_RECOVER_MS - (Date.now() - state.energy.updatedAt));
  const min = Math.ceil(remain / 60000);
  return `次の回復まで約${min}分`;
}
function consumeEnergy() {
  updateEnergy();
  if (state.energy.value <= 0) return false;
  state.energy.value -= 1;
  if (state.energy.value < ENERGY_MAX) state.energy.updatedAt = Date.now();
  return true;
}
function trainCostForCount(count) {
  const next = count + 1;
  if (next <= 5) return 10;
  if (next <= 10) return 15;
  return 20;
}
function statValue(base, growthStar, level, trained, kind) {
  const l = Math.max(0, level - 1);
  const tBonus = TRAIN_CONFIG[kind]?.bonus ? TRAIN_CONFIG[kind].bonus(trained) : 0;
  if (kind === "hp") return base + Math.round(l * (3 + growthStar * 1.5)) + tBonus;
  if (kind === "def") return base + Math.floor(l * (0.25 + growthStar * 0.28)) + tBonus;
  return base + Math.floor(l * (0.6 + growthStar * 0.42)) + tBonus;
}
function stats() {
  if (!state.active) return { hp: 0, def: 0, rock: 0, scissors: 0, paper: 0 };
  const t = activeType();
  const lv = state.active.level;
  const tr = state.active.training || { hp: 0, def: 0, rock: 0, scissors: 0, paper: 0 };
  return {
    hp: statValue(t.base.hp, t.growth.hp, lv, tr.hp || 0, "hp"),
    def: statValue(t.base.def, t.growth.def, lv, tr.def || 0, "def"),
    rock: statValue(t.base.rock, t.growth.rock, lv, tr.rock || 0, "rock"),
    scissors: statValue(t.base.scissors, t.growth.scissors, lv, tr.scissors || 0, "scissors"),
    paper: statValue(t.base.paper, t.growth.paper, lv, tr.paper || 0, "paper")
  };
}
function strongestPlayerHand() {
  const st = stats();
  const hands = ["rock", "scissors", "paper"];
  return hands.sort((a, b) => st[b] - st[a])[0];
}
function decideEnemyHand(enemy) {
  const iq = enemy.iq || 1;
  const hands = ["rock", "scissors", "paper"];
  const preferred = state.battle.lastPlayerWinHand
    ? COUNTER_HAND[state.battle.lastPlayerWinHand]
    : COUNTER_HAND[strongestPlayerHand()];
  const antiRead = COUNTER_HAND[COUNTER_HAND[preferred]];
  const r = Math.random();
  let chosen = preferred;
  if (iq <= 1) {
    chosen = r < 0.72 ? preferred : pick(hands.filter(h => h !== preferred));
  } else if (iq === 2) {
    chosen = r < 0.58 ? preferred : r < 0.78 ? enemy.hand : pick(hands.filter(h => h !== preferred));
  } else if (iq === 3) {
    chosen = r < 0.46 ? preferred : r < 0.72 ? antiRead : enemy.hand;
  } else {
    chosen = r < 0.38 ? preferred : r < 0.72 ? antiRead : pick(hands);
  }
  return chosen;
}
function nextLevelExp() {
  if (!state.active) return 0;
  const t = activeType();
  const mult = t.trait?.expCostMult || 1;
  return Math.round((28 + state.active.level * 18) * mult);
}
function giveExp(amount) {
  if (!state.active) return 0;
  state.active.feedExp = state.active.feedExp || 0;
  state.active.feedExp += amount;
  let leveled = 0;
  while (state.active.feedExp >= nextLevelExp()) {
    state.active.feedExp -= nextLevelExp();
    state.active.level += 1;
    leveled += 1;
  }
  updateBest();
  return leveled;
}
function useFeed(id) {
  ensureFeeds();
  const feed = FEEDS[id];
  if (!feed || !state.active) return;
  if ((state.feeds[id] || 0) <= 0) {
    modal("エサ不足", `${feed.name}を持っていません。探索で探しましょう。`, "🍽️");
    return;
  }
  state.feeds[id] -= 1;
  const before = state.active.level;
  const leveled = giveExp(feed.exp);
  if (leveled > 0) {
    addLog(`${state.active.name}に${feed.name}を与え、Lv.${before} → Lv.${state.active.level}になりました。`);
    modal("レベルアップ", `${state.active.name}に${feedStars(feed)}「${feed.name}」を与えました。\n経験値 +${feed.exp}\n\nLv.${before} → Lv.${state.active.level} に成長しました。`, "✨", render);
  } else {
    addLog(`${state.active.name}に${feed.name}を与えました。経験値+${feed.exp}`);
    modal("エサを与えた", `${state.active.name}に${feedStars(feed)}「${feed.name}」を与えました。\n経験値 +${feed.exp}\n次のLvまで ${Math.max(0, nextLevelExp() - (state.active.feedExp || 0))}`, "🍽️", render);
  }
  save(true);
  render();
}
function collect() {
  if (!state.active) return;
  const lv = state.active.level;
  const gain = { honey: 4 + lv, sap: 2 + Math.floor(lv / 2), pollen: 2 + Math.floor(lv / 2) };
  state.resources.honey += gain.honey;
  state.resources.sap += gain.sap;
  state.resources.pollen += gain.pollen;
  addLog(`素材を回収：蜜+${gain.honey}、樹液+${gain.sap}、花粉+${gain.pollen}`);
  save(true);
  render();
}
function trainStat(stat) {
  if (!state.active) return;
  const conf = TRAIN_CONFIG[stat];
  const tr = state.active.training || { hp: 0, def: 0, rock: 0, scissors: 0, paper: 0 };
  const count = tr[stat] || 0;
  if (count >= conf.max) {
    modal("訓練上限", `${conf.label}訓練は上限です。`, "🌱");
    return;
  }
  const cost = trainCostForCount(count);
  if (state.resources[conf.material] < cost) {
    modal("素材不足", `${conf.label}訓練には${conf.materialLabel}${cost}が必要です。`, "🌱");
    return;
  }
  state.resources[conf.material] -= cost;
  state.active.training = tr;
  state.active.training[stat] = count + 1;
  addLog(`${state.active.name}の${conf.label}を訓練しました。${conf.materialLabel}-${cost}`);
  save(true);
  render();
}
function updateBest() {
  if (!state.active) return;
  if (state.active.level > (state.best.level || 0)) { state.best.level = state.active.level; state.best.name = state.active.name; }
  if (state.active.maxDepth > (state.best.depth || 0)) state.best.depth = state.active.maxDepth;
  if (state.active.wins > (state.best.wins || 0)) state.best.wins = state.active.wins;
}
function selectEgg(id) {
  pendingType = id;
  const t = typeDef(id);
  document.getElementById("eggScreen").classList.add("hidden");
  document.getElementById("nameScreen").classList.remove("hidden");
  document.getElementById("nameTitle").textContent = `${t.species}が孵りました`;
  document.getElementById("namePreview").src = t.img;
  document.getElementById("nameInput").value = t.species;
}
function confirmName() {
  if (!pendingType) return;
  const t = typeDef(pendingType);
  const name = document.getElementById("nameInput").value.trim() || t.species;
  const v = randomVariant(t.id);
  state.active = {
    typeId: t.id, name,
    variantId: v.id, variantLabel: v.label, variantTrait: v.trait, variantImg: v.img,
    level: 1, feedExp: 0, wins: 0, maxDepth: 0,
    training: { hp: 0, def: 0, rock: 0, scissors: 0, paper: 0 }
  };
  state.relics = [];
  state.equipped = { rock: null, scissors: null, paper: null };
  state.run = null;
  state.battle = null;
  addLog(`${name}が孵化しました。個体：${state.active.variantLabel}`);
  pendingType = null;
  document.getElementById("nameScreen").classList.add("hidden");
  save(true);
  render();
}
function retireCurrent() {
  if (!state.active) return;
  if (!confirm(`${state.active.name}を引退させますか？`)) return;
  state.graves.unshift({ name: state.active.name, species: activeType().species, variant: state.active.variantLabel || "標準個体", level: state.active.level, depth: state.active.maxDepth, wins: state.active.wins, reason: "引退", date: new Date().toLocaleString("ja-JP") });
  state.graves = state.graves.slice(0, 30);
  addLog(`${state.active.name}を引退させました。`);
  state.active = null; state.relics = []; state.equipped = { rock: null, scissors: null, paper: null }; state.run = null; state.battle = null;
  save(true);
  render();
}
function resetAll() {
  if (!confirm("全データをリセットしますか？")) return;
  localStorage.removeItem(SAVE_KEY);
  state = defaultState();
  render();
}
function rollFeed(source = "探索", strong = false) {
  ensureFeeds();
  const r = Math.random();
  let id = "unripe";
  if (strong) {
    if (r < 0.10) id = "super";
    else if (r < 0.42) id = "ripe";
  } else {
    if (r < 0.05) id = "super";
    else if (r < 0.30) id = "ripe";
  }
  const feed = FEEDS[id];
  state.feeds[id] = (state.feeds[id] || 0) + 1;
  addLog(`${source}で${feedStars(feed)}「${feed.name}」を入手しました。`);
  return feed;
}
function rollRelic(source = "探索") {
  const def = pick(RELIC_DEFS);
  const starRoll = Math.random();
  const stars = starRoll < 0.08 ? 3 : starRoll < 0.38 ? 2 : 1;
  const mult = def.tiers[stars];
  const relic = {
    uid: uid(def.id), defId: def.id, name: def.name, hand: def.hand, stars,
    multiplier: mult, icon: `./assets/relics/${def.iconBase}_${stars}.png`,
    desc: `${def.effectText} ${stars3(stars)}（${mult}倍）`,
    effectText: def.effectText
  };
  state.relics.push(relic);
  addLog(`${source}で形見「${relic.name}」${stars3(stars)}を入手しました。`);
  return relic;
}
function equipRelic(uid) {
  const relic = relicByUid(uid);
  if (!relic) return;
  state.equipped[relic.hand] = relic.uid;
  addLog(`「${relic.name}」を${handLabel(relic.hand)}に装備しました。`);
  save(true);
  render();
}
function unequip(hand) {
  const relic = equippedRelic(hand);
  state.equipped[hand] = null;
  if (relic) addLog(`「${relic.name}」を外しました。`);
  save(true);
  render();
}
function startRun() {
  if (!state.active || state.battle || state.run) return;
  updateEnergy();
  if (!consumeEnergy()) {
    modal("探索力不足", `探索力が足りません。\n${nextEnergyText()}`, "⏳");
    return;
  }
  const st = stats();
  state.run = {
    floor: 1, maxFloor: 6,
    hp: st.hp, maxHp: st.hp,
    rewards: { honey: 0, sap: 0, pollen: 0 },
    relicFound: false,
    flags: { butterflyEscapeUsed: false }
  };
  state.battle = null;
  addLog(`${state.active.name}が朝露の森へ探索に出発しました。探索力-1`);
  nextEvent();
  save(true);
  render();
}
function completeRun() {
  const r = state.run;
  if (!r) return;
  state.resources.honey += r.rewards.honey;
  state.resources.sap += r.rewards.sap;
  state.resources.pollen += r.rewards.pollen;
  addLog(`探索成功。蜜+${r.rewards.honey} / 樹液+${r.rewards.sap} / 花粉+${r.rewards.pollen}`);
  state.run = null;
  state.battle = null;
  save(true);
  modal("探索完了", `朝露の森の探索を終えました。\n\n獲得素材\n蜜 +${r.rewards.honey}\n樹液 +${r.rewards.sap}\n花粉 +${r.rewards.pollen}`, "🏁", render);
}
function randomEnemy(strong = false) {
  const pool = strong ? STRONG_ENEMIES : ENEMIES;
  const base = { ...pick(pool) };
  const floor = state.run?.floor || 1;
  base.hp += strong ? floor * 4 : floor * 2;
  base.atk += strong ? Math.floor(floor * 0.9) : Math.floor(floor * 0.4);
  base.def += strong ? Math.floor(floor * 0.4) : Math.floor(floor * 0.2);
  base.strong = strong;
  return base;
}
function startBattle(strong = false) {
  const enemy = randomEnemy(strong);
  state.battle = { enemy, enemyHp: enemy.hp, text: `${enemy.name}が現れた。${enemy.text}`, turn: 1, lastPlayerWinHand: null, lastEnemyHand: null };
  addLog(`${enemy.name}と戦闘になりました。`);
  render();
}
function weightedOutcome(weights) {
  const entries = Object.entries(weights);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  let r = Math.random() * total;
  for (const [k, v] of entries) { r -= v; if (r <= 0) return k; }
  return entries[0][0];
}
function createExploreEvent() {
  const pool = [...PLACE_EVENTS];
  const choices = [];
  while (choices.length < 3 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    const place = pool.splice(idx, 1)[0];
    choices.push(place);
  }
  return { title: "どこを探索する？", text: "行き先だけが分かります。何が起こるかは、踏み込んでからのお楽しみです。", choices };
}
function nextEvent() {
  if (!state.run || state.battle) return;
  if (state.run.floor > state.run.maxFloor) { completeRun(); return; }
  state.active.maxDepth = Math.max(state.active.maxDepth, state.run.floor);
  updateBest();
  currentEvent = createExploreEvent();
  render();
}
function resolvePlaceChoice(place) {
  const outcome = weightedOutcome(place.weights);
  const intro = `${place.title}\n${place.text}\n\n${place.mood}\n\n${pick(OUTCOME_TEXT[outcome])}`;
  if (outcome === "battle") {
    modal("遭遇", `${intro}\n\n戦闘に入ります。`, "⚔️", () => { startBattle(false); render(); });
    return;
  }
  if (outcome === "strong") {
    modal("危険な遭遇", `${intro}\n\n強敵との戦闘に入ります。`, "💀", () => { startBattle(true); render(); });
    return;
  }
  if (outcome === "heal") {
    const amount = 8 + Math.floor(Math.random() * 8) + Math.floor(state.active.level / 2);
    state.run.hp = Math.min(state.run.maxHp, state.run.hp + amount);
    addLog(`${place.label}でHPを${amount}回復しました。`);
    modal("休息", `${intro}\n\nHPが${amount}回復しました。`, "💧", () => advanceFloor(`${place.label}で休息しました。`));
    render();
    return;
  }
  if (outcome === "feed") {
    const feed = rollFeed(place.label);
    modal("エサを発見", `${intro}\n\n${feedStars(feed)}「${feed.name}」を入手しました。\n${feed.desc}`, "🍽️", () => advanceFloor(`${place.label}で${feed.name}を手に入れました。`));
    render();
    return;
  }
  if (outcome === "relic") {
    if (!state.run.relicFound && Math.random() < 0.4) {
      const relic = rollRelic(place.label);
      state.run.relicFound = true;
      modal("形見を発見", `${intro}\n\n「${relic.name}」${stars3(relic.stars)}を入手しました。\n${relic.desc}`, "🧿", () => advanceFloor(`${place.label}で形見を手に入れました。`));
    } else {
      addLog(`${place.label}を探しましたが、持ち帰れる形見は見つかりませんでした。`);
      modal("痕跡だけ", `${intro}\n\n何かの痕跡はありましたが、持ち帰れるものはありませんでした。`, "…", () => advanceFloor(`${place.label}では何も得られませんでした。`));
    }
    render();
    return;
  }
  if (outcome === "damage") {
    const damage = 5 + Math.floor(Math.random() * 8) + Math.floor(state.run.floor / 2);
    state.run.hp -= damage;
    addLog(`${place.label}で${damage}ダメージを受けました。`);
    if (state.run.hp <= 0) {
      modal("致命傷", `${intro}\n\n${damage}ダメージを受けました。`, "💥", () => permaDeath(`${place.label}で力尽きました。`));
    } else {
      modal("負傷", `${intro}\n\n${damage}ダメージを受けました。`, "💥", () => advanceFloor(`${place.label}で傷を負いながら進みました。`));
    }
    render();
    return;
  }
  modal("何もなし", `${intro}\n\n今回は収穫も危険もありませんでした。`, "🍃", () => advanceFloor(`${place.label}では何も起こりませんでした。`));
}
function advanceFloor(logText = "") {
  if (logText) addLog(logText);
  if (state.run) state.run.floor += 1;
  nextEvent();
  render();
}
function applyRelicEffect(hand, outcome, incomingDamage) {
  const relic = equippedRelic(hand);
  const st = stats();
  const messages = [];
  let bonusDamage = 0;
  let reduced = incomingDamage;
  if (!relic) return { bonusDamage, incomingDamage: reduced, messages };
  if (relic.defId === "beetle_shell" && hand === "rock" && outcome === "draw") {
    bonusDamage = Math.max(1, Math.round(st.rock * relic.multiplier));
    messages.push(`カナブンの甲殻が反応し、${bonusDamage}の追加ダメージ。`);
  }
  if (relic.defId === "mantis_foreleg" && hand === "scissors" && outcome === "win" && Math.random() < 0.3) {
    bonusDamage = Math.max(1, Math.round(st.scissors * relic.multiplier));
    messages.push(`古い鎌脚が発動。30%追撃で${bonusDamage}ダメージ。`);
  }
  if (relic.defId === "cicada_shell" && hand === "paper" && outcome === "lose") {
    const cut = Math.round(incomingDamage * relic.multiplier);
    reduced = Math.max(0, incomingDamage - cut);
    messages.push(`セミの抜け殻が砕け、被ダメージを${incomingDamage - reduced}軽減。`);
  }
  return { bonusDamage, incomingDamage: reduced, messages };
}
function battleAct(hand) {
  if (!state.battle || !state.run || !state.active) return;
  const st = stats();
  const enemy = state.battle.enemy;
  const enemyHand = decideEnemyHand(enemy);
  const result = handResult(hand, enemyHand);
  const attackStat = st[hand];
  const resultMult = result === "win" ? 1.2 : result === "draw" ? 1.0 : 0.78;
  const enemyMult = result === "win" ? 0.62 : result === "draw" ? 0.92 : 1.2;
  let dealt = Math.max(1, Math.round(attackStat * resultMult - enemy.def));
  let incoming = Math.max(0, Math.round(enemy.atk * enemyMult - st.def * 0.45));
  const trait = activeType().trait || {};
  if (trait.scissorsTakenMult && enemyHand === "scissors") {
    incoming = Math.round(incoming * trait.scissorsTakenMult);
  }
  const relicInfo = applyRelicEffect(hand, result, incoming);
  incoming = relicInfo.incomingDamage;
  dealt += relicInfo.bonusDamage;
  state.battle.enemyHp -= dealt;
  state.run.hp -= incoming;
  state.battle.lastEnemyHand = enemyHand;
  state.battle.lastPlayerWinHand = result === "win" ? hand : null;
  state.battle.turn += 1;
  let reason = state.battle.turn <= 2 ? `初手は虫娘の高い攻撃を警戒。` : `直前の勝ち手を意識。`;
  if (enemy.iq >= 3) reason += ` IQ${enemy.iq}なので読み外しも混ぜます。`;
  let msg = `${handLabel(hand)}で攻撃。相手は${handLabel(enemyHand)}。\n判定：${result === "win" ? "勝利" : result === "draw" ? "あいこ" : "敗北"}\n敵AI：${reason}\n与ダメージ ${dealt}`;
  if (incoming > 0) msg += ` / 被ダメージ ${incoming}`;
  else msg += ` / 被ダメージ 0`;
  if (relicInfo.messages.length) msg += `\n${relicInfo.messages.join("\n")}`;
  state.battle.text = msg;
  addLog(`${state.active.name}は${enemy.name}に${dealt}ダメージ。`);
  if (state.battle.enemyHp <= 0) {
    winBattle();
    return;
  }
  if (state.run.hp <= 0) {
    permaDeath(`${enemy.name}との戦闘に敗北しました。`);
    return;
  }
  save(true);
  render();
}
function escapeBattle() {
  if (!state.battle || !state.run || !state.active) return;
  const trait = activeType().trait || {};
  let text = `${state.active.name}は戦闘から離脱しました。`;
  if (trait.escapeHealRate && !state.run.flags.butterflyEscapeUsed) {
    const heal = Math.max(1, Math.round(state.run.maxHp * trait.escapeHealRate));
    state.run.hp = Math.min(state.run.maxHp, state.run.hp + heal);
    state.run.flags.butterflyEscapeUsed = true;
    text += `\n白愛の翅が発動し、HPを${heal}回復。`;
    addLog(`白愛の翅でHPを${heal}回復しました。`);
  }
  state.battle = null;
  modal("にげる", text, "🏃", () => advanceFloor("戦闘から離脱しました。"));
  render();
}
function winBattle() {
  const b = state.battle;
  const r = state.run;
  const enemy = b.enemy;
  for (const [k, v] of Object.entries(enemy.reward)) r.rewards[k] += v;
  state.active.wins += 1;
  addLog(`${enemy.name}に勝利しました。`);
  let bonusText = `獲得素材：蜜+${enemy.reward.honey} / 樹液+${enemy.reward.sap} / 花粉+${enemy.reward.pollen}\n${enemy.rewardText || ""}`;
  const feedChance = enemy.strong ? 0.48 : 0.24;
  const relicChance = enemy.strong ? 0.10 : 0.015;
  if (Math.random() < feedChance) {
    const feed = rollFeed("戦闘後", enemy.strong);
    bonusText += `\nさらに ${feedStars(feed)}「${feed.name}」を入手。`;
  }
  if (Math.random() < relicChance) {
    const relic = rollRelic("戦闘後");
    bonusText += `\n形見「${relic.name}」${stars3(relic.stars)}を入手。`;
  }
  state.battle = null;
  modal("勝利", `${enemy.name}に勝利しました。\n\n${bonusText}`, "🏆", () => advanceFloor(`${enemy.name}を倒して先へ進みました。`));
  save(true);
  render();
}
function permaDeath(reason) {
  if (!state.active) return;
  state.graves.unshift({ name: state.active.name, species: activeType().species, variant: state.active.variantLabel || "標準個体", level: state.active.level, depth: state.active.maxDepth, wins: state.active.wins, reason, date: new Date().toLocaleString("ja-JP") });
  state.graves = state.graves.slice(0, 30);
  addLog(`${state.active.name}はロストしました。${reason}`);
  state.active = null;
  state.relics = [];
  state.equipped = { rock: null, scissors: null, paper: null };
  state.run = null;
  state.battle = null;
  save(true);
  render();
}
function modal(title, text, icon = "✦", after = null) {
  pendingModalAction = after;
  document.getElementById("modalIcon").textContent = icon;
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalText").textContent = text;
  document.getElementById("resultModal").classList.remove("hidden");
}
function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
  const fn = pendingModalAction;
  pendingModalAction = null;
  if (fn) fn();
}
function renderEggs() {
  const box = document.getElementById("eggCards");
  box.innerHTML = TYPES.map(t => `
    <article class="card eggCard">
      <img src="${t.img}" alt="${t.species}">
      <div class="cardTop"><h3>${t.species}</h3><span class="eggType">${t.role}</span></div>
      <p class="stats">${t.desc}</p>
      <p class="growth">成長率：HP${stars5(t.growth.hp)} / 防御${stars5(t.growth.def)} / ✊${stars5(t.growth.rock)} / ✌️${stars5(t.growth.scissors)} / ✋${stars5(t.growth.paper)}</p>
      <div class="traitBox"><b>${t.trait.name}</b><div class="mini">${t.trait.desc}</div></div>
      <button data-egg="${t.id}" class="primary">この卵を選ぶ</button>
    </article>`).join("");
  box.querySelectorAll("[data-egg]").forEach(btn => btn.onclick = () => selectEgg(btn.dataset.egg));
}
function renderGarden() {
  const runSummary = document.getElementById("runSummary");
  const box = document.getElementById("activeGirlBox");
  const collectBtn = document.getElementById("collectBtn");
  if (!state.active) {
    runSummary.textContent = "現在の挑戦：待機中";
    box.innerHTML = `<p>卵を選ぶとここに現在の虫娘が表示されます。</p>`;
    collectBtn.disabled = true;
    return;
  }
  collectBtn.disabled = false;
  const st = stats();
  runSummary.textContent = state.run ? `探索中：深度 ${state.run.floor} / ${state.run.maxFloor}` : `現在の挑戦：待機中（朝露の森 推奨Lv.15）`;
  box.innerHTML = `
    <img src="${activeImage()}" alt="${state.active.name}">
    <div class="meta">
      <div class="cardTop"><h3>${state.active.name}</h3><span class="level">Lv.${state.active.level}</span></div>
      <p class="stats">${activeType().species} / ${state.active.variantLabel}<br>${activeType().desc}<br>${state.active.variantTrait || ""}</p>
      <div class="traitBox"><b>${activeType().trait.name}</b><div class="mini">${activeType().trait.desc}</div></div>
      <p class="stats">HP ${st.hp} / 防御 ${st.def} / ✊ ${st.rock} / ✌️ ${st.scissors} / ✋ ${st.paper}</p>
      <p class="growth">成長率：HP${stars5(activeType().growth.hp)} / 防御${stars5(activeType().growth.def)} / ✊${stars5(activeType().growth.rock)} / ✌️${stars5(activeType().growth.scissors)} / ✋${stars5(activeType().growth.paper)}</p>
      <p class="note">次のLvまで ${Math.max(0, nextLevelExp() - (state.active.feedExp || 0))} EXP</p>
    </div>`;
}
function renderGirlView() {
  const el = document.getElementById("girlCard");
  if (!state.active) { el.innerHTML = `<div class="panel"><p>まずは卵を選んでください。</p></div>`; return; }
  const t = activeType();
  const st = stats();
  const tr = state.active.training || {};
  el.innerHTML = `
    <article class="card">
      <img src="${activeImage()}" alt="${state.active.name}">
      <div class="cardTop"><h3>${state.active.name}</h3><span class="level">Lv.${state.active.level}</span></div>
      <p class="stats">${t.species} / ${state.active.variantLabel}<br>${t.desc}</p>
      <div class="traitBox"><b>${t.trait.name}</b><div class="mini">${t.trait.desc}</div></div>
      <p class="growth">成長率：HP${stars5(t.growth.hp)} / 防御${stars5(t.growth.def)} / ✊${stars5(t.growth.rock)} / ✌️${stars5(t.growth.scissors)} / ✋${stars5(t.growth.paper)}</p>
      <p class="stats">HP ${st.hp} / 防御 ${st.def} / ✊ ${st.rock} / ✌️ ${st.scissors} / ✋ ${st.paper}</p>
      <div class="feedBox">
        <h3>エサでレベルアップ</h3>
        <p class="stats">探索で手に入るフルーツを与えると経験値が入ります。</p>
        <div class="feedGrid">
          ${Object.values(FEEDS).map(f => `<button data-feed="${f.id}">${f.icon} ${feedStars(f)} ${f.name}<br>所持:${state.feeds[f.id] || 0} / EXP+${f.exp}</button>`).join("")}
        </div>
      </div>
      <div class="feedBox">
        <h3>素材訓練</h3>
        <p class="stats">蜜＝HP、樹液＝防御、花粉＝✊✌️✋攻撃。上昇量はレベル成長より小さく、上限があります。</p>
        <div class="trainGrid">
          ${Object.keys(TRAIN_CONFIG).map(k => {
            const c = TRAIN_CONFIG[k], count = tr[k] || 0, cost = count >= c.max ? "上限" : `${c.materialLabel}${trainCostForCount(count)}`;
            return `<button data-train="${k}">${c.label}<br>${count}/${c.max} / ${cost}</button>`;
          }).join("")}
        </div>
      </div>
    </article>`;
  el.querySelectorAll("[data-feed]").forEach(btn => btn.onclick = () => useFeed(btn.dataset.feed));
  el.querySelectorAll("[data-train]").forEach(btn => btn.onclick = () => trainStat(btn.dataset.train));
}
function renderRelics() {
  const slots = document.getElementById("equipSlots");
  slots.innerHTML = "";
  ["rock", "scissors", "paper"].forEach(hand => {
    const r = equippedRelic(hand);
    const div = document.createElement("div");
    div.className = "slot";
    div.innerHTML = `
      <h3>${handLabel(hand)}スロット</h3>
      ${r ? `<img class="relicArt" src="${r.icon}" alt="${r.name}">` : ""}
      <p>${r ? `${r.name} ${stars3(r.stars)}` : "未装備"}</p>
      <p class="stats">${r ? r.desc : "この手に対応した形見を1つ装備できます。"}</p>
      ${r ? `<button data-unequip="${hand}">外す</button>` : ""}`;
    slots.appendChild(div);
  });
  slots.querySelectorAll("[data-unequip]").forEach(btn => btn.onclick = () => unequip(btn.dataset.unequip));
  const list = document.getElementById("relicList");
  list.innerHTML = "";
  if (state.relics.length === 0) {
    list.innerHTML = `<div class="panel"><h3>形見なし</h3><p>朝露の森の探索で、かなり低確率で入手できます。</p></div>`;
    return;
  }
  state.relics.slice().reverse().forEach(r => {
    const equipped = state.equipped[r.hand] === r.uid;
    const card = document.createElement("article");
    card.className = "card relicCard" + (equipped ? " equipped" : "");
    card.innerHTML = `
      <img class="relicArt" src="${r.icon}" alt="${r.name}">
      <div class="cardTop"><h3>${r.name}</h3><span class="rarity">${stars3(r.stars)}</span></div>
      <p><span class="handBadge">装備手：${handLabel(r.hand)}</span></p>
      <p class="stats relicEffect">${r.effectText}</p>
      <p class="stats">倍率：${r.multiplier}倍</p>
      <button data-equip="${r.uid}">${equipped ? "装備中" : `${handLabel(r.hand)}へ装備`}</button>`;
    list.appendChild(card);
  });
  list.querySelectorAll("[data-equip]").forEach(btn => btn.onclick = () => equipRelic(btn.dataset.equip));
}
function renderExplore() {
  updateEnergy();
  const energyBox = document.getElementById("energyBox");
  if (energyBox) energyBox.textContent = `探索力 ${state.energy.value} / ${ENERGY_MAX}　${nextEnergyText()}`;
  const explorePanel = document.getElementById("explorePanel");
  const battlePanel = document.getElementById("battlePanel");
  const startBtn = document.getElementById("startExploreBtn");
  if (!state.active) { startBtn.disabled = true; explorePanel.classList.add("hidden"); battlePanel.classList.add("hidden"); return; }
  startBtn.disabled = !!state.run || state.energy.value <= 0;
  if (!state.run) {
    explorePanel.classList.add("hidden");
    battlePanel.classList.add("hidden");
    return;
  }
  document.getElementById("floorText").textContent = `深度 ${state.run.floor} / ${state.run.maxFloor}`;
  document.getElementById("hpText").textContent = `HP ${Math.max(0, state.run.hp)} / ${state.run.maxHp}`;
  if (state.battle) {
    explorePanel.classList.add("hidden");
    battlePanel.classList.remove("hidden");
    const st = stats();
    document.getElementById("playerImg").src = activeImage();
    document.getElementById("playerName").textContent = state.active.name;
    document.getElementById("playerHpText").textContent = `HP ${Math.max(0, state.run.hp)} / ${state.run.maxHp}`;
    document.getElementById("playerHpBar").style.width = `${clamp((state.run.hp / state.run.maxHp) * 100, 0, 100)}%`;
    document.getElementById("enemySprite").innerHTML = `<img src="${state.battle.enemy.img}" alt="${state.battle.enemy.name}">`;
    document.getElementById("enemyName").textContent = state.battle.enemy.name;
    document.getElementById("enemyHandText").innerHTML = `得意手：${handLabel(state.battle.enemy.hand)} / IQ${state.battle.enemy.iq}<br><span class="aiHint">初手は虫娘の高い攻撃を警戒。勝たれた後はその手を潰しに来ます。</span>`;
    document.getElementById("enemyHpText").textContent = `HP ${Math.max(0, state.battle.enemyHp)} / ${state.battle.enemy.hp}`;
    document.getElementById("enemyHpBar").style.width = `${clamp((state.battle.enemyHp / state.battle.enemy.hp) * 100, 0, 100)}%`;
    document.getElementById("battleText").textContent = state.battle.text;
    document.getElementById("battleActions").innerHTML = `
      <button data-battle="rock">${handLabel("rock")}で攻撃（威力 ${st.rock}）</button>
      <button data-battle="scissors">${handLabel("scissors")}で攻撃（威力 ${st.scissors}）</button>
      <button data-battle="paper">${handLabel("paper")}で攻撃（威力 ${st.paper}）</button>
      <button data-battle="run">にげる</button>`;
    document.querySelectorAll("[data-battle]").forEach(btn => {
      btn.onclick = () => btn.dataset.battle === "run" ? escapeBattle() : battleAct(btn.dataset.battle);
    });
    return;
  }
  battlePanel.classList.add("hidden");
  explorePanel.classList.remove("hidden");
  document.getElementById("eventTitle").textContent = currentEvent?.title || "探索";
  document.getElementById("eventText").textContent = currentEvent?.text || "探索を開始してください。";
  document.getElementById("choices").innerHTML = (currentEvent?.choices || []).map((p, i) => `<button data-choice="${i}">${p.label}</button>`).join("");
  document.querySelectorAll("[data-choice]").forEach(btn => btn.onclick = () => resolvePlaceChoice(currentEvent.choices[Number(btn.dataset.choice)]));
}
function renderRecord() {
  document.getElementById("bestRecord").innerHTML = `
    <p>最高Lv：${state.best.level || 0}${state.best.name ? `（${state.best.name}）` : ""}</p>
    <p>最高深度：${state.best.depth || 0}</p>
    <p>最多勝利：${state.best.wins || 0}</p>`;
  const graves = document.getElementById("graveList");
  graves.innerHTML = state.graves.length ? state.graves.map(g => `<div class="logItem"><b>${g.name}</b> / ${g.species} / ${g.variant}<br>Lv.${g.level}・深度${g.depth}・${g.wins}勝<br>${g.reason}<br>${g.date}</div>`).join("") : `<div class="logItem">まだ墓標はありません。</div>`;
  document.getElementById("logList").innerHTML = state.log.map(t => `<div class="logItem">${t}</div>`).join("");
}
function render() {
  ensureFeeds();
  updateEnergy();
  const active = !!state.active;
  document.getElementById("honey").textContent = state.resources.honey;
  document.getElementById("sap").textContent = state.resources.sap;
  document.getElementById("pollen").textContent = state.resources.pollen;
  document.getElementById("eggScreen").classList.toggle("hidden", active || !!pendingType);
  document.getElementById("nameScreen").classList.toggle("hidden", !pendingType);
  document.getElementById("gameUI").classList.toggle("hidden", !active);
  renderEggs();
  renderGarden();
  renderGirlView();
  renderRelics();
  renderExplore();
  renderRecord();
  save(true);
}
function initTabs() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.view).classList.add("active");
    };
  });
}
function init() {
  initTabs();
  document.getElementById("saveBtn").onclick = () => { save(); render(); };
  document.getElementById("confirmNameBtn").onclick = confirmName;
  document.getElementById("collectBtn").onclick = collect;
  document.getElementById("startExploreBtn").onclick = startRun;
  document.getElementById("modalOkBtn").onclick = closeModal;
  document.getElementById("retireBtn").onclick = retireCurrent;
  document.getElementById("resetBtn").onclick = resetAll;
  render();
  setInterval(renderExplore, 30000);
}
window.addEventListener("DOMContentLoaded", init);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
