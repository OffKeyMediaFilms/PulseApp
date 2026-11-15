// Pausable scene clock: no shared state or cross-device messages.
export class SceneClock {
 constructor(){this.jobs=[];this.paused=false;this.last=performance.now();this.timer=setInterval(()=>this.tick(),40)}
 after(ms,fn){this.jobs.push({left:Math.max(0,ms),fn})}
 tick(){const now=performance.now(),dt=now-this.last;this.last=now;if(this.paused)return;const due=[];this.jobs=this.jobs.filter(j=>{j.left-=dt;if(j.left<=0){due.push(j);return false}return true});due.forEach(j=>j.fn())}
 clear(){this.jobs=[]}
 destroy(){clearInterval(this.timer);this.clear()}
}
export class Notifications {
 constructor(clock,root){this.clock=clock;this.root=root;this.token=0;this.queue=[];this.active=false;this.generation=0}
 schedule(items){const gen=this.generation;items.filter(n=>n.automatic).forEach(n=>this.clock.after(n.delayMs,()=>{if(gen===this.generation)this.show(n)}))}
 show(n){this.queue.push(n);this.next()}
 next(){if(this.active||!this.queue.length)return;this.active=true;const n=this.queue.shift(),token=++this.token;const b=document.createElement('button');b.className='notification';b.setAttribute('aria-label','Dismiss notification');const text=document.createElement('span');const brand=document.createElement('strong');brand.textContent='PULSE';text.append(brand,document.createTextNode(n.message));if(n.amount){const amount=document.createElement('div');amount.textContent=n.amount;text.append(amount)}const icon=document.createElement('span');icon.className='avatar';icon.textContent='ϟ';b.append(icon,text);this.root.append(b);requestAnimationFrame(()=>b.classList.add('show'));const dismiss=()=>{if(token!==this.token)return;++this.token;b.classList.remove('show');this.clock.after(420,()=>{b.remove();this.active=false;this.next()})};b.onclick=dismiss;this.clock.after(n.durationMs,dismiss);if(n.sound)this.sound()}
 sound(){try{const C=window.AudioContext||window.webkitAudioContext;const ctx=new C(),o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);g.gain.value=.035;o.frequency.value=740;o.start();o.stop(ctx.currentTime+.12);o.onended=()=>ctx.close()}catch{}}
 reset(){++this.generation;++this.token;this.queue=[];this.active=false;this.root.replaceChildren()}
}
