import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';

test('Git exclusions protect recordings and private documents while keeping deployment code eligible',async()=>{
 const folder=await fs.mkdtemp(path.join(os.tmpdir(),'pulse-ignore-test-'));
 try{
  const init=spawnSync('git',['-C',folder,'init','--quiet','-b','main'],{encoding:'utf8',windowsHide:true});assert.equal(init.status,0,init.stderr);
  await fs.copyFile('.gitignore',path.join(folder,'.gitignore'));
  for(const name of ['node_modules/vite/package.json','dist/index.html','tests/fixtures/playback-test.mp4','recordings/take.mov','exports/take.webm','private/notes.md','screenplay.md','shot-list.pdf','.env.local','production-documents/notes.docx']){
   const result=spawnSync('git',['-C',folder,'check-ignore','--no-index',name],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,'Not ignored: '+name+' '+result.stderr);
  }
  for(const name of ['src/config/scenes.js','package-lock.json','vite.config.js','.github/workflows/deploy.yml','README.md','DEPLOYMENT.md','public/icons/icon-192.png']){
   const result=spawnSync('git',['-C',folder,'check-ignore','--no-index',name],{encoding:'utf8',windowsHide:true});assert.equal(result.status,1,'Unexpected exclusion: '+name+' '+result.stderr);
  }
 }finally{
  const checked=await fs.realpath(folder),allowed=await fs.realpath(os.tmpdir());assert.equal(path.dirname(checked).toLowerCase(),allowed.toLowerCase());assert.ok(path.basename(checked).startsWith('pulse-ignore-test-'));await fs.rm(checked,{recursive:true,force:true});
 }
});
