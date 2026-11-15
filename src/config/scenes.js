// All scene-specific text, payouts, timing and shot mappings are edited here.
// Notification delays are measured from opening/reset; durations are independent.
const notice=(message,extra={})=>({message,delayMs:3000,durationMs:4000,automatic:true,sound:false,...extra});
const sub=(id,shot,label,view,extra={})=>({id,shot,label,view,...extra});
export const scenes=[
{id:1,shot:'1 / 1C',label:'Home feed',view:'feed',theme:'normal',notifications:[notice('Notification appears here',{automatic:false})],subviews:[sub('capture','1 / recording','Record or upload','record',{cameraScene:1}),sub('post','1 / 1G','Post & refresh','post')]},
{id:2,shot:'2 / 2D',label:'Video engagement',view:'feed',theme:'darkening',subviews:[sub('capture','2 / recording','Record or upload','record',{cameraScene:2}),sub('playback','2 / 2A, 2B','Playback & comments','feed')]},
{id:3,shot:'3 / 3C',label:'Creator signup',view:'signup',theme:'darkening',subviews:[sub('viral','3 / 3A, optional 3D','Viral engagement','viral')]},
{id:4,shot:'4 / 4A',label:'Film the argument',view:'prompt',theme:'darkening',prompt:'FILM THE ARGUMENT OUTSIDE',promptDelayMs:0,subviews:[sub('argument','5 / recording','Scene 5 · Record argument','record',{cameraScene:5})]},
{id:5,shot:'6 / 6C',label:'Creator payout',view:'earnings',theme:'darkening',subviews:[sub('caption','6 / 6A','Caption & comments','feed')]},
{id:6,shot:'7 / 7A',label:'Reaction video · laptop',view:'media',theme:'darkening',media:'reaction',desktop:true},
{id:7,shot:'7 / 7J',label:'Payout sent',view:'feed',theme:'darkening',notifications:[notice('Payout Sent')]},
{id:8,shot:'8 / 8A',label:'Phone feed',view:'feed',theme:'darkening'},
{id:9,shot:'9 / 9D',label:'Recording',view:'record',theme:'darkening',prompt:'Ask what happened',subviews:[sub('footage','9 / 9F','Recording footage','record')]},
{id:10,shot:'10 / 10C',label:'Post a video',view:'post',theme:'darkening',subviews:[sub('preview','10 / 10B','Preview & delete','preview')]},
{id:11,shot:'10 / 10D',label:'Creator earnings',view:'earnings',theme:'darkening',title:'Creator earnings',reach:'Reach amount here'},
{id:12,shot:'12 / 12B',label:'Protect your platform',view:'feed',theme:'darkening',notifications:[notice('Protect your platform')],subviews:[sub('lena','13 / 13A, 13B','Lena & reactions','reactions',{comments:['her brother looking for you fr']})]},
{id:13,shot:'14 / 14E',label:'Post before they delete it',view:'prompt',theme:'dark',prompt:'Post before they delete it',notifications:[notice('Post before they delete it')],subviews:[sub('upload','14 / 14F','Laptop upload','post',{desktop:true,media:'clip'})]},
{id:14,shot:'14 / 14J',label:"They're Lying",view:'prompt',theme:'dark',prompt:"They're Lying",notifications:[notice("They're Lying")]},
{id:15,shot:'14 / 14G',label:'Keep Filming',view:'record',theme:'dark',prompt:'Keep Filming',notifications:[notice('Keep Filming')]},
{id:16,shot:'14 / 14M',label:'Payout notification',view:'feed',theme:'dark',notifications:[notice('Payout Sent',{amount:'Payout amount here'})]},
{id:17,shot:'14 / 14O',label:'Another payout',view:'feed',theme:'dark',notifications:[notice('Payout Sent',{amount:'Payout amount here'})]},
{id:18,shot:'15 / 15D',label:'Context is Control',view:'prompt',theme:'dark',prompt:'Context is Control',promptDelayMs:3000,notifications:[notice('Context is Control')]},
{id:19,shot:'16 / 16B',label:'Feed & live stream',view:'feed',theme:'dark',allowLive:true,subviews:[sub('live','16 / 16F, 16K','Go live & comments','live'),sub('recorded','16 / 16M','Recorded video','media',{media:'recording'}),sub('clean','17 / 17E','Clean Pulse feed','feed',{theme:'normal',notifications:[],prompt:'',allowLive:false})]},
{id:20,shot:'18 / 18E',label:'Skye notification',view:'feed',theme:'normal',username:'Skye',notifications:[notice('Notification appears here')],subviews:[sub('clips','18 / 18C','Laptop clips','clips',{desktop:true})]},
{id:21,shot:'18 / 18F',label:'Skye payout & prompt',view:'payout',theme:'normal',username:'Skye',prompt:'Prompt appears here'}
].map(s=>({title:s.label,amount:'Payout amount here',reach:'Reach amount here',media:'kerry',notifications:[],subviews:[],...s}));
export function resolveScene(id,subview){const s=scenes.find(s=>s.id===Number(id));if(!s)return null;const v=s.subviews.find(v=>v.id===subview);return v?{...s,...v,id:s.id}:s;}
