import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base='http://127.0.0.1:4173/PulseApp/';
const child=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4173','--strictPort'],{stdio:['ignore','pipe','pipe'],windowsHide:true});
let error='';child.stderr.on('data',chunk=>error+=chunk);child.on('error',e=>error=e.message);
try{
 let ready=false;for(let attempt=0;attempt<60;attempt++){try{if((await fetch(base)).ok){ready=true;break}}catch{}if(child.exitCode!==null)break;await new Promise(resolve=>setTimeout(resolve,100))}
 assert.ok(ready,'Production preview did not start: '+error);
 const response=await fetch(base);assert.match(response.headers.get('content-type'),/text\/html/);const html=await response.text();
 const worker=await fs.readFile('dist/sw.js','utf8');const files=JSON.parse(worker.match(/const FILES=(\[[^;]+\]);/)[1]);
 const paths=new Set([...files,...[...html.matchAll(/(?:href|src)="([^"]+)"/g)].map(match=>match[1]),'./sw.js']);
 for(const value of paths){if(value.startsWith('data:'))continue;const url=new URL(value,base);assert.ok(url.pathname.startsWith('/PulseApp/'));const result=await fetch(url);assert.equal(result.status,200,url.href);if(/\.(js|css|webmanifest|png|svg)$/.test(url.pathname))assert.ok(!result.headers.get('content-type')?.includes('text/html'),'Missing asset returned HTML: '+url.href)}
 for(let id=1;id<=21;id++){const result=await fetch(base+'#/scene/'+id);assert.equal(result.status,200)}
 console.log('HTTP preview passed at /PulseApp/: all built assets, worker files and 21 scene URLs return correctly.');
}finally{child.kill()}
