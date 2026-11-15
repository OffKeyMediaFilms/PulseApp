import {localVideoSettings} from '../config/local-videos.js';
import {validateVideo,storageMessage} from '../utils/video-store.js';
import {cameraSettings} from '../config/camera.js';
import {video,escapeHTML as e} from './media.js';
import {CameraSession,recordingExtension} from '../utils/camera-session.js';
export function cameraConfig(scene){const original=scene.cameraScene||(scene.view==='live'?16:scene.id===15?14:9);return {...cameraSettings,...cameraSettings.scenes[original],...(scene.camera||{}),live:{...cameraSettings.live,...scene.liveSettings}}}
export function cameraScreen(scene,live=false){const c=cameraConfig({...scene,view:live?'live':'record'});return '<section class="capture-screen" data-capture="'+(live?'live':'record')+'"><div class="capture-source" id="capture-prerecorded">'+video(c.media||'recording',scene.localVideo?{src:scene.localVideo.url,poster:'',aspect:'9 / 16'}:undefined)+'</div><video id="camera-preview" class="camera-preview" playsinline muted hidden></video><video id="recorded-preview" class="camera-preview" playsinline controls hidden></video><div class="capture-top"><span class="capture-badge" id="capture-indicator">READY</span><time id="capture-time">00:00</time>'+(live?'<span>Viewers · <b id="capture-viewers">'+e(c.live.viewerCount??'—')+'</b></span>':'')+'</div><div class="capture-tools"><button data-action="camera-open">Record Video</button><button data-action="camera-upload">Upload Video</button><button data-action="camera-library">Saved Videos</button><input type="file" id="camera-file" accept="'+e(localVideoSettings.accept)+'" hidden><button data-action="camera-prerecorded">Use video</button><button data-action="camera-switch" disabled>Flip</button><button data-action="camera-mic" disabled>Mic on</button></div><div class="capture-bottom"><h2>'+e(live?'Stay Live':scene.cameraScene?c.prompt:scene.prompt||c.prompt)+'</h2>'+(live?'<div id="capture-comments" class="capture-comments" aria-live="polite"></div><div id="capture-hearts" aria-hidden="true"></div>':'')+(live?'<label class="live-save-toggle"><input type="checkbox" id="record-live"> Record live footage</label>':'')+'<p id="capture-status" role="status">Choose camera or prerecorded video</p><div class="capture-actions"><button class="primary" data-action="camera-start">'+(live?'Go live':'Start recording')+'</button><button class="primary" data-action="camera-stop" hidden>'+(live?'End Live':'Stop recording')+'</button><button data-action="camera-retake" hidden>Retake</button><button data-action="camera-play" hidden>Play / pause</button><button data-action="camera-save" hidden>Save Video</button><button class="primary" data-action="camera-post" hidden>Post to Pulse</button><a class="download-recording" id="recording-download" hidden download>Export Video</a></div><button class="camera-only" data-action="camera-silent" hidden>Open camera without microphone</button></div></section>'}
export class CameraUI {
 constructor(root,scene,environment={}){this.root=root;this.scene=scene;this.callbacks=environment;this.disposed=false;this.document=environment.document||globalThis.document;this.config=cameraConfig(scene);this.isLive=!!root.querySelector('[data-capture="live"]');this.source='none';this.session=new CameraSession(this.config,()=>this.paint(),{...environment,onCapture:environment.onDraft&&localVideoSettings.autoSaveTakes?blob=>environment.onDraft(blob,'camera').catch(()=>{}):undefined});this.liveCount=this.config.live.viewerCount;this.viewDelta=0;this.commentIndex=0;this.run=0;this.paint();const picker=this.el('camera-file');if(picker)picker.onchange=()=>{const file=picker.files?.[0];picker.value='';if(file)this.importFile(file)}}
 el(id){return this.root.querySelector('#'+id)}
 status(text){this.el('capture-status').textContent=text}
 paint(){
  const s=this.session,preview=this.el('camera-preview'),review=this.el('recorded-preview');if(!preview||this.disposed)return;this.root.querySelector('.capture-screen').dataset.mode=s.mode;if(s.mode==='ended'&&!this.simulating)this.stopEffects();
  if(preview.srcObject!==s.stream){preview.srcObject=s.stream;if(s.stream)preview.play().catch(()=>this.status('Tap preview to play.'))}
  preview.hidden=!s.stream;preview.muted=true;preview.classList.toggle('mirrored',s.facing==='user');
  if(s.url&&review.getAttribute('src')!==s.url)review.src=s.url;review.hidden=s.mode!=='review';
  this.el('capture-prerecorded').hidden=!!s.stream||s.mode==='review';
  const running=['recording','live','stopping'].includes(s.mode)||this.simulating;
  this.el('capture-indicator').textContent=this.simulating?(this.isLive?'LIVE':'REC'):s.mode==='live'?'LIVE':s.mode==='recording'?(this.isLive&&this.recordLive?'LIVE':'REC'):s.mode==='review'?'PREVIEW':s.mode==='ended'?'ENDED':'READY';
  this.el('capture-indicator').classList.toggle('is-recording',!!running);
  const time=this.simulating?Math.floor((performance.now()-this.simStarted)/1000):s.elapsed;
  this.el('capture-time').textContent=String(Math.floor(time/60)).padStart(2,'0')+':'+String(time%60).padStart(2,'0');
  for(const action of ['camera-open','camera-prerecorded','camera-switch']){const b=this.root.querySelector('[data-action="'+action+'"]');b.disabled=!!running||!!this.saving||!!this.posting||(s.mode==='opening'&&action!=='camera-prerecorded')||(action==='camera-switch'&&!s.stream)}
  const mic=this.root.querySelector('[data-action="camera-mic"]');mic.disabled=!s.stream;mic.textContent=s.microphone?'Mic on':'Mic off';mic.setAttribute('aria-pressed',String(s.microphone));
  this.root.querySelector('[data-action="camera-start"]').hidden=!!running||s.mode==='review';
  this.root.querySelector('[data-action="camera-start"]').disabled=s.mode==='opening'||this.source==='none';
  this.root.querySelector('[data-action="camera-stop"]').hidden=!running;
  this.root.querySelector('[data-action="camera-stop"]').disabled=s.mode==='stopping';
  this.root.querySelector('[data-action="camera-retake"]').hidden=!['review','ended'].includes(s.mode);this.root.querySelector('[data-action="camera-retake"]').disabled=!!this.saving||!!this.posting;
  this.root.querySelector('[data-action="camera-silent"]').hidden=!s.error;
  const download=this.el('recording-download');download.hidden=!s.url;if(s.url){download.href=s.url;download.download=s.blob.name||this.config.filename+'.'+recordingExtension(s.blob.type)}
  for(const action of ['camera-upload','camera-library']){const button=this.root.querySelector('[data-action="'+action+'"]');if(button)button.disabled=!!running||!!this.saving||!!this.posting||s.mode==='opening'}
  for(const action of ['camera-play','camera-save','camera-post']){const button=this.root.querySelector('[data-action="'+action+'"]');if(button){button.hidden=s.mode!=='review';button.disabled=!!this.saving||!!this.posting}}
  const save=this.root.querySelector('[data-action="camera-save"]');if(save)save.textContent=this.savedId?'Saved to device':'Save Video';
  const liveToggle=this.el('record-live');if(liveToggle)liveToggle.disabled=!!running||this.source!=='camera';
  if(s.mode==='review'&&s.blob&&s.blob!==this.lastDraft){this.lastDraft=s.blob;this.savedId=null;if(localVideoSettings.autoSaveTakes&&this.callbacks.onDraft)this.saveDraft()}
  if(this.localError)this.status(this.localError);else if(this.saving)this.status('Saving on this device…');else if(this.posting)this.status('Posting…');else if(s.error)this.status(s.error);else if(s.mode==='opening')this.status('Allow camera and microphone access');else if(s.mode==='review')this.status(this.savedId?'Saved on this device':'Video ready');else if(s.mode==='ended')this.status(this.isLive?'Live ended':'Take ended');else if(running||s.mode==='preview')this.status('');
 }
 async handle(action){
  const s=this.session;
  if(action==='camera-upload'){this.el('camera-file').click();return}
  if(action==='camera-library'){this.callbacks.onLibrary?.();return}
  if(action==='camera-play'){const player=this.el('recorded-preview');if(player.paused)player.play().catch(()=>this.status('Video format cannot play here. Export or choose another video.'));else player.pause();return}
  if(action==='camera-save'){await this.saveDraft();return}
  if(action==='camera-post'){const item=await this.saveDraft();if(item&&!this.disposed){this.posting=true;this.paint();try{await this.callbacks.onPost?.(item.id)}catch(error){this.localError=storageMessage(error);this.posting=false;this.paint()}}return}
  if(action==='camera-open'||action==='camera-silent'){this.stopSimulation();this.source='camera';await s.open(action==='camera-silent'?{microphone:false}:{});return}
  if(action==='camera-switch'){await s.switchCamera();return}
  if(action==='camera-mic'){await s.toggleMicrophone();return}
  if(action==='camera-prerecorded'){this.stopSimulation();s.cancel();this.source='video';this.status('Prerecorded video selected');this.paint();return}
  if(action==='camera-retake'){this.localError='';this.lastDraft=null;this.savedId=null;this.stopSimulation();s.cancel();this.source='none';this.el('recorded-preview').removeAttribute('src');this.status('Choose camera or prerecorded video');this.paint();return}
  if(action==='camera-start'){
   if(this.source==='camera'){this.recordLive=this.isLive&&!!this.el('record-live')?.checked;const started=this.isLive&&!this.recordLive?s.startLive():s.start();if(started&&this.isLive)this.liveEffects();return}
   const v=this.el('capture-prerecorded').querySelector('video');if(!v){this.status('Insert video here or open camera');return}
   try{await v.play();this.simulating=true;this.simStarted=performance.now();this.simTimer=setInterval(()=>this.paint(),250);if(this.isLive)this.liveEffects();this.paint()}catch{this.status('This video could not play. Choose another file.')}return;
  }
  if(action==='camera-stop'){if(this.simulating){this.stopSimulation();s.mode='ended';this.paint()}else if(this.isLive){this.stopEffects();if(s.recorder?.state==='recording')s.stop();else s.endLive()}else s.stop()}
 }
 async importFile(file){try{validateVideo(file);this.localError='';this.stopSimulation();this.source='import';this.session.load(file);const player=this.el('recorded-preview');player.onerror=()=>this.status('Video format cannot play here. Export or choose another video.')}catch(error){this.status(storageMessage(error))}}
 async saveDraft(){
  if(this.savedId)return {id:this.savedId};if(this.savePromise)return this.savePromise;if(!this.session.blob||!this.callbacks.onDraft)return null;
  const blob=this.session.blob;this.saving=true;this.localError='';
  this.savePromise=Promise.resolve().then(()=>this.callbacks.onDraft(blob,this.source)).then(item=>{if(this.session.blob===blob){this.savedId=item.id;this.localError=''}return item}).catch(error=>{this.localError=storageMessage(error);return null}).finally(()=>{this.saving=false;this.savePromise=null;if(!this.disposed)this.paint()});this.paint();return this.savePromise;
 }
 liveEffects(){this.stopEffects();this.viewDelta=0;this.commentIndex=0;this.el('capture-comments').replaceChildren();this.el('capture-viewers').textContent=this.liveCount??'—';const token=++this.run,c=this.config.live;this.commentTimer=setInterval(()=>{if(token!==this.run)return;const list=c.comments||[],text=list[this.commentIndex++%Math.max(1,list.length)];if(text){const p=this.document.createElement('p');p.textContent=typeof text==='string'?text:(text.username?text.username+' · ':'')+text.text;const el=this.el('capture-comments');el.append(p);if(el.children.length>15)el.firstChild.remove();el.scrollTop=el.scrollHeight}const step=c.viewerSteps?.[(this.commentIndex-1)%c.viewerSteps.length]||0;this.viewDelta+=step;this.el('capture-viewers').textContent=typeof this.liveCount==='number'?Math.max(0,this.liveCount+this.viewDelta):this.viewDelta?'+'+this.viewDelta:'—'},Math.max(100,c.commentIntervalMs));this.heartTimer=setInterval(()=>{const h=this.document.createElement('span');h.textContent='♥';h.className='live-heart';h.style.setProperty('--heart-ms',c.heartAnimationMs+'ms');h.style.left=(this.commentIndex%3)*8+'px';this.el('capture-hearts').append(h);h.addEventListener('animationend',()=>h.remove());setTimeout(()=>h.remove(),c.heartAnimationMs+100)},Math.max(100,c.heartIntervalMs))}
 stopEffects(){++this.run;clearInterval(this.commentTimer);clearInterval(this.heartTimer);this.el('capture-hearts')?.replaceChildren()}
 stopSimulation(){this.simulating=false;clearInterval(this.simTimer);this.stopEffects();this.el('capture-prerecorded')?.querySelector('video')?.pause()}
 destroy(){this.disposed=true;this.stopSimulation();this.session.destroy();const p=this.el('recorded-preview');if(p){p.pause();p.removeAttribute('src')}const v=this.el('camera-preview');if(v)v.srcObject=null}
}
