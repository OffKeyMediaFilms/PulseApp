// Local-only capture. No network, storage, or permission requests in the constructor.
export function recordingType(Recorder,types){return types.find(type=>Recorder?.isTypeSupported?.(type))||''}
export function recordingExtension(type){return type.includes('mp4')?'mp4':type.includes('webm')?'webm':type.includes('ogg')?'ogv':'bin'}
export class CameraSession {
 constructor(settings,onUpdate=()=>{},environment={}){
  this.settings=settings;this.update=onUpdate;this.env={devices:globalThis.navigator?.mediaDevices,Recorder:globalThis.MediaRecorder,urls:globalThis.URL,now:()=>performance.now(),secure:globalThis.isSecureContext!==false,...environment};
  this.mode='idle';this.facing=settings.facingMode;this.microphone=settings.microphone;this.stream=null;this.url='';this.blob=null;this.elapsed=0;this.error='';this.generation=0;this.disposed=false;
 }
 emit(){if(!this.disposed)this.update(this)}
 releaseTracks(){this.stream?.getTracks().forEach(track=>track.stop());this.stream=null}
 clearRecording(){if(this.url)this.env.urls.revokeObjectURL(this.url);this.url='';this.blob=null}
 async open({facing=this.facing,microphone=this.microphone}={}){
  if(this.disposed)return false;
  if(['recording','stopping','live'].includes(this.mode)){this.error='Stop the take before switching cameras.';this.emit();return false}
  const generation=++this.generation;this.error='';this.mode='opening';this.releaseTracks();this.emit();
  try{
   if(!this.env.secure)throw new Error('Camera requires HTTPS or localhost. Use prerecorded video on this connection.');
   if(!this.env.devices?.getUserMedia)throw new Error('Camera access is unavailable in this browser. Use prerecorded video.');
   const stream=await this.env.devices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:this.settings.width},height:{ideal:this.settings.height}},audio:microphone});
   if(this.disposed||generation!==this.generation){stream.getTracks().forEach(t=>t.stop());return false}
   this.clearRecording();this.stream=stream;this.facing=stream.getVideoTracks()[0]?.getSettings?.().facingMode||facing;this.microphone=microphone;this.mode='preview';this.elapsed=0;
   stream.getTracks().forEach(track=>track.onended=()=>{if(this.stream===stream){this.error='Camera disconnected. Open camera again.';if(this.recorder?.state==='recording')this.stop();else this.endLive();this.releaseTracks();this.emit()}});
   this.emit();return true;
  }catch(error){if(this.disposed||generation!==this.generation)return false;const messages={NotAllowedError:'Camera or microphone access denied. Allow access or use prerecorded video.',NotFoundError:'No camera or microphone found. Try camera only or prerecorded video.',NotReadableError:'Camera is busy. Close other camera apps and try again.',OverconstrainedError:'This camera setup is unavailable. Try the other camera.'};this.error=messages[error.name]||error.message||'Camera could not open.';this.mode='idle';this.emit();return false}
 }
 async switchCamera(){return this.open({facing:this.facing==='user'?'environment':'user'})}
 async toggleMicrophone(){
  const tracks=this.stream?.getAudioTracks()||[];
  if(!tracks.length){if(['recording','live','stopping'].includes(this.mode)){this.error='Stop the take to enable microphone.';this.emit();return}return this.open({microphone:true})}
  this.microphone=!this.microphone;tracks.forEach(t=>t.enabled=this.microphone);this.emit();
 }
 startTimer(){clearInterval(this.timer);this.startedAt=this.env.now();this.elapsed=0;this.timer=setInterval(()=>{this.elapsed=Math.floor((this.env.now()-this.startedAt)/1000);this.emit()},250)}
 stopTimer(){clearInterval(this.timer);this.timer=null}
 start(){
  if(this.mode!=='preview'||!this.stream){this.error='Open camera first.';this.emit();return false}
  const Recorder=this.env.Recorder;if(!Recorder){this.error='Recording is not supported in this browser. Camera preview is still available.';this.emit();return false}
  try{
   const mimeType=recordingType(Recorder,this.settings.preferredTypes);const options={videoBitsPerSecond:this.settings.videoBitsPerSecond,...(mimeType?{mimeType}:{})};
   this.clearRecording();const recorder=new Recorder(this.stream,options);this.recorder=recorder;const chunks=[],generation=this.generation;
   recorder.ondataavailable=event=>{if(event.data?.size)chunks.push(event.data)};
   recorder.onerror=()=>{this.error='Recording failed. Retake or try another browser.';this.stopTimer();this.releaseTracks();this.mode='idle';this.emit()};
   recorder.onstop=()=>{
    this.stopTimer();const type=recorder.mimeType||chunks[0]?.type||'application/octet-stream';const captured=new Blob(chunks,{type});if(this.disposed||generation!==this.generation){if(captured.size)this.env.onCapture?.(captured);return}
    this.releaseTracks();this.blob=captured;
    if(this.blob.size){this.url=this.env.urls.createObjectURL(this.blob);this.mode='review'}else{this.error='No recording was captured. Please retake.';this.mode='idle'}this.emit();
   };
   recorder.start(1000);this.mode='recording';this.error='';this.startTimer();this.emit();return true;
  }catch(error){this.error='Recording could not start. Try a different browser or prerecorded video.';this.mode='preview';this.emit();return false}
 }
 stop(){if(this.recorder?.state==='recording'){this.mode='stopping';this.stopTimer();this.recorder.stop();this.emit()}}
 load(blob){this.cancel();this.blob=blob;this.url=this.env.urls.createObjectURL(blob);this.mode='review';this.emit()}
 startLive(){if(this.mode!=='preview'||!this.stream){this.error='Open camera first.';this.emit();return false}this.mode='live';this.error='';this.startTimer();this.emit();return true}
 endLive(){this.stopTimer();this.releaseTracks();this.mode='ended';this.emit()}
 cancel(){++this.generation;this.stopTimer();if(this.recorder?.state==='recording'){if(!this.env.onCapture)this.recorder.onstop=null;this.recorder.stop()}this.recorder=null;this.releaseTracks();this.clearRecording();this.mode='idle';this.elapsed=0;this.error='';this.emit()}
 destroy(){this.disposed=true;this.cancel()}
}
