
const SAVE_KEY = "mushimusume_v29_hatch_quote_layout_fix";
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
  hp: { material: "honey", materialLabel: "蜜", label: "HP", divisor: 2, bonus: n => Math.floor(n / 2) },
  def: { material: "sap", materialLabel: "樹液", label: "防御", divisor: 3, bonus: n => Math.floor(n / 3) },
  rock: { material: "pollen", materialLabel: "花粉", label: "✊攻撃", divisor: 3, bonus: n => Math.floor(n / 3) },
  scissors: { material: "pollen", materialLabel: "花粉", label: "✌️攻撃", divisor: 3, bonus: n => Math.floor(n / 3) },
  paper: { material: "pollen", materialLabel: "花粉", label: "✋攻撃", divisor: 3, bonus: n => Math.floor(n / 3) }
};
const TRAIN_SUCCESS_RATE = 0.70;
const TRAIN_LIMIT_PER_LEVEL = 3;
const FEEDS = {
  unripe: { id: "unripe", name: "未熟フルーツ", stars: 1, exp: 8, icon: "🍏", desc: "朝露の森でよく見つかる青い果実。少しだけ成長経験値が入る。" },
  ripe: { id: "ripe", name: "完熟フルーツ", stars: 2, exp: 22, icon: "🍎", desc: "甘く熟した果実。食べさせるとしっかり成長する。" },
  super: { id: "super", name: "超熟フルーツ", stars: 3, exp: 55, icon: "🍑", desc: "濃い蜜を含んだ希少な果実。大きく成長経験値が入る。" }
};

const VARIANTS = {
  butterfly: [
    { id: "butterfly_fixed", label: "固定個体", img: "./assets/characters/butterfly_fixed.jpeg", trait: "固定立ち絵。" }
  ],
  beetle: [
    { id: "yamato_kabuto_fixed", label: "固定個体", img: "./assets/characters/yamato_kabuto_fixed.png", trait: "固定立ち絵。" }
  ],
  mantis: [
    { id: "mantis_fixed", label: "固定個体", img: "./assets/characters/mantis_fixed.jpeg", trait: "固定立ち絵。" }
  ],
  redback: [
    { id: "redback_fixed", label: "固定個体", img: "./assets/characters/redback_fixed.png", trait: "固定立ち絵。" }
  ]
};
const TYPES = [
  {
    id: "butterfly", species: "モンシロチョウ娘", role: "回復・パー成長", img: "./assets/characters/butterfly_fixed.jpeg", eggImg: "./assets/eggs/butterfly_egg.png",
    desc: "おとなしい白い蝶娘。HPとパー攻撃が伸びやすい。",
    base: { hp: 34, def: 3, rock: 7, scissors: 7, paper: 9 },
    growth: { hp: 3, def: 2, rock: 2, scissors: 2, paper: 3 },
    trait: { name: "白愛の翅", desc: "探索中一回だけ、戦闘時に『にげる』を選ぶとHPを小回復する。", escapeHealRate: 0.12 }
  },
  {
    id: "beetle", species: "ヤマトカブト娘", role: "耐久・パー成長", img: "./assets/characters/yamato_kabuto_fixed.png", eggImg: "./assets/eggs/beetle_egg.png",
    desc: "静かな甲虫娘。HP・防御・パー攻撃が伸びやすい。",
    base: { hp: 44, def: 5, rock: 7, scissors: 7, paper: 10 },
    growth: { hp: 3, def: 3, rock: 2, scissors: 2, paper: 4 },
    trait: { name: "兜の誇り", desc: "✌️技を受けた時のダメージが少し多くなる。", scissorsTakenMult: 1.2 }
  },
  {
    id: "mantis", species: "オオカマキリ娘", role: "攻撃・チョキ成長", img: "./assets/characters/mantis_fixed.jpeg", eggImg: "./assets/eggs/mantis_egg.png",
    desc: "緑髪の戦闘的な虫娘。チョキ攻撃が特に伸びやすい。",
    base: { hp: 30, def: 3, rock: 9, scissors: 11, paper: 8 },
    growth: { hp: 2, def: 2, rock: 3, scissors: 4, paper: 3 },
    trait: { name: "暴食", desc: "レベルアップに必要な経験値が少し多い。", expCostMult: 1.2 }
  },
  {
    id: "redback", species: "セアカゴケグモ娘", role: "毒・チョキ寄り", img: "./assets/characters/redback_fixed.png", eggImg: "./assets/eggs/redback_egg.png",
    desc: "静かなヤンデレ気質の蜘蛛娘。チョキがやや伸びやすく、毒でじわじわ追い詰める。",
    base: { hp: 34, def: 3, rock: 8, scissors: 9, paper: 8 },
    growth: { hp: 2, def: 2, rock: 2, scissors: 3, paper: 2 },
    trait: { name: "猛毒", desc: "✌️勝利時、30%で敵を毒にする。自分が与える毒ダメージは最大HPの1/8。", poisonDamageDivisor: 8, poisonOnWinChance: 0.3, poisonHands: ["scissors"] }
  }
];

const GIRL_QUOTES = {
  butterfly: {
    normal: [
      "わたし、{player}さんとなら……森の奥も、少しだけ平気です。",
      "{player}さん、無理はしないでください。逃げることも、ちゃんと大事です。",
      "花の匂いがします。少し、落ち着きますね。",
      "わたし、戦うのは得意じゃないです。でも、守るためなら頑張れます。",
      "{player}さん、羽が少し震えています。でも……まだ飛べます。",
      "朝露がきれいです。こういう場所なら、ずっと歩いていたいですね。",
      "傷ついたら、すぐ教えてください。わたし、できるだけ癒やします。",
      "怖くないと言えば、嘘になります。でも、{player}さんがいるから進めます。",
      "この森にも、やさしい場所はあります。ちゃんと見つけていきましょう。",
      "わたしの羽、白いだけじゃないんです。ちゃんと、進むための羽です。",
      "{player}さん、今日は少しだけ慎重に行きませんか？",
      "風が静かです。今なら、よく周りの音が聞こえます。",
      "勝てたらうれしいです。でも、生きて帰れることの方が、もっと大事です。",
      "わたし、{player}さんの声を聞くと、少し落ち着きます。",
      "大丈夫です。わたしはまだ、ここにいます。"
    ],
    bond10: [
      "{player}さんと歩く森は、前より少しだけ、こわくなくなりました。",
      "わたし、{player}さんの判断を信じています。だから、次も進めます。",
      "傷ついても、帰ってこられたら大丈夫です。わたしがそばにいます。",
      "{player}さん、今日はわたしも少しだけ前に出てみます。",
      "最初より、羽が軽いです。きっと、{player}さんと慣れてきたからですね。",
      "戦うのは苦手です。でも、守りたいものは少し増えました。",
      "{player}さん、疲れていませんか？ わたしだけじゃなくて、自分のことも見てください。",
      "この形見、少しあたたかいです。誰かの思いが残っているのかもしれません。",
      "怖い時は、{player}さんの声を思い出します。そうすると、足が止まらないんです。",
      "わたし、逃げる時も恥ずかしくなくなりました。生きて戻るためですから。",
      "{player}さん、わたし……前より、ちゃんと強くなれていますか？",
      "花の匂いだけじゃなくて、危ない匂いも少し分かるようになりました。",
      "無理はしません。でも、諦めるのも少しだけ嫌になりました。",
      "{player}さんが名前を呼んでくれると、羽に力が入ります。",
      "帰る場所があるから、森の奥にも行けるんですね。"
    ],
    bond20: [
      "{player}さん、わたし……あなたの声があると、どこまでも飛べる気がします。",
      "怖い森でも、{player}さんとなら、ちゃんと景色を見られます。",
      "わたしは弱いままかもしれません。でも、{player}さんを置いて逃げたりしません。",
      "{player}さん、もし危なくなったら、わたしの羽を見てください。帰る道を探します。",
      "最初は守られてばかりでした。今は、わたしも{player}さんを守りたいです。",
      "この森で見つけたもの、怖いことも、嬉しいことも……全部、忘れたくないです。",
      "{player}さんがそばにいるだけで、わたしの小さな勇気は何度でも戻ってきます。",
      "わたし、もっと強くなりたいです。優しいだけでは、守れないものがありますから。",
      "傷が残っても、生きて帰れたなら、それはちゃんと勝ちです。",
      "{player}さん、今日は少しだけ長く一緒にいてください。……安心するので。",
      "羽が破れても、心までは折れません。{player}さんが直してくれましたから。",
      "わたしの白い羽は、逃げるためだけじゃなくて、あなたの元へ帰るための羽です。",
      "暗い場所でも、{player}さんの名前を呼ぶと、道が見える気がします。",
      "わたしはここにいます。最後まで、{player}さんのそばにいます。",
      "もし奇跡が一度だけなら、わたしはそれを{player}さんと帰るために使いたいです。"
    ]
  },
  beetle: {
    normal: [
      "{player}、前は私が守ります。",
      "防御なら任せてください。簡単には倒れません。",
      "私は退きません。必要なら、何度でも前に出ます。",
      "{player}、次の指示を。私はまだ戦えます。",
      "この甲殻は飾りではありません。守るためのものです。",
      "敵が強いほど、こちらも落ち着く必要があります。",
      "無理に攻める必要はありません。耐えて、勝機を待ちましょう。",
      "私の役目は、最後まで立っていることです。",
      "{player}、危ない時は下がってください。前線は私が持ちます。",
      "誇りはあります。でも、それより大事なのは生き残ることです。",
      "チョキの相手は少し苦手です。ですが、対策すれば問題ありません。",
      "装備の確認を。小さな差が、生死を分けます。",
      "焦らず行きましょう。硬い敵ほど、崩す順番が大事です。",
      "{player}、私は信じています。あなたの判断を。",
      "帰るまでが探索です。勝っても、油断はしません。"
    ],
    bond10: [
      "{player}、私の背中は預けてください。前より、うまく守れるはずです。",
      "あなたの判断なら、私は迷わず前に出られます。",
      "守るだけでは足りません。守りながら勝つ。それが今の目標です。",
      "{player}、無茶をする時は先に言ってください。止めるか、付き合うか決めます。",
      "私は不器用です。ですが、信頼には行動で返します。",
      "前より少し、戦場が見えるようになりました。あなたのおかげです。",
      "{player}、疲れたら私の後ろへ。短い休息なら作れます。",
      "誇りとは、倒れないことではありません。倒れても立つ理由を持つことです。",
      "私はまだ強くなれます。あなたを守るには、まだ足りません。",
      "敵の攻撃が重いほど、受け止める意味があります。",
      "{player}、私を頼ってください。頼られるために、ここにいます。",
      "勝つために耐える。耐えるために鍛える。単純ですが、私に合っています。",
      "苦手な相手も覚えました。次は、もっと上手く対処します。",
      "あなたの声があると、私は前を向きやすい。",
      "この森を抜けるまで、私の甲殻は割らせません。"
    ],
    bond20: [
      "{player}、私はあなたを守るために強くなりました。これだけは、誇れます。",
      "あなたが進むなら、私は道を開きます。あなたが止まるなら、私は盾になります。",
      "私の強さは、もう私だけのものではありません。",
      "{player}、ここまで来られたことを誇ってください。私は、あなたを誇りに思います。",
      "守る理由があると、甲殻はもっと硬くなります。不思議ですね。",
      "私は倒れません。倒れるとしても、あなたを帰した後です。",
      "{player}、あなたの判断に命を預けることを、私は怖いとは思いません。",
      "どれだけ森が深くても、私の立つ場所は決まっています。あなたの前です。",
      "あなたが呼べば、私は何度でも立ち上がります。",
      "不器用な私ですが、そばにいることだけは上手くなれたと思います。",
      "この角も、甲殻も、全部あなたと帰るためにあります。",
      "{player}、あなたが無事なら、それが私の勝利です。",
      "私はただの盾ではありません。あなたと勝つための相棒です。",
      "怖くないわけではありません。ですが、あなたを失う方がずっと怖い。",
      "帰りましょう、{player}。勝って、胸を張って。"
    ]
  },
  mantis: {
    normal: [
      "{player}、次は誰を斬る？",
      "あたし、お腹すいた。勝ったら何か食べたい。",
      "チョキなら任せて。そこは、あたしの領分だから。",
      "指示は早めにね、{player}。待つの、苦手なんだ。",
      "敵が強い？ いいじゃん。その方が斬りがいあるし。",
      "考えるのは大事。でも、考えすぎて止まるのは嫌い。",
      "あたしは前に出るよ。止めるなら、ちゃんと理由を言って。",
      "{player}、今の相手なら読める。たぶん、次で崩せる。",
      "勝てる相手から倒す。森ではそれが一番かしこいんだよ。",
      "甘い匂いがする……食べ物？ 敵？ どっちでもいいけど。",
      "あたしを選んだなら、退屈はさせないでよね。",
      "負けるのは嫌い。でも、負けそうな時に考えるのは得意。",
      "大丈夫、まだ刃は鈍ってない。",
      "{player}、もっと鋭く行こう。迷ったら、先に動いた方が勝つよ。",
      "あたし、雑に見える？ でもちゃんと見てるよ。敵の癖とか、{player}の顔色とか。"
    ],
    bond10: [
      "{player}の指示、けっこう悪くないよ。……まあ、認めてあげる。",
      "あたし、前より待てるようになったと思わない？ ちょっとだけだけど。",
      "勝ったら何か食べたい。できれば、{player}と一緒に。",
      "あたしを使うの、上手くなったじゃん。そういうの嫌いじゃないよ。",
      "{player}、危ない時は言って。斬る順番、変えてあげるから。",
      "敵の動きより、最近は{player}の考えの方が読めるかも。",
      "退屈しないね、この森。……{player}といるからかもしれないけど。",
      "あたしは強い。でも、ひとりで強いだけじゃ足りないって分かってきた。",
      "迷うなら、あたしが前に出る。決めるのはその後でもいいよ。",
      "{player}、あたしが無茶したら止めて。たぶん聞くから。たぶんね。",
      "傷？ これくらい平気。……でも、心配されるのは悪くない。",
      "前は勝てばいいと思ってた。今は、帰るところまで考えてる。",
      "あたしの刃、前より冴えてるでしょ。ちゃんと見ててよね。",
      "{player}が呼ぶなら、少しくらい遠回りしてもいいよ。",
      "認めてるよ、{player}のこと。だから指示、ちゃんと聞いてる。"
    ],
    bond20: [
      "{player}が呼ぶなら、あたしはどこでも斬りに行くよ。……置いていかないでよね。",
      "あたし、強くなったでしょ。ほめてもいいよ。今なら素直に聞くかも。",
      "敵を斬る理由？ 今は分かりやすいよ。{player}と帰るため。",
      "{player}、あたしを見てて。最後まで、絶対に折れないから。",
      "昔より待つのが苦じゃない。{player}の声を聞いてる時間ならね。",
      "あたしが前に出る。{player}は、あたしが帰る場所を見失わないで。",
      "勝つのは好き。でも、{player}と一緒に勝つ方がもっと好き。",
      "傷つくのは怖くない。……{player}が悲しむのは、ちょっと嫌。",
      "あたしの刃は鋭いよ。でも、向ける相手くらい自分で選べる。",
      "{player}、もし迷ったらあたしを呼んで。迷いごと斬ってあげる。",
      "食べ物より欲しいもの？ ……今聞くのずるい。答えにくいじゃん。",
      "あたしは雑じゃない。{player}を守る時だけは、かなり丁寧だよ。",
      "負けそうな時ほど燃える。でも、今は死にたくない。まだ一緒に行きたいから。",
      "{player}、あたしのこと信じて。あたしも、ちゃんと信じてるから。",
      "帰ったらご飯。あと、少しだけ話そうよ。……まだ一緒にいたいし。"
    ]  },
  redback: {
    normal: [
      "……{player}、ちゃんとこっち見て。よそ見、嫌いだから。",
      "わたし、静かな場所が好き。……でも{player}といるなら、少しくらいうるさくてもいい。",
      "その敵、わたしが絡め取る。逃がさないよ。",
      "{player}、離れないで。糸、つけときたいくらい。",
      "大丈夫。すぐには殺さないから。じわじわ弱るの、見てたいし。",
      "……ふふ。こわい？ なら、もっと近くにいればいいのに。",
      "わたし、待つのは得意。獲物も、{player}の言葉も。",
      "黒い糸って、落ち着くんだ。ぐちゃぐちゃな気持ちを、きれいに縛ってくれるから。",
      "敵を見る目と、{player}を見る目？ ……少し違うよ。かなり。",
      "今日は誰を毒にしようか。……もちろん、敵だけね。今のところは。",
      "わたし、おしゃべりじゃないけど……{player}の声は、ちゃんと聞いてる。",
      "逃げ道を残すの、好きじゃない。囲ってしまえば安心でしょ。",
      "その顔、覚えておく。{player}が困ってる顔、嫌いじゃないから。",
      "近づいてきたら噛むよ。……敵の話。{player}は別。",
      "わたしのそば、けっこう安全だよ。……敵にとっては最悪だけど。"
    ],
    bond10: [
      "{player}、最近ちょっと油断してる。わたしがいるからって、安心しすぎ。",
      "わたしの毒、前よりよく回る。……{player}と一緒だと、気分がいいからかな。",
      "糸が絡まるみたいに、{player}のこと、気づいたらずっと考えてる。",
      "敵を見つけるより先に、{player}の気配が分かる。変なの。",
      "ねえ{player}、勝ったら少しくらい褒めて。……黙ってうなずくだけでもいいから。",
      "わたし、執着強いってよく言われる。……いまさら直す気もないけど。",
      "{player}が傷つくと、胸のあたりがざわざわする。あれ、かなり不快。",
      "静かにしてると、みんな油断する。そういうの、嫌いじゃないよ。",
      "わたしの糸で守れたらいいのにね。……きつく巻きすぎるかもしれないけど。",
      "{player}は優しいね。だから、わたしがちゃんと汚いところも受け持ってあげる。",
      "敵が逃げるの、気に入らない。{player}が逃げないなら、それでいいけど。",
      "わたし、ひとりでも戦える。でも、{player}といる方がずっといい。",
      "今日は何も起きないといいね。……{player}と長く一緒にいられるから。",
      "その呼び方、好き。もっと呼んで。……わたしの名前。",
      "糸みたいに細くても、切れないものってあるんだね。たぶん、今のこれ。"
    ],
    bond20: [
      "{player}、もう逃がさないよ。……冗談半分、本気半分。",
      "わたしの巣は、{player}が帰ってくる場所にしたい。ほかは、どうでもいい。",
      "誰にも渡したくないって思うの、だめかな。……だめでも、やめないけど。",
      "{player}が笑うと、わたしまで少しだけほどける。そういうの、ずるい。",
      "毒って便利だよ。すぐ終わらせないで、ちゃんと相手を止めてくれるから。……わたしたちの時間みたいに。",
      "わたし、優しい子じゃないよ。でも{player}には、できるだけやさしくしたい。",
      "どこに行っても見つける。糸がなくても、気配だけで分かるから。",
      "{player}が無事なら、少しくらい汚れてもいい。噛みついてでも守る。",
      "ずっと一緒にいるって、口で言うのは簡単。だから、わたしは行動で縛るね。",
      "ねえ{player}、わたしのこと、ちゃんと選び続けて。選ばせ続けるから。",
      "この毒も、この糸も、この気持ちも……全部、もう{player}の近くに置いてる。",
      "敵がどれだけ強くても、{player}を傷つけるなら嫌い。すごく、嫌い。",
      "わたしの静けさ、{player}の隣だと少しだけやわらぐ。……特別ってこと。",
      "噛み跡みたいに、消えないものを残したい。思い出でも、約束でも。",
      "帰ろう、{player}。わたしのそばに。……そこが一番、落ち着くから。"
    ]
  }
};

const ENEMIES = [
  { id: "aphid", name: "アブラムシ群", img: "./assets/enemies/aphid_swarm.png", hand: "rock", iq: 1, hp: 26, atk: 6, def: 1, reward: { honey: 12, sap: 1, pollen: 8 }, exp: 5, text: "小さな敵が群れでまとわりつく。", rewardText: "蜜・花粉が多め。" },
  { id: "wasp", name: "縄張りハチ", img: "./assets/enemies/territorial_bee.png", hand: "scissors", iq: 2, hp: 30, atk: 8, def: 1, reward: { honey: 14, sap: 2, pollen: 5 }, exp: 7, text: "鋭い羽音が近づいてくる。", rewardText: "蜜が多め。" },
  { id: "centipede", name: "朽木ムカデ", img: "./assets/enemies/rotten_centipede.png", hand: "rock", iq: 1, hp: 36, atk: 9, def: 2, reward: { honey: 2, sap: 16, pollen: 3 }, exp: 8, text: "朽木の隙間から危険な影が這い出した。", rewardText: "樹液が多め。" },
  { id: "spider", name: "網張りグモ", img: "./assets/enemies/web_spider.png", hand: "paper", iq: 3, hp: 34, atk: 7, def: 3, reward: { honey: 5, sap: 8, pollen: 13 }, exp: 8, text: "粘る糸が行く手をふさいでいる。", rewardText: "花粉・樹液が多め。" }
];
const STRONG_ENEMIES = [
  { id: "hornet", name: "怒れるスズメバチ", img: "./assets/enemies/angry_hornet.png", hand: "scissors", iq: 2, hp: 54, atk: 13, def: 3, reward: { honey: 24, sap: 8, pollen: 10 }, exp: 15, text: "黒と黄色の影が低い羽音を響かせている。", rewardText: "蜜大量。エサも出やすい。" },
  { id: "nightstag", name: "夜闇クワガタ", img: "./assets/enemies/night_stag.png", hand: "scissors", iq: 2, hp: 62, atk: 12, def: 6, reward: { honey: 8, sap: 26, pollen: 8 }, exp: 16, text: "巨大な大顎が暗く光っている。", rewardText: "樹液大量。形見抽選あり。" },
  { id: "oldspider", name: "古巣の大蜘蛛", img: "./assets/enemies/old_nest_spider.png", hand: "paper", iq: 4, hp: 64, atk: 11, def: 6, reward: { honey: 10, sap: 14, pollen: 26 }, exp: 17, text: "古い巣の主が静かに睨んでいる。", rewardText: "花粉・樹液多め。" }
];


const AREA_DEFS = {
  asatsuyu: {
    id: "asatsuyu", name: "朝露の森", recommend: "推奨Lv.3〜5", maxFloor: 5,
    feedChance: { normal: 0.24, strong: 0.48 },
    relicChance: { normal: 0.015, strong: 0.10, event: 0.40 },
    feedRareBoost: false
  },
  jueki: {
    id: "jueki", name: "樹液の古木林", recommend: "推奨Lv.6〜10", maxFloor: 5,
    feedChance: { normal: 0.30, strong: 0.55 },
    relicChance: { normal: 0.03, strong: 0.15, event: 0.55 },
    feedRareBoost: true
  }
};
const JUEKI_ENEMIES = [
  { id: "bark_longhorn", name: "樹皮カミキリ", img: "./assets/enemies/jueki/bark_longhorn.png", hand: "scissors", iq: 2, hp: 42, atk: 10, def: 4, reward: { honey: 4, sap: 22, pollen: 5 }, exp: 13, text: "樹皮のような硬い甲殻と長い触角を持つ。", rewardText: "樹液が多め。" },
  { id: "mud_weevil", name: "蜜泥ゾウムシ", img: "./assets/enemies/jueki/mud_weevil.png", hand: "rock", iq: 1, hp: 56, atk: 9, def: 6, reward: { honey: 12, sap: 14, pollen: 5 }, exp: 14, text: "蜜と泥をまとった丸い体が重く沈んでいる。", rewardText: "HPと防御が高い。" },
  { id: "sap_ants", name: "樹液アリ隊", img: "./assets/enemies/jueki/sap_ants.png", hand: "rock", iq: 1, hp: 44, atk: 12, def: 3, reward: { honey: 6, sap: 12, pollen: 14 }, exp: 13, text: "小さなアリの群れが一つの塊のように押し寄せる。", rewardText: "花粉と樹液が多め。" },
  { id: "night_moth", name: "夜羽ガ", img: "./assets/enemies/jueki/night_moth.png", hand: "paper", iq: 2, hp: 40, atk: 10, def: 3, reward: { honey: 8, sap: 6, pollen: 18 }, exp: 14, text: "暗い翅から毒の鱗粉が静かに舞う。", rewardText: "花粉が多め。攻撃時30%で毒。", poisonChance: 0.30 }
];
const JUEKI_STRONG_ENEMIES = [
  { id: "long_blade_longhorn", name: "大長刃カミキリ", img: "./assets/enemies/jueki/long_blade_longhorn.png", hand: "scissors", iq: 3, hp: 76, atk: 17, def: 6, reward: { honey: 10, sap: 34, pollen: 22 }, exp: 26, text: "異様に発達した長い顎が刃のように開く。", rewardText: "樹液と花粉が多い。" },
  { id: "yokozuna_hanamuguri", name: "横綱ハナムグリ", img: "./assets/enemies/jueki/yokozuna_hanamuguri.png", hand: "rock", iq: 3, hp: 92, atk: 18, def: 8, reward: { honey: 24, sap: 32, pollen: 12 }, exp: 28, text: "肥大化した甲殻の巨体が、古木の根元を揺らす。", rewardText: "蜜と樹液が多い。" }
];

const RELIC_DEFS = [
  { id: "beetle_shell", area: "asatsuyu", name: "カナブンの甲殻", hand: "rock", iconBase: "beetle", effectText: "✊あいこ時、相手にダメージ。", tiers: { 1: 0.2, 2: 0.3, 3: 0.5 }, descMode: "mult" },
  { id: "mantis_foreleg", area: "asatsuyu", name: "古い鎌脚", hand: "scissors", iconBase: "mantis", effectText: "✌️勝利時、30%の確率で追撃ダメージ。", tiers: { 1: 0.5, 2: 0.6, 3: 0.8 }, descMode: "mult" },
  { id: "cicada_shell", area: "asatsuyu", name: "セミの抜け殻", hand: "paper", iconBase: "cicada", effectText: "✋敗北時、受けるダメージを軽減。", tiers: { 1: 0.1, 2: 0.2, 3: 0.5 }, descMode: "mult" },
  { id: "bark_jaw", area: "jueki", name: "樹皮カミキリの削顎", hand: "scissors", iconBase: "jueki/bark_jaw", effectText: "✌️勝利時、敵防御を戦闘中だけ下げる。", tiers: { 1: 1, 2: 2, 3: 3 }, descMode: "flat" },
  { id: "poison_scales", area: "jueki", name: "夜羽蛾の毒鱗粉", hand: "paper", iconBase: "jueki/poison_scales", effectText: "敵を毒にする。毒はじゃんけんごとに最大HPの1/16ダメージ。", tiers: { 1: 1, 2: 2, 3: 3 }, descMode: "condition" },
  { id: "five_soul", area: "jueki", name: "五分の魂", hand: "all", iconBase: "jueki/five_soul", effectText: "敵の攻撃でHPが0になる時、HP1で耐えて消失する。", fixedStars: 2, tiers: { 2: 1 }, descMode: "special" }
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

const JUEKI_PLACE_EVENTS = [
  { id: "sap_pool", label: "樹液だまり", title: "濃い樹液だまり", text: "甘く重い樹液の匂いが漂う。虫たちが集まりやすい場所だ。", weights: { battle: 24, strong: 10, heal: 12, relic: 9, feed: 22, none: 13, damage: 10 }, mood: "粘る樹液を避けながら近づきます。" },
  { id: "hollow", label: "古木のうろ", title: "古木のうろ", text: "幹の奥に暗いうろが開いている。古い形見が眠っているかもしれない。", weights: { battle: 25, strong: 22, heal: 4, relic: 16, feed: 12, none: 9, damage: 12 }, mood: "暗い空洞をのぞき込みます。" },
  { id: "bark_crack", label: "樹皮の裂け目", title: "樹皮の裂け目", text: "硬い樹皮の間に、小さな通り道が続いている。", weights: { battle: 34, strong: 10, heal: 5, relic: 8, feed: 16, none: 14, damage: 13 }, mood: "裂け目に沿って進みます。" },
  { id: "high_branch", label: "高い枝先", title: "高い枝先", text: "風が強い枝先。見晴らしはいいが、羽音も近い。", weights: { battle: 24, strong: 22, heal: 6, relic: 8, feed: 20, none: 10, damage: 10 }, mood: "枝を渡って慎重に進みます。" },
  { id: "rotten_root", label: "腐った根元", title: "腐った根元", text: "湿った根元には、危険と拾い物が同居している。", weights: { battle: 27, strong: 16, heal: 5, relic: 14, feed: 13, none: 9, damage: 16 }, mood: "腐葉土をかき分けます。" },
  { id: "night_leaf", label: "夜露の葉陰", title: "夜露の葉陰", text: "葉陰に夜露が残っている。少しだけ息を整えられそうだ。", weights: { battle: 14, strong: 6, heal: 26, relic: 7, feed: 25, none: 16, damage: 6 }, mood: "静かな葉陰で周囲を探ります。" }
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
let pendingVariant = null;
let pendingModalAction = null;
let currentEvent = null;
let state = load();

function defaultState() {
  return {
    resources: { honey: 30, sap: 16, pollen: 16 },
    playerName: "ご主人様",
    currentQuote: "",
    active: null,
    relics: [],
    equipped: { rock: null, scissors: null, paper: null },
    feeds: { unripe: 0, ripe: 0, super: 0 },
    energy: { value: ENERGY_MAX, updatedAt: Date.now() },
    best: { level: 0, depth: 0, wins: 0, name: "" },
    graves: [],
    log: ["卵を選んで挑戦を開始してください。"],
    lost: null,
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
function normalizeLoadedState(raw) {
  const data = raw && raw.state ? raw.state : raw;
  if (!data || typeof data !== "object") throw new Error("セーブデータの形式が正しくありません。");
  const merged = { ...defaultState(), ...data };
  merged.resources = { ...defaultState().resources, ...(data.resources || {}) };
  merged.feeds = { ...defaultState().feeds, ...(data.feeds || {}) };
  merged.equipped = { ...defaultState().equipped, ...(data.equipped || {}) };
  merged.energy = data.energy || { value: ENERGY_MAX, updatedAt: Date.now() };
  merged.best = { ...defaultState().best, ...(data.best || {}) };
  merged.graves = Array.isArray(data.graves) ? data.graves : [];
  merged.log = Array.isArray(data.log) ? data.log : ["セーブデータを読み込みました。"];
  merged.relics = Array.isArray(data.relics) ? data.relics : [];
  merged.active = data.active || null;
  if (merged.active?.typeId && typeDef(merged.active.typeId)) {
    const t = typeDef(merged.active.typeId);
    merged.active.variantImg = t.img;
    merged.active.variantId = `${t.id}_fixed`;
    merged.active.variantLabel = "固定個体";
    if (!merged.active.training) merged.active.training = { hp: 0, def: 0, rock: 0, scissors: 0, paper: 0 };
  }
  merged.run = data.run || null;
  merged.battle = data.battle || null;
  merged.lost = data.lost || null;
  return merged;
}
function exportSaveData() {
  save(true);
  const payload = {
    app: "虫娘ローグガーデン",
    version: 33,
    saveKey: SAVE_KEY,
    exportedAt: new Date().toISOString(),
    state
  };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  a.href = url;
  a.download = `mushimusume-save-${date}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  const box = document.getElementById("importSaveText");
  if (box) box.value = json;
  modal("セーブを書き出しました", "JSONファイルを保存しました。念のため下の入力欄にも同じ内容を入れています。", "💾");
}
function importSaveFromText(text) {
  try {
    const parsed = JSON.parse(text);
    const loaded = normalizeLoadedState(parsed);
    if (!confirm("現在のセーブデータを、読み込んだデータで上書きしますか？")) return;
    state = loaded;
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    addLog("セーブデータを読み込みました。");
    modal("読み込み完了", "セーブデータを復元しました。", "💾", render);
  } catch (e) {
    modal("読み込み失敗", `セーブデータを読み込めませんでした。\n${e.message || e}`, "⚠️");
  }
}
function importSaveFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => importSaveFromText(String(reader.result || ""));
  reader.onerror = () => modal("読み込み失敗", "ファイルを読み込めませんでした。", "⚠️");
  reader.readAsText(file);
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
function activeImage() { return activeType()?.img || state.active?.variantImg || "./assets/characters/butterfly_fixed.jpeg"; }
function handLabel(hand) { return `${HANDS[hand].icon} ${HANDS[hand].label}`; }
function handResult(a, b) { return a === b ? "draw" : HANDS[a].beats === b ? "win" : "lose"; }
function relicByUid(id) { return state.relics.find(r => r.uid === id); }
function equippedRelic(hand) { return relicByUid(state.equipped[hand]); }
function fixedVariant(typeId) {
  const t = typeDef(typeId);
  return { id: `${typeId}_fixed`, label: "固定個体", img: t?.img || "./assets/characters/butterfly_fixed.jpeg", trait: "固定立ち絵。" };
}
function randomVariant(typeId) {
  return fixedVariant(typeId);
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
function trainSuccessLimit() {
  if (!state.active) return 0;
  return Math.max(0, (state.active.level || 1) * TRAIN_LIMIT_PER_LEVEL);
}
function trainCostForCount(count) {
  const next = count + 1;
  if (next <= 5) return 10;
  if (next <= 10) return 15;
  if (next <= 20) return 20;
  if (next <= 40) return 30;
  return 50;
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
    state.currentQuote = randomGirlQuote();
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
  const limit = trainSuccessLimit();
  if (count >= limit) {
    modal("訓練上限", `${conf.label}訓練は現在Lv.${state.active.level}では成功${limit}回までです。レベルアップで上限が増えます。`, "🌱");
    return;
  }
  const cost = trainCostForCount(count);
  if (state.resources[conf.material] < cost) {
    modal("素材不足", `${conf.label}訓練には${conf.materialLabel}${cost}が必要です。`, "🌱");
    return;
  }
  state.resources[conf.material] -= cost;
  state.active.training = tr;
  if (Math.random() < TRAIN_SUCCESS_RATE) {
    state.active.training[stat] = count + 1;
    addLog(`${state.active.name}の${conf.label}訓練に成功しました。${conf.materialLabel}-${cost}`);
    modal("訓練成功", `${state.active.name}の${conf.label}訓練に成功しました。
成功回数 ${count + 1}/${limit}
${conf.materialLabel}-${cost}`, "✨", render);
  } else {
    addLog(`${state.active.name}の${conf.label}訓練は失敗しました。${conf.materialLabel}-${cost}`);
    modal("訓練失敗", `集中が切れてしまいました。
素材は消費しましたが、成功回数は増えません。
${conf.materialLabel}-${cost}`, "…", render);
  }
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
  savePlayerNameFromInput();
  pendingType = id;
  const t = typeDef(id);
  pendingVariant = fixedVariant(t.id);
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
  const v = fixedVariant(t.id);
  state.active = {
    typeId: t.id, name,
    variantId: v.id, variantLabel: v.label, variantTrait: v.trait, variantImg: t.img,
    level: 1, feedExp: 0, wins: 0, maxDepth: 0,
    training: { hp: 0, def: 0, rock: 0, scissors: 0, paper: 0 }
  };
  state.relics = [];
  state.equipped = { rock: null, scissors: null, paper: null };
  state.run = null;
  state.battle = null;
  state.currentQuote = randomGirlQuote();
  addLog(`${name}が孵化しました。`);
  pendingType = null;
  pendingVariant = null;
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
  const feed = feedRoll(strong);
  state.feeds[feed.id] = (state.feeds[feed.id] || 0) + 1;
  addLog(`${source}で${feedStars(feed)}「${feed.name}」を入手しました。`);
  return feed;
}

function currentArea() {
  const id = state.run?.areaId || document.getElementById("areaSelect")?.value || "asatsuyu";
  return AREA_DEFS[id] || AREA_DEFS.asatsuyu;
}
function areaRelics(areaId = currentArea().id) {
  return RELIC_DEFS.filter(r => r.area === areaId);
}
function relicIcon(def, stars) {
  return `./assets/relics/${def.iconBase}_${stars}.png?v=38`;
}
function relicDesc(def, stars, value) {
  if (def.id === "bark_jaw") return `${def.effectText} ${stars3(stars)}（防御-${value}）`;
  if (def.id === "poison_scales") {
    const cond = stars === 1 ? "✋勝利時" : stars === 2 ? "✋勝利・あいこ時" : "✋勝利・あいこ・敗北時";
    return `${def.effectText} ${stars3(stars)}（${cond}に100%発動）`;
  }
  if (def.id === "five_soul") return `${def.effectText} ⭐⭐（発動後に消失）`;
  return `${def.effectText} ${stars3(stars)}（${value}倍）`;
}
function enemyPool(strong=false) {
  const area = currentArea();
  if (area.id === "jueki") return strong ? JUEKI_STRONG_ENEMIES : JUEKI_ENEMIES;
  return strong ? STRONG_ENEMIES : ENEMIES;
}
function feedRoll(strong=false) {
  const r = Math.random();
  if (currentArea().feedRareBoost) {
    if (strong) return r < 0.15 ? FEEDS.super : r < 0.60 ? FEEDS.ripe : FEEDS.unripe;
    return r < 0.08 ? FEEDS.super : r < 0.45 ? FEEDS.ripe : FEEDS.unripe;
  }
  return r < 0.05 ? FEEDS.super : r < 0.30 ? FEEDS.ripe : FEEDS.unripe;
}
function effectiveEnemyDef(enemy) {
  return Math.max(1, enemy.def - (state.battle?.enemyDefDown || 0));
}
function applyPoisonDamageToPlayer(messages) {
  if (!state.run?.poison) return false;
  const dmg = Math.max(1, Math.ceil(state.run.maxHp / 16));
  state.run.hp -= dmg;
  messages.push(`毒により${dmg}ダメージ。`);
  return state.run.hp <= 0;
}
function applyPoisonDamageToEnemy(messages) {
  if (!state.battle?.enemyPoison) return;
  const divisor = activeType()?.trait?.poisonDamageDivisor || 16;
  const dmg = Math.max(1, Math.ceil(state.battle.enemy.hp / divisor));
  state.battle.enemyHp -= dmg;
  messages.push(`${state.battle.enemy.name}は毒で${dmg}ダメージ。`);
}
function consumeFiveSoulIfNeeded() {
  if (!state.run || state.run.hp > 0) return null;
  for (const hand of ["rock","scissors","paper"]) {
    const r = equippedRelic(hand);
    if (r && r.defId === "five_soul") {
      state.run.hp = 1;
      state.equipped[hand] = null;
      state.relics = state.relics.filter(x => x.uid !== r.uid);
      const msg = `五分の魂が砕け、${state.active.name}はHP1で踏みとどまった。`;
      addLog(msg);
      return msg;
    }
  }
  return null;
}

function rollRelic(source = "探索") {
  const defs = areaRelics();
  const def = pick(defs.length ? defs : RELIC_DEFS);
  let stars = def.fixedStars || (Math.random() < 0.08 ? 3 : Math.random() < 0.271739 ? 2 : 1);
  const value = def.tiers[stars];
  const relic = {
    uid: uid(def.id), defId: def.id, name: def.name, hand: def.hand, stars,
    multiplier: value, icon: relicIcon(def, stars),
    desc: relicDesc(def, stars, value),
    effectText: def.effectText
  };
  state.relics.push(relic);
  addLog(`${source}で形見「${relic.name}」${stars3(stars)}を入手しました。`);
  return relic;
}
function equipRelic(uid, handOverride = null) {
  const relic = relicByUid(uid);
  if (!relic) return;
  const hand = handOverride || relic.hand;
  if (!["rock","scissors","paper"].includes(hand)) return;
  for (const h of ["rock","scissors","paper"]) if (state.equipped[h] === relic.uid) state.equipped[h] = null;
  state.equipped[hand] = relic.uid;
  addLog(`「${relic.name}」を${handLabel(hand)}に装備しました。`);
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
    modal("探索力不足", `探索力が足りません。
${nextEnergyText()}`, "⏳");
    return;
  }
  const area = currentArea();
  const st = stats();
  state.run = {
    areaId: area.id,
    areaName: area.name,
    floor: 1, maxFloor: area.maxFloor,
    hp: st.hp, maxHp: st.hp,
    poison: false,
    rewards: { honey: 0, sap: 0, pollen: 0 },
    relicFound: false,
    flags: { butterflyEscapeUsed: false }
  };
  state.battle = null;
  addLog(`${state.active.name}が${area.name}へ探索に出発しました。探索力-1`);
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
  const pool = enemyPool(strong);
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
  state.battle = { enemy, enemyHp: enemy.hp, enemyPoison: false, enemyDefDown: 0, text: `${enemy.name}が現れた。${enemy.text}`, turn: 1, lastPlayerWinHand: null, lastEnemyHand: null };
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
  const pool = [...(currentArea().id === "jueki" ? JUEKI_PLACE_EVENTS : PLACE_EVENTS)];
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
    if (!state.run.relicFound && Math.random() < currentArea().relicChance.event) {
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
  if (relic.defId === "bark_jaw" && hand === "scissors" && outcome === "win") {
    const maxDown = Math.max(1, Math.floor(state.battle.enemy.def / 2));
    const before = state.battle.enemyDefDown || 0;
    const after = Math.min(maxDown, before + relic.multiplier);
    state.battle.enemyDefDown = after;
    messages.push(after > before ? `樹皮カミキリの削顎が敵防御を${after - before}削った。` : `敵の防御はこれ以上削れない。`);
  }
  if (relic.defId === "poison_scales" && hand === "paper") {
    const ok = relic.stars >= 3 || (relic.stars === 2 && (outcome === "win" || outcome === "draw")) || (relic.stars === 1 && outcome === "win");
    if (ok && state.battle && !state.battle.enemyPoison) {
      state.battle.enemyPoison = true;
      messages.push(`夜羽蛾の毒鱗粉が舞い、敵を毒にした。`);
    }
  }
  return { bonusDamage, incomingDamage: reduced, messages };
}
function battleAct(hand) {
  if (!state.battle || !state.run || !state.active) return;
  const st = stats();
  const enemy = state.battle.enemy;
  const messages = [];
  if (applyPoisonDamageToPlayer(messages)) {
    state.battle.text = messages.join("\n");
    permaDeath(`毒で力尽きました。`);
    return;
  }
  const enemyHand = decideEnemyHand(enemy);
  applyPoisonDamageToEnemy(messages);
  if (state.battle.enemyHp <= 0) {
    state.battle.text = messages.join("\n");
    winBattle();
    return;
  }
  const result = handResult(hand, enemyHand);
  let dealt = 0;
  let incoming = 0;
  if (result === "win") {
    dealt = Math.max(1, Math.round(st[hand] - effectiveEnemyDef(enemy)));
  } else if (result === "lose") {
    incoming = Math.max(1, Math.round(enemy.atk - st.def * 0.45));
    const trait = activeType().trait || {};
    if (trait.scissorsTakenMult && enemyHand === "scissors") incoming = Math.round(incoming * trait.scissorsTakenMult);
  }
  const relicInfo = applyRelicEffect(hand, result, incoming);
  incoming = relicInfo.incomingDamage;
  dealt += relicInfo.bonusDamage;
  const trait = activeType().trait || {};
  if (result === "win" && dealt > 0 && trait.poisonOnWinChance && !state.battle.enemyPoison) {
    const poisonHands = trait.poisonHands || ["rock", "scissors", "paper"];
    if (poisonHands.includes(hand) && Math.random() < trait.poisonOnWinChance) {
      state.battle.enemyPoison = true;
      messages.push(`${state.active.name}の猛毒が回り、${enemy.name}を毒にした。`);
    }
  }
  if (dealt > 0) state.battle.enemyHp -= dealt;
  if (incoming > 0 && enemy.poisonChance && Math.random() < enemy.poisonChance && !state.run.poison) {
    state.run.poison = true;
    messages.push(`${enemy.name}の毒鱗粉を浴び、毒状態になった。`);
  }
  if (incoming > 0) state.run.hp -= incoming;
  let soulMsg = null;
  if (state.run.hp <= 0 && incoming > 0) soulMsg = consumeFiveSoulIfNeeded();
  state.battle.lastEnemyHand = enemyHand;
  state.battle.lastPlayerWinHand = result === "win" ? hand : null;
  state.battle.turn += 1;
  let msg = `${handLabel(hand)}で攻撃。相手は${handLabel(enemyHand)}。\n判定：${result === "win" ? "勝利" : result === "draw" ? "あいこ" : "敗北"}\n与ダメージ ${dealt}`;
  msg += incoming > 0 ? ` / 被ダメージ ${incoming}` : ` / 被ダメージ 0`;
  if (result === "draw" && dealt === 0 && incoming === 0) msg += `\nあいこ。お互いに様子を見た。`;
  if (messages.length) msg += `\n${messages.join("\n")}`;
  if (relicInfo.messages.length) msg += `\n${relicInfo.messages.join("\n")}`;
  if (soulMsg) msg += `\n${soulMsg}`;
  if (state.battle.enemyDefDown) msg += `\n敵防御低下：-${state.battle.enemyDefDown}`;
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
  const feedChance = enemy.strong ? currentArea().feedChance.strong : currentArea().feedChance.normal;
  const relicChance = enemy.strong ? currentArea().relicChance.strong : currentArea().relicChance.normal;
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
  const lost = {
    name: state.active.name,
    species: activeType().species,
    variant: state.active.variantLabel || "標準個体",
    level: state.active.level,
    depth: state.active.maxDepth,
    wins: state.active.wins,
    reason,
    date: new Date().toLocaleString("ja-JP")
  };
  state.graves.unshift(lost);
  state.graves = state.graves.slice(0, 30);
  state.lost = lost;
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

function playerRawName() {
  const input = document.getElementById("playerNameInput");
  const name = (input?.value || state.playerName || "ご主人様").trim();
  return name || "ご主人様";
}
function savePlayerNameFromInput() {
  state.playerName = playerRawName();
  save(true);
}
function quotePlayerName(typeId) {
  const raw = state.playerName || "ご主人様";
  if (typeId === "butterfly") return `${raw}さん`;
  if (typeId === "redback") return raw === "ご主人様" ? raw : `${raw}ちゃん`;
  return raw;
}
function formatGirlQuote(q, typeId) {
  return q.replaceAll("{player}", quotePlayerName(typeId));
}
function quoteTierForLevel(level) {
  if (level >= 20) return "bond20";
  if (level >= 10) return "bond10";
  return "normal";
}
function randomGirlQuote() {
  if (!state.active) return "";
  const typeId = state.active.typeId;
  const tier = quoteTierForLevel(state.active.level || 1);
  const set = GIRL_QUOTES[typeId] || {};
  const list = set[tier] || set.normal || [];
  const q = pick(list);
  return formatGirlQuote(q, typeId);
}
function speakGirl() {
  if (!state.active) return;
  state.currentQuote = randomGirlQuote();
  save(true);
  render();
}

function renderEggs() {
  const input = document.getElementById("playerNameInput");
  if (input && input.value !== (state.playerName || "ご主人様")) input.value = state.playerName || "ご主人様";
  if (input && !input.dataset.bound) {
    input.dataset.bound = "1";
    input.onchange = savePlayerNameFromInput;
    input.onblur = savePlayerNameFromInput;
  }
  const box = document.getElementById("eggCards");
  box.innerHTML = TYPES.map(t => `
    <article class="card eggCard">
      <img src="${t.eggImg || t.img}" alt="${t.species}の卵">
      <div class="cardTop"><h3>${t.species}</h3><span class="eggType">${t.role}</span></div>
      <p class="growth">成長率：HP${stars5(t.growth.hp)} / 防御${stars5(t.growth.def)} / ✊${stars5(t.growth.rock)} / ✌️${stars5(t.growth.scissors)} / ✋${stars5(t.growth.paper)}</p>
      <div class="traitBox"><b>${t.trait.name}</b><div class="mini">${t.trait.desc}</div></div>
      <button data-egg="${t.id}" class="primary">この卵を選ぶ</button>
    </article>`).join("");
  box.querySelectorAll("[data-egg]").forEach(btn => btn.onclick = () => selectEgg(btn.dataset.egg));
}
function renderGarden() {
  const box = document.getElementById("activeGirlBox");
  if (!state.active) {
    box.innerHTML = `<p>卵を選ぶとここに現在の虫娘が表示されます。</p>`;
    return;
  }
  const st = stats();
  if (!state.currentQuote) state.currentQuote = randomGirlQuote();
  box.innerHTML = `
    <img src="${activeImage()}" alt="${state.active.name}">
    <div class="meta">
      <div class="cardTop"><h3>${state.active.name}</h3><span class="level">Lv.${state.active.level}</span></div>
      <div class="speechBox simpleSpeechBox">
        <div class="speechText">「${state.currentQuote}」</div>
      </div>
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
      <p class="stats">${t.species}<br>${t.desc}</p>
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
            const c = TRAIN_CONFIG[k], count = tr[k] || 0, limit = trainSuccessLimit();
            const cost = count >= limit ? "Lv上限" : `${c.materialLabel}${trainCostForCount(count)}`;
            const bonus = c.bonus ? c.bonus(count) : 0;
            return `<button data-train="${k}">${c.label}<br>成功:${count}/${limit} / +${bonus}<br>${cost}</button>`;
          }).join("")}
        </div>
      </div>
    </article>`;
  el.querySelectorAll("[data-feed]").forEach(btn => btn.onclick = () => useFeed(btn.dataset.feed));
  el.querySelectorAll("[data-train]").forEach(btn => btn.onclick = () => trainStat(btn.dataset.train));
}

function relicGroupKey(r) {
  return `${r.defId || r.name}_${r.stars}_${r.hand}_${r.multiplier}`;
}
function groupedRelics() {
  const groups = {};
  (state.relics || []).forEach(r => {
    const key = relicGroupKey(r);
    if (!groups[key]) groups[key] = { sample: r, items: [], equippedHands: [] };
    groups[key].items.push(r);
  });
  for (const [hand, uid] of Object.entries(state.equipped || {})) {
    const r = relicByUid(uid);
    if (r) {
      const key = relicGroupKey(r);
      if (groups[key]) groups[key].equippedHands.push(hand);
    }
  }
  return Object.values(groups).sort((a, b) => {
    const ah = a.sample.hand === "all" ? "z" : a.sample.hand;
    const bh = b.sample.hand === "all" ? "z" : b.sample.hand;
    return ah.localeCompare(bh) || a.sample.name.localeCompare(b.sample.name) || b.sample.stars - a.sample.stars;
  });
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
  const groups = groupedRelics();
  if (!groups.length) {
    list.innerHTML = `<p class="stats">形見はまだありません。</p>`;
    return;
  }

  list.innerHTML = groups.map((g, idx) => {
    const r = g.sample;
    const equippedText = g.equippedHands.length ? `装備中：${g.equippedHands.map(handLabel).join(" / ")}` : "";
    const availableItems = g.items.filter(item => !Object.values(state.equipped || {}).includes(item.uid));
    const equipButtons = r.hand === "all"
      ? ["rock","scissors","paper"].map(h => `<button data-equip-group="${idx}" data-hand="${h}" ${!availableItems.length ? "disabled" : ""}>${handLabel(h)}に装備</button>`).join("")
      : `<button data-equip-group="${idx}" data-hand="${r.hand}" ${!availableItems.length ? "disabled" : ""}>${handLabel(r.hand)}に装備</button>`;
    return `
      <article class="relicCompact">
        <img class="relicMiniArt" src="${r.icon}" alt="${r.name}">
        <div class="relicCompactBody">
          <div class="relicCompactTop">
            <b>${r.name}</b>
            <span>${stars3(r.stars)} ×${g.items.length}</span>
          </div>
          <p class="stats">${r.desc}</p>
          ${equippedText ? `<div class="equippedBadge">${equippedText}</div>` : ""}
          <div class="equipButtons">${equipButtons}</div>
        </div>
      </article>`;
  }).join("");

  list.querySelectorAll("[data-equip-group]").forEach(btn => {
    btn.onclick = () => {
      const group = groups[Number(btn.dataset.equipGroup)];
      if (!group) return;
      const availableItems = group.items.filter(item => !Object.values(state.equipped || {}).includes(item.uid));
      const item = availableItems[0] || group.items[0];
      equipRelic(item.uid, btn.dataset.hand);
    };
  });
}function renderExplore() {
  updateEnergy();
  const energyBox = document.getElementById("energyBox");
  if (energyBox) energyBox.textContent = `探索力 ${state.energy.value} / ${ENERGY_MAX}　${nextEnergyText()}`;
  const areaInfo = document.getElementById("areaInfo");
  if (areaInfo) {
    const area = currentArea();
    areaInfo.textContent = `${area.name} / ${area.recommend} / 最大深度${area.maxFloor}`;
  }
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
  document.getElementById("floorText").textContent = `${state.run.areaName || currentArea().name}　深度 ${state.run.floor} / ${state.run.maxFloor}`;
  document.getElementById("hpText").textContent = `HP ${Math.max(0, state.run.hp)} / ${state.run.maxHp}`;
  if (state.battle) {
    explorePanel.classList.add("hidden");
    battlePanel.classList.remove("hidden");
    const st = stats();
    document.getElementById("playerImg").src = activeImage();
    document.getElementById("playerName").textContent = state.active.name;
    document.getElementById("playerHpText").textContent = `HP ${Math.max(0, state.run.hp)} / ${state.run.maxHp}${state.run.poison ? "（毒）" : ""}`;
    document.getElementById("playerHpBar").style.width = `${clamp((state.run.hp / state.run.maxHp) * 100, 0, 100)}%`;
    document.getElementById("enemySprite").innerHTML = `<img src="${state.battle.enemy.img}" alt="${state.battle.enemy.name}">`;
    document.getElementById("enemyName").textContent = state.battle.enemy.name;
    document.getElementById("enemyHandText").innerHTML = `得意手：${handLabel(state.battle.enemy.hand)}${state.battle.enemyPoison ? " <span class=\"statusBadge\">毒</span>" : ""}${state.battle.enemyDefDown ? ` <span class=\"statusBadge\">防御-${state.battle.enemyDefDown}</span>` : ""}`;
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
function backToEggSelect() {
  state.lost = null;
  save(true);
  render();
}
function render() {
  ensureFeeds();
  updateEnergy();
  const active = !!state.active;
  const lost = !!state.lost;
  document.getElementById("honey").textContent = state.resources.honey;
  document.getElementById("sap").textContent = state.resources.sap;
  document.getElementById("pollen").textContent = state.resources.pollen;
  document.getElementById("eggScreen").classList.toggle("hidden", active || !!pendingType || lost);
  document.getElementById("nameScreen").classList.toggle("hidden", !pendingType || lost);
  const lostScreen = document.getElementById("lostScreen");
  if (lostScreen) {
    lostScreen.classList.toggle("hidden", !lost);
    if (lost) {
      document.getElementById("lostTitle").textContent = `${state.lost.name}は死んでしまった……`;
      document.getElementById("lostSummary").textContent = `Lv.${state.lost.level} / 深度${state.lost.depth} / ${state.lost.wins}勝\n${state.lost.reason}`;
    }
  }
  document.getElementById("gameUI").classList.toggle("hidden", !active || lost);
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
  const exportSaveBtn = document.getElementById("exportSaveBtn");
  if (exportSaveBtn) exportSaveBtn.onclick = exportSaveData;
  const importSaveFile = document.getElementById("importSaveFile");
  if (importSaveFile) importSaveFile.onchange = e => importSaveFromFile(e.target.files?.[0]);
  const importSaveTextBtn = document.getElementById("importSaveTextBtn");
  if (importSaveTextBtn) importSaveTextBtn.onclick = () => importSaveFromText(document.getElementById("importSaveText")?.value || "");
  document.getElementById("confirmNameBtn").onclick = confirmName;
  document.getElementById("startExploreBtn").onclick = startRun;
  document.getElementById("modalOkBtn").onclick = closeModal;
  document.getElementById("retireBtn").onclick = retireCurrent;
  document.getElementById("resetBtn").onclick = resetAll;
  const backToEggBtn = document.getElementById("backToEggBtn");
  if (backToEggBtn) backToEggBtn.onclick = backToEggSelect;
  const areaSelect = document.getElementById("areaSelect");
  if (areaSelect) areaSelect.onchange = () => render();
  render();
  setInterval(renderExplore, 30000);
}
window.addEventListener("DOMContentLoaded", init);
if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
