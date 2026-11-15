import {localVideoSettings} from '../config/local-videos.js';
export function storageMessage(error){return error?.name==='QuotaExceededError'?'Device storage is full. Export this video and free space before saving.':error?.message||'Local storage is unavailable. Export your video before leaving.'}
export function validateVideo(blob,maxBytes=localVideoSettings.maxVideoBytes){
 if(!blob||!blob.size)throw new Error('Choose a video file with content.');
 if(blob.size>maxBytes)throw new Error('Video is too large. Choose a smaller file.');
 if(blob.type&&!blob.type.startsWith('video/')&&!/\.(mp4|mov|webm|m4v|ogv)$/i.test(blob.name||''))throw new Error('Choose a video file.');
}
export class VideoStore {
 constructor({indexedDB=globalThis.indexedDB,crypto=globalThis.crypto,settings=localVideoSettings}={}){this.factory=indexedDB;this.crypto=crypto;this.settings=settings;this.pending=null}
 open(){
  if(!this.factory)return Promise.reject(new Error('This browser cannot save videos locally. Export your video instead.'));
  if(this.pending)return this.pending;
  this.pending=new Promise((resolve,reject)=>{const req=this.factory.open(this.settings.databaseName,this.settings.databaseVersion);
   req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('assets'))db.createObjectStore('assets',{keyPath:'id'});if(!db.objectStoreNames.contains('items')){const items=db.createObjectStore('items',{keyPath:'id'});items.createIndex('digest','digest',{unique:true})}if(!db.objectStoreNames.contains('bindings'))db.createObjectStore('bindings',{keyPath:'sceneId'})};
   req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>{db.close();this.pending=null};resolve(db)};
   req.onerror=()=>{this.pending=null;reject(req.error)};req.onblocked=()=>{this.pending=null;reject(new Error('Close other Pulse tabs and try saving again.'))};
  });return this.pending;
 }
 async transact(names,mode,operation){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(names,mode);let result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||new Error('Local video operation failed.'));tx.onabort=()=>reject(tx.error||new Error('Video operation was cancelled.'));try{operation(tx,value=>result=value)}catch(error){tx.abort();reject(error)}})}
 async save(blob,metadata={}){
  validateVideo(blob,this.settings.maxVideoBytes);
  const digest=this.crypto?.subtle?Array.from(new Uint8Array(await this.crypto.subtle.digest('SHA-256',await blob.arrayBuffer()))).map(v=>v.toString(16).padStart(2,'0')).join(''):undefined;
  const id=this.crypto?.randomUUID?.()||'take-'+Date.now().toString(36)+'-'+Array.from(this.crypto?.getRandomValues?.(new Uint32Array(3))||[Math.random()*1e9,Math.random()*1e9]).map(v=>Math.floor(v).toString(36)).join('-');
  const item={id,createdAt:Date.now(),title:metadata.title||blob.name||this.settings.defaultTitle,sceneId:metadata.sceneId,shot:metadata.shot||'',creator:metadata.creator||'Creator',source:metadata.source||'import',type:blob.type||metadata.type||'application/octet-stream',size:blob.size,...(digest?{digest}:{})};
  return this.transact(['items','assets'],'readwrite',(tx,done)=>{const write=()=>{tx.objectStore('assets').put({id,blob});tx.objectStore('items').put(item);done(item)};if(digest){const req=tx.objectStore('items').index('digest').get(digest);req.onsuccess=()=>req.result?done(req.result):write()}else write()});
 }
 list(){return this.transact(['items'],'readonly',(tx,done)=>{const req=tx.objectStore('items').getAll();req.onsuccess=()=>done(req.result.sort((a,b)=>b.createdAt-a.createdAt))})}
 get(id){return this.transact(['items','assets'],'readonly',(tx,done)=>{const info=tx.objectStore('items').get(id),asset=tx.objectStore('assets').get(id);asset.onsuccess=()=>done(info.result&&asset.result?{...info.result,blob:asset.result.blob}:null)})}
 bindings(){return this.transact(['bindings'],'readonly',(tx,done)=>{const r=tx.objectStore('bindings').getAll();r.onsuccess=()=>done(r.result)})}
 assign(id,sceneId){return this.transact(['items','bindings'],'readwrite',(tx,done)=>{const req=tx.objectStore('items').get(id);req.onsuccess=()=>{if(!req.result){tx.abort();return}tx.objectStore('bindings').put({sceneId:Number(sceneId),videoId:id});done(id)}})}
 unassign(sceneId){return this.transact(['bindings'],'readwrite',(tx,done)=>{tx.objectStore('bindings').delete(Number(sceneId));done(true)})}
 remove(id){return this.transact(['assets','items','bindings'],'readwrite',(tx,done)=>{tx.objectStore('assets').delete(id);tx.objectStore('items').delete(id);const cursor=tx.objectStore('bindings').openCursor();cursor.onsuccess=()=>{const c=cursor.result;if(c){if(c.value.videoId===id)c.delete();c.continue()}else done(true)}})}
 async close(){const db=await this.pending;db?.close();this.pending=null}
}
export const videoStore = new VideoStore();
