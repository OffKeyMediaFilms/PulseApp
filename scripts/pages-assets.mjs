import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

// Only these approved app asset folders are copied. Documents and recordings are excluded.
const approved = {icons:/\.(png|svg|ico|webp)$/i,images:/\.(png|jpe?g|webp|avif|gif|svg)$/i,videos:/\.(mp4|webm|mov|m4v|ogv)$/i};
async function walk(dir){const entries=await fs.readdir(dir,{withFileTypes:true}).catch(e=>{if(e.code==='ENOENT')return [];throw e});const files=[];for(const entry of entries){if(entry.name.startsWith('.')||entry.isSymbolicLink())continue;const file=path.join(dir,entry.name);if(entry.isDirectory())files.push(...await walk(file));else if(entry.isFile())files.push(file)}return files}
export function pulsePagesAssets(){
 let config;
 return {
  name:'pulse-pages-assets',
  configResolved(value){config=value},
  transformIndexHtml:{order:'post',handler(){return [{tag:'link',attrs:{rel:'manifest',href:config.base+'manifest.webmanifest'},injectTo:'head'}]}},
  async closeBundle(){
   if(config.command!=='build')return;
   const output=path.resolve(config.root,config.build.outDir);
   for(const [folder,allowed] of Object.entries(approved)){
    const source=path.join(config.root,'public',folder);
    for(const file of await walk(source)){if(!allowed.test(file))continue;const relative=path.relative(source,file);const target=path.join(output,'public',folder,relative);await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(file,target)}
   }
   const manifest=JSON.parse(await fs.readFile(path.join(config.root,'manifest.webmanifest'),'utf8'));
   manifest.id='./';manifest.start_url='./';manifest.scope='./';
   await fs.writeFile(path.join(output,'manifest.webmanifest'),JSON.stringify(manifest,null,2)+'\n');
   await fs.writeFile(path.join(output,'.nojekyll'),'');
   const files=(await walk(output)).map(file=>path.relative(output,file).replaceAll('\\','/')).filter(file=>file!=='sw.js'&&!/\.(mp4|webm|mov|m4v|ogv)$/i.test(file)).sort();
   const template=await fs.readFile(path.join(config.root,'sw.js'),'utf8');
   const digest=createHash('sha256').update(template);for(const file of files)digest.update(file).update(await fs.readFile(path.join(output,file)));
   const sw=template.replace('__PULSE_VERSION__',digest.digest('hex').slice(0,16)).replace('/* __PULSE_FILES__ */ []',JSON.stringify(['./',...files.map(file=>'./'+file)]));
   await fs.writeFile(path.join(output,'sw.js'),sw);
  }
 };
}
