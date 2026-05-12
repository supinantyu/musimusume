const CACHE_NAME="mushimusume-v19-ui-loss-eggs";
const ASSETS=[
  "./", "./index.html", "./style.css", "./app.js", "./manifest.webmanifest",
  "./assets/icons/icon-192.png", "./assets/icons/icon-512.png",
  "./assets/eggs/butterfly_egg.png","./assets/eggs/beetle_egg.png","./assets/eggs/mantis_egg.png",
  "./assets/characters/butterfly_1.png","./assets/characters/butterfly_2.png","./assets/characters/butterfly_3.png","./assets/characters/butterfly_4.png",
  "./assets/characters/beetle_1.png","./assets/characters/beetle_2.png","./assets/characters/beetle_3.png","./assets/characters/beetle_4.png",
  "./assets/characters/mantis_1.png","./assets/characters/mantis_2.png","./assets/characters/mantis_3.png","./assets/characters/mantis_4.png",
  "./assets/relics/beetle_1.png","./assets/relics/beetle_2.png","./assets/relics/beetle_3.png",
  "./assets/relics/cicada_1.png","./assets/relics/cicada_2.png","./assets/relics/cicada_3.png",
  "./assets/relics/mantis_1.png","./assets/relics/mantis_2.png","./assets/relics/mantis_3.png",
  "./assets/enemies/aphid_swarm.png","./assets/enemies/territorial_bee.png","./assets/enemies/rotten_centipede.png","./assets/enemies/web_spider.png",
  "./assets/enemies/angry_hornet.png","./assets/enemies/night_stag.png","./assets/enemies/old_nest_spider.png"
];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const url=new URL(e.request.url);
  const freshFirst=["document","script","style"].includes(e.request.destination)||url.pathname.endsWith(".html")||url.pathname.endsWith(".js")||url.pathname.endsWith(".css");
  if(freshFirst){
    e.respondWith(fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));
      return res;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request)));
});
