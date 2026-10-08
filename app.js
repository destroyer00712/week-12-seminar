(() => {
'use strict';
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const g = window.gsap, ST = window.ScrollTrigger;
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let enabled = !motionQuery.matches;
let context, releaseTimeline, releaseType = 'rolling';
try { const saved = sessionStorage.getItem('cloud-motion'); if(saved === 'off') enabled = false; } catch {}
const motionButton = $('#motion');
const oldColor='#d6e6fb', newColor='#1565c0';
const replicas=$$('.replica');
const releaseStatus=$('#release-status');
const releaseLabels={rolling:'ROLLING UPDATE',recreate:'RECREATE',bluegreen:'BLUE / GREEN',canary:'CANARY RELEASE'};
const initialCopy={rolling:'Pods transition to v2 one at a time.',recreate:'Stop the old version before starting the new one.',bluegreen:'Prepare green, then switch traffic from blue.',canary:'Start with a small, controlled share of traffic.'};
function setReplica(i,version){replicas[i].style.backgroundColor=version===2?newColor:oldColor;replicas[i].style.color=version===2?'#ffffff':'#0c2340';$('strong',replicas[i]).textContent='v'+version;}
function finalRelease(type){
 replicas.forEach((r,i)=>{r.style.opacity='1';r.style.transform='none';setReplica(i,type==='canary'?(i===3?2:1):type==='bluegreen'?(i>=2?2:1):2)});
 const share=type==='canary'?10:100;
 $('.old-share').style.width=(100-share)+'%';$('.new-share').style.width=share+'%';
 $('.old-share span').textContent=type==='canary'?'STABLE 90%':'STABLE';$('.new-share span').textContent=type==='canary'?'10%':'NEW 100%';
 releaseStatus.textContent=({rolling:'All Pods run v2 after a gradual rollout.',recreate:'v2 is running after an interruption between versions.',bluegreen:'Green receives all traffic. Blue remains available for rollback.',canary:'Illustrative split: 90% stable, 10% canary. Compare health before promoting.'})[type];
}
function runRelease(type,animate=true){
 releaseType=type;releaseTimeline?.kill();$('#release-name').textContent=releaseLabels[type];
 $$('.release-option').forEach(b=>{const active=b.dataset.release===type;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));$('.option-mark',b).textContent=active?'−':'+'});
 if(!g||!enabled||!animate){finalRelease(type);return}
 g.killTweensOf([...replicas,$('.old-share'),$('.new-share')]);
 g.set(replicas,{opacity:1,y:0,scale:1});replicas.forEach((_,i)=>setReplica(i,1));
 g.set('.old-share',{width:'100%'});g.set('.new-share',{width:'0%'});$('.old-share span').textContent='STABLE';$('.new-share span').textContent='NEW';releaseStatus.textContent=initialCopy[type];
 releaseTimeline=g.timeline({onComplete:()=>finalRelease(type)});
 const share=(pct,duration=.55)=>releaseTimeline.to('.old-share',{width:(100-pct)+'%',duration,ease:'power2.inOut'}).to('.new-share',{width:pct+'%',duration,ease:'power2.inOut'},'<');
 if(type==='rolling'){
 replicas.forEach((r,i)=>{releaseTimeline.to(r,{y:-20,opacity:0,duration:.28}).call(()=>setReplica(i,2)).set(r,{y:20}).to(r,{y:0,opacity:1,duration:.38,ease:'power2.out'});share((i+1)*25,.3)});
 }else if(type==='recreate'){
 releaseTimeline.to(replicas,{y:-20,opacity:0,duration:.4,stagger:.06}).call(()=>releaseStatus.textContent='No running Pods: this is the interruption.').to({}, {duration:.7}).call(()=>replicas.forEach((_,i)=>setReplica(i,2))).set(replicas,{y:20}).to(replicas,{y:0,opacity:1,duration:.5,stagger:.07});share(100);
 }else if(type==='bluegreen'){
 releaseTimeline.call(()=>{setReplica(2,2);setReplica(3,2);releaseStatus.textContent='Green is ready. Traffic still goes to blue.'}).fromTo(replicas.slice(2),{y:20,opacity:0},{y:0,opacity:1,duration:.7,stagger:.1}).to({}, {duration:.7});share(100,.8);
 }else{
 releaseTimeline.to(replicas[3],{scale:.8,opacity:0,duration:.3}).call(()=>setReplica(3,2)).to(replicas[3],{scale:1,opacity:1,duration:.5,ease:'back.out(1.3)'});share(10,.7);
 }
}
$$('.release-option').forEach(b=>b.addEventListener('click',()=>runRelease(b.dataset.release)));
$('#replay-release').addEventListener('click',()=>runRelease(releaseType));
$('#copy-code').addEventListener('click',async()=>{const button=$('#copy-code');const code=$('#lab-code').textContent;try{await navigator.clipboard.writeText(code);button.textContent='Copied';$('#status').textContent='Deployment commands copied.';setTimeout(()=>button.textContent='Copy commands',2000)}catch{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents($('#lab-code'));selection.removeAllRanges();selection.addRange(range);button.textContent='Select & copy';$('#status').textContent='Commands selected. Use your device copy command.'}});
function staticState(){
 $('#cluster-caption').textContent='COMPLETE CLUSTER';
 $('.primary-site .site-state').textContent='UNAVAILABLE';$('.backup-site .site-state').textContent='READY TO SERVE';
}
function setup(){
 const position=window.scrollY;
 context?.revert();releaseTimeline?.kill();
 document.body.classList.toggle('motion-off',!enabled);
 motionButton.setAttribute('aria-pressed',String(enabled));motionButton.innerHTML=`Motion ${enabled?'on':'off'} <span aria-hidden="true">${enabled?'◉':'○'}</span>`;
 if(!g||!ST||!enabled){staticState();finalRelease(releaseType);return}
 g.registerPlugin(ST);
 context=g.context(()=>{
 const desktop=matchMedia('(min-width: 761px) and (min-height: 651px)').matches;
 const phone=matchMedia('(max-width: 650px)').matches;
 g.to('.page-progress div',{scaleY:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:0,end:'max',scrub:.2}});
 // Hero motion is driven by native scroll, with a calm static first frame.
 const hero=g.timeline({scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
 hero.to('.hero-copy',{y:phone?35:115,opacity:.15,ease:'none'},0)
 .to('.hero-system',{y:phone?55:145,rotation:phone?7:19,scale:phone?1.05:1.16,ease:'none'},0)
 .to('.hero-grid',{y:180,ease:'none'},0)
 .to('.hero-orbits',{rotation:45,svgOrigin:'380 380',ease:'none'},0)
 .to('.hero-connections',{opacity:.08,ease:'none'},0);
 $$('.satellite').forEach((el,i)=>{g.to(el,{x:(i%2?1:-1)*(phone?12:40),y:parseFloat(el.dataset.depth)*220,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.3}})});
 g.fromTo('.hero-packet',{opacity:.2},{opacity:1,scale:1.7,transformOrigin:'center',stagger:.12,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom 20%',scrub:true}});
 // Each text block arrives as a unit, preserving an ordinary reading sequence.
 $$('.reveal').forEach((el,i)=>g.from(el,{y:phone?24:50,opacity:.15,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 91%',toggleActions:'play none none reverse'}}));
 if(!phone)g.from('.workflow-line',{scaleX:0,ease:'none',scrollTrigger:{trigger:'.workflow',start:'top 83%',end:'bottom 60%',scrub:.7}});
 $$('.flow-node').forEach((el,i)=>g.from(el,{x:phone?25:70,y:phone?0:20,opacity:.2,scrollTrigger:{trigger:el,start:'top 91%',end:'top 60%',scrub:.6}}));
 // The cluster remains alongside the explanation on large screens.
 if(desktop){
 const ct=g.timeline({scrollTrigger:{trigger:'.cluster-story',start:'top 18%',end:'bottom 85%',scrub:1,onUpdate:self=>{const labels=['DESIRED STATE','CONTROL PLANE','WORKER NODES','RECONCILIATION'];$('#cluster-caption').textContent=labels[Math.min(3,Math.floor(self.progress*4))]}}});
 ct.to('.worker-group',{opacity:.3,duration:.65},0).to('.pod-group',{opacity:.25,duration:.65},0)
 .to('.control-group',{scale:1.025,svgOrigin:'325 155',duration:.8},.4)
 .to('.control-group',{scale:1,opacity:.45,duration:.7},1.15)
 .to('.worker-group',{opacity:1,duration:.7},1.15)
 .to('.pod-group',{opacity:1,duration:.7},1.65)
 .fromTo('.replacement',{opacity:.12,y:25},{opacity:1,y:0,duration:.6},2.4)
 .to('.control-group',{opacity:1,duration:.6},2.8)
 .to('.feedback-wire',{strokeDashoffset:-90,duration:3.5,ease:'none'},0);
 }else{g.from('.cluster-stage',{y:35,opacity:.5,duration:.8,scrollTrigger:{trigger:'.cluster-stage',start:'top 85%'}});$('#cluster-caption').textContent='COMPLETE CLUSTER'}
 $$('.route-step').forEach((el,i)=>g.from(el,{y:phone?25:50,opacity:.15,scrollTrigger:{trigger:'.request-path',start:'top 85%',end:'bottom 50%',scrub:1},delay:i*.12}));
 if(!phone)g.to('.request-rail i',{left:'100%',ease:'none',scrollTrigger:{trigger:'.traffic',start:'top 35%',end:'bottom 70%',scrub:.5}});
 g.from('.terminal',{rotation:phone?0:3,x:phone?0:60,scrollTrigger:{trigger:'.lab-layout',start:'top 85%',end:'center 60%',scrub:.8}});
 ST.create({trigger:'.release-demo',start:'top 75%',once:true,onEnter:()=>runRelease(releaseType)});
 // Fly-in typography resolves before the recovery targets are read.
 const outage=g.timeline({scrollTrigger:{trigger:'.outage-title',start:'top 90%',end:'bottom 40%',scrub:.7}});
 outage.from('.outage-word:first-child',{x:phone?-30:-130,opacity:.2},0).from('.outage-word:nth-child(2)',{x:phone?30:170,opacity:.2},0).from('.recovery-line',{y:35,opacity:0},.45);
 g.from('.rpo',{scaleX:.3,transformOrigin:'right top',opacity:.2,ease:'none',scrollTrigger:{trigger:'.recovery-timeline',start:'top 85%',end:'top 50%',scrub:.5}});
 g.from('.rto',{scaleX:.3,transformOrigin:'left top',opacity:.2,ease:'none',scrollTrigger:{trigger:'.recovery-timeline',start:'top 85%',end:'top 50%',scrub:.5}});
 $$('.type-rung').forEach((el,i)=>{g.from(el,{x:phone?25:90,opacity:.2,scrollTrigger:{trigger:el,start:'top 92%',end:'top 62%',scrub:.7}});g.from($('.readiness i',el),{scaleX:0,ease:'none',scrollTrigger:{trigger:el,start:'top 85%',end:'bottom 60%',scrub:1}})});
 $$('.plan-item').forEach((el,i)=>g.from(el,{y:45,opacity:.2,duration:.8,delay:phone?0:i*.1,scrollTrigger:{trigger:el,start:'top 88%'}}));
 const failover=g.timeline({scrollTrigger:{trigger:'.failover-figure',start:'top 75%',end:'bottom 35%',scrub:.5,onUpdate:self=>{const failed=self.progress>.35;$('.primary-site .site-state').textContent=failed?'UNAVAILABLE':'HEALTHY';$('.backup-site .site-state').textContent=self.progress>.6?'SERVING TRAFFIC':'READY'}}});
 failover.to('.primary-site',{opacity:.35,duration:.3},.2).to('.primary-path',{opacity:.15,duration:.3},.2)
 .to('.recovery-path',{stroke:'#1565c0',strokeWidth:4,duration:.3},.5)
 .to('.backup-site rect',{fill:'#b7d4f8',duration:.4},.5)
 .to('.failover-packet',{attr:{cx:455},duration:.35,ease:'none'},.4)
 .to('.failover-packet',{attr:{cy:240},duration:.35,ease:'none'},.75);
 $$('.signal').forEach((path,i)=>{const length=path.getTotalLength();g.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.signal-visual',start:'top 95%',end:'bottom 35%',scrub:1+i*.3}})});
 $$('.closing-words span').forEach((el,i)=>g.from(el,{x:(i%2?1:-1)*(phone?25:95),opacity:.15,scrollTrigger:{trigger:el,start:'top 95%',end:'top 60%',scrub:.8}}));
 });
 ST.refresh();if(Math.abs(window.scrollY-position)>20)window.scrollTo({top:position,behavior:'instant'});
}
motionButton.addEventListener('click',()=>{enabled=!enabled;try{sessionStorage.setItem('cloud-motion',enabled?'on':'off')}catch{}setup()});
motionQuery.addEventListener('change',()=>{enabled=!motionQuery.matches;setup()});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(setup,200)});
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseTimeline?.pause();else releaseTimeline?.resume()});
setup();
if(document.fonts)document.fonts.ready.then(()=>ST?.refresh());
})();
