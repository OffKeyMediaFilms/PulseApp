// Vite fills the version and compiled asset list during production build.
// Scope-specific caches never delete caches belonging to the original /PULSE/ site.
const PREFIX='pulse-app:'+self.registration.scope+':';
const CACHE=PREFIX+'__PULSE_VERSION__';
const FILES=/* __PULSE_FILES__ */ [];
const ROOT=new URL(self.registration.scope);
const SHELL=new Set(FILES.map(file=>new URL(file,ROOT).href));
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));
 self.skipWaiting();
});
self.addEventListener('activate',event=>event.waitUntil(
 caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||event.request.headers.has('range')||url.origin!==ROOT.origin||!url.pathname.startsWith(ROOT.pathname))return;
 // Uploaded/recorded blobs stay in IndexedDB; never cache media or unrelated paths.
 if(!SHELL.has(url.href)&&event.request.mode!=='navigate')return;
 event.respondWith(fetch(event.request).then(response=>{
  if(response.ok&&SHELL.has(url.href)){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)))}
  return response;
 }).catch(async()=>await caches.match(event.request)||
  (event.request.mode==='navigate'?await caches.match(new URL('index.html',ROOT).href):null)||
  new Response('Unavailable offline',{status:503})));
});
