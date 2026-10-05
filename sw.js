// 베이스 실기 연습실: 오프라인 사용을 위한 간단한 서비스 워커
const CACHE='bass-practice-v2';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return;
  const url=new URL(req.url);
  // 앱 화면은 항상 최신 버전을 먼저 시도하고, 인터넷이 없으면 저장된 버전을 보여줘요
  if(req.mode==='navigate'||url.pathname.endsWith('index.html')){
    e.respondWith(fetch(req).then(r=>{ const cp=r.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return r; }).catch(()=>caches.match('./index.html')));
    return;
  }
  // 아이콘, 글꼴 등은 저장된 것을 먼저 쓰고 없으면 받아와서 저장해요
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r.ok&&(url.origin===location.origin||url.hostname.endsWith('gstatic.com')||url.hostname.endsWith('googleapis.com'))){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; })));
});
