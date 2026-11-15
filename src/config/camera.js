// Camera opens only after a tap. Recordings stay in device IndexedDB and can be exported; nothing is uploaded.
export const cameraSettings = {
 facingMode:'environment', microphone:true,
 preferredTypes:['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm','video/mp4'],
 width:1280, height:720, videoBitsPerSecond:2500000, filename:'pulse-take',
 live:{viewerCount:null,viewerSteps:[0,1,0,2],commentIntervalMs:2800,comments:['Edit comments here'],heartIntervalMs:1200,heartAnimationMs:1800},
 // Per original story scene. Override media, camera defaults, and live simulation here.
 scenes:{1:{media:'recording',prompt:'Prompt appears here'},2:{media:'recording',prompt:'Prompt appears here'},5:{media:'recording',prompt:'Prompt appears here'},9:{media:'recording',prompt:'Ask what happened'},14:{media:'recording',prompt:'Keep Filming'},16:{media:'recording',prompt:'Stay Live'}}
};
