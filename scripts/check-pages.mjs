import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {scenes} from '../src/config/scenes.js';
import {media} from '../src/config/media.js';
import {videos} from '../src/config/feeds.js';

const BASE='/PulseApp/';
const origin=new URL('https://example.github.io'+BASE);
const output=path.resolve('dist');
const html=await fs.readFile(path.join(output,'index.html'),'utf8');
async function existsURL(value,relative=origin){
 if(value.startsWith('data:')||value.startsWith('#'))return;
 const url=new URL(value,relative);
 assert.equal(url.origin,origin.origin,'Unexpected external build asset: '+value);
 assert.ok(url.pathname.startsWith(BASE),'Asset escapes the repository base: '+value);
 const relativePath=decodeURIComponent(url.pathname.slice(BASE.length))||'index.html';
 const filename=path.resolve(output,relativePath);
 assert.ok(filename.startsWith(output+path.sep),'Asset path escapes dist');
 await fs.access(filename);return url;
}
for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g))await existsURL(match[1]);
assert.ok(html.includes(BASE+'manifest.webmanifest'),'HTML must link to the root PWA manifest');
assert.ok(!html.includes('./src/'),'Production HTML must use compiled assets');
const manifest=JSON.parse(await fs.readFile(path.join(output,'manifest.webmanifest'),'utf8'));
assert.equal(manifest.display,'standalone');assert.equal(new URL(manifest.start_url,origin).pathname,BASE);assert.equal(new URL(manifest.scope,origin).pathname,BASE);
for(const icon of manifest.icons)await existsURL(icon.src);
const worker=await fs.readFile(path.join(output,'sw.js'),'utf8');
assert.ok(!worker.includes('__PULSE_'),'Service-worker build tokens must be replaced');
assert.ok(worker.includes('self.registration.scope'),'Worker caches must be scoped to this site');
const files=JSON.parse(worker.match(/const FILES=(\[[^;]+\]);/)[1]);
for(const file of files)await existsURL(file);
assert.ok(files.some(file=>/assets\/.+\.js$/.test(file)),'Worker must cache the compiled JS');
assert.ok(files.every(file=>!file.includes('/src/')&&!/\.(mp4|webm|mov|m4v|ogv)$/i.test(file)),'Worker must not precache source files or videos');
assert.equal(scenes.length,21);
for(const scene of scenes){const url=new URL('#/scene/'+scene.id,origin);assert.equal(url.pathname,BASE)}
// Existing editable media paths remain relative to the application, including on Pages.
for(const asset of [...Object.values(media),...Object.values(videos).map(v=>v.video)])for(const key of ['src','poster'])if(asset[key])await existsURL(asset[key]);
async function walk(folder){const result=[];for(const entry of await fs.readdir(folder,{withFileTypes:true})){const item=path.join(folder,entry.name);if(entry.isDirectory())result.push(...await walk(item));else result.push(item)}return result}
for(const file of await walk(output))assert.ok(!/(?:node_modules|[\\/]tests[\\/]|[\\/]private[\\/]|[\\/]recordings[\\/]|\.(?:pdf|docx?|xlsx?|pptx?|pem|key|sqlite|db)$|\.env)/i.test(file),'Private or unnecessary build file: '+file);
console.log('Pages checks passed: 21 scenes, compiled assets, manifest/icons, scoped worker, media paths, clean deployment output.');
