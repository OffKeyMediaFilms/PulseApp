import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {pulsePagesAssets} from '../scripts/pages-assets.mjs';

test('Pages worker scopes cleanup and offline fallback without touching original PULSE',async()=>{
 const scope='https://example.github.io/PulseApp/',prefix='pulse-app:'+scope+':',deleted=[],listeners={};
 const source=(await fs.readFile('sw.js','utf8')).replace('__PULSE_VERSION__','test').replace('/* __PULSE_FILES__ */ []',JSON.stringify(['./','./index.html','./assets/app.js']));
 const context={URL,Response,self:{registration:{scope},skipWaiting(){},clients:{claim:async()=>{}},addEventListener:(name,fn)=>listeners[name]=fn},fetch:async()=>{throw new Error('offline')},caches:{keys:async()=>[prefix+'old',prefix+'test','pulse-app:https://example.github.io/PULSE/:old','pulse-v4'],delete:async key=>deleted.push(key),open:async()=>({addAll:async()=>{}}),match:async key=>String(key)===scope+'index.html'?new Response('Pulse shell'):undefined}};
 vm.runInNewContext(source,context);let promise;listeners.activate({waitUntil:p=>promise=p});await promise;assert.deepEqual(deleted,[prefix+'old']);
 let response;listeners.fetch({request:{url:scope+'#/scene/21',method:'GET',headers:new Headers(),mode:'navigate'},respondWith:p=>response=p});assert.equal(await (await response).text(),'Pulse shell');
 response=null;listeners.fetch({request:{url:'https://example.github.io/PULSE/',method:'GET',headers:new Headers(),mode:'navigate'},respondWith:p=>response=p});assert.equal(response,null);
 response=null;listeners.fetch({request:{url:scope+'public/videos/clip.mp4',method:'GET',headers:new Headers(),mode:'cors'},respondWith:p=>response=p});assert.equal(response,null);
});

test('Pages packaging includes approved assets but excludes documents, private folders and video precache',async()=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'pulse-pages-test-'));
 try{
  const fixtures={'dist/index.html':'<html>Pulse</html>','dist/assets/app.js':'console.log("Pulse")','public/icons/pulse.svg':'<svg/>','public/videos/approved.mp4':'test bytes','public/videos/document.pdf':'test document','private/notes.txt':'test notes','manifest.webmanifest':JSON.stringify({display:'standalone',icons:[]}), 'sw.js':await fs.readFile('sw.js','utf8')};
  for(const [name,value]of Object.entries(fixtures)){await fs.mkdir(path.dirname(path.join(folder,name)),{recursive:true});await fs.writeFile(path.join(folder,name),value)}
  const plugin=pulsePagesAssets();plugin.configResolved({root:folder,command:'build',base:'/PulseApp/',build:{outDir:'dist'}});await plugin.closeBundle();
  await fs.access(path.join(folder,'dist/public/videos/approved.mp4'));await fs.access(path.join(folder,'dist/public/icons/pulse.svg'));
  await assert.rejects(fs.access(path.join(folder,'dist/public/videos/document.pdf')));await assert.rejects(fs.access(path.join(folder,'dist/private/notes.txt')));
  const worker=await fs.readFile(path.join(folder,'dist/sw.js'),'utf8');assert.ok(worker.includes('./assets/app.js'));assert.ok(!worker.includes('approved.mp4'));assert.ok(!worker.includes('__PULSE_'));
 }finally{
  const checked=await fs.realpath(folder);const allowed=await fs.realpath(os.tmpdir());assert.equal(path.dirname(checked).toLowerCase(),allowed.toLowerCase());assert.ok(path.basename(checked).startsWith('pulse-pages-test-'));await fs.rm(checked,{recursive:true,force:true});
 }
});
