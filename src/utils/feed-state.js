import {videos,sceneFeeds} from '../config/feeds.js';
export function getSceneVideos(scene){return (scene.feedIds||sceneFeeds[scene.id]||[]).map(id=>videos[id]).filter(Boolean).map((v,index)=>({...v,...(index===0&&scene.localVideo?{username:scene.localVideo.creator,video:{...v.video,src:scene.localVideo.url,poster:''}}:{}),theme:scene.shot==='17 / 17E'?'normal':v.theme,notifications:scene.shot==='17 / 17E'?[]:v.notifications}));}
export function createVideoState(video){return {counts:{...video.counts},deltas:{},liked:false,following:false,saved:false,addedComments:[],triggered:new Set()}}
export function countText(state,key){const base=state.counts[key],delta=state.deltas[key]||0;return typeof base==='number'?String(base+delta):delta?'+'+delta:'—'}
export function addEngagement(state,steps){for(const[key,value]of Object.entries(steps))if(Number.isFinite(value))state.deltas[key]=(state.deltas[key]||0)+value;}
export function toggleLike(state){state.liked=!state.liked;addEngagement(state,{likes:state.liked?1:-1})}
