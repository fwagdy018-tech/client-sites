(function(){
'use strict';
var D=document,W=window,$=function(s,c){return(c||D).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))};
var RM=W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=W.matchMedia('(hover:hover) and (pointer:fine)').matches;
var raf=W.requestAnimationFrame.bind(W);

/* header / progress / mobile bar */
var hdr=$('.hdr'),prog=$('#prog'),mbar=$('.mbar'),hero=$('.hero,.page-hero'),tick=false;
function onScroll(){
  var y=W.scrollY,h=D.documentElement.scrollHeight-W.innerHeight;
  if(hdr)hdr.classList.toggle('sc',y>40);
  if(prog)prog.style.transform='scaleX('+(h>0?y/h:0)+')';
  if(mbar){var lim=hero?hero.offsetHeight*.7:300;mbar.classList.toggle('on',y>lim)}
  tick=false;
}
W.addEventListener('scroll',function(){if(!tick){tick=true;raf(onScroll)}},{passive:true});
W.addEventListener('resize',onScroll);onScroll();

/* mobile nav: accent panel, dimmed backdrop, X button, Esc, scroll lock */
var bg=$('.burger'),nav=$('#nav');
if(bg&&nav){
  var scrim=D.createElement('div');scrim.className='scrim';D.body.appendChild(scrim);
  var xb=D.createElement('button');xb.type='button';xb.className='nclose';xb.setAttribute('aria-label','Close menu');xb.innerHTML='&times;';nav.appendChild(xb);
  var close=function(){nav.classList.remove('on');scrim.classList.remove('on');bg.setAttribute('aria-expanded','false');D.body.style.overflow=''};
  bg.addEventListener('click',function(){var o=!nav.classList.contains('on');if(o){nav.classList.add('on');scrim.classList.add('on');bg.setAttribute('aria-expanded','true');D.body.style.overflow='hidden'}else close()});
  scrim.addEventListener('click',close);xb.addEventListener('click',close);
  $$('a',nav).forEach(function(a){a.addEventListener('click',close)});
  D.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
}

/* reveals */
var rvs=$$('.rv');
if('IntersectionObserver' in W&&!RM){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -4% 0px'});
  rvs.forEach(function(el){io.observe(el)});
}else rvs.forEach(function(el){el.classList.add('in')});

/* counters */
function count(el){
  var to=parseFloat(el.dataset.to),dec=(el.dataset.to.split('.')[1]||'').length,suf=el.dataset.suf||'';
  if(RM){el.textContent=to.toFixed(dec)+suf;return}
  var t0=null,dur=1400;
  (function f(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,4);el.textContent=(to*e).toFixed(dec)+suf;if(p<1)raf(f)})(performance.now());
}
var cs=$$('[data-to]');
if('IntersectionObserver' in W){var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){count(e.target);co.unobserve(e.target)}})},{threshold:.5});cs.forEach(function(c){co.observe(c)})}

/* open now (America/Chicago) - hours as listed on Google: Mon-Fri 9-6, Sat 9-2, Sun closed */
var st=$('#status');
if(st){
  try{
    var H={0:null,1:[540,1080],2:[540,1080],3:[540,1080],4:[540,1080],5:[540,1080],6:[540,840]};
    var fm=function(m){var h=Math.floor(m/60),x=h>=12?'PM':'AM';h=h%12||12;return h+(m%60?':'+('0'+m%60).slice(-2):'')+' '+x};
    var parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),g={};
    parts.forEach(function(p){g[p.type]=p.value});
    var dn={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[g.weekday],mins=(parseInt(g.hour,10)%24)*60+parseInt(g.minute,10),h=H[dn],t=$('.t',st);
    var nextOpen=function(){for(var i=1;i<=7;i++){var d=(dn+i)%7;if(H[d])return[i,H[d][0],d]}};
    var names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    if(h&&mins>=h[0]&&mins<h[1]){st.classList.add('open');t.textContent='Open now · until '+fm(h[1])+' today'}
    else if(h&&mins<h[0]){t.textContent='Closed now · opens '+fm(h[0])+' today'}
    else{var n=nextOpen();t.textContent='Closed now · opens '+fm(n[1])+(n[0]===1?' tomorrow':' '+names[n[2]])}
    $$('.hours tr[data-d]').forEach(function(r){r.classList.toggle('today',+r.dataset.d===dn)});
  }catch(e){}
}

/* gallery filter + lightbox */
var items=$$('.mas .it,.prev .it'),lb=$('.lb'),fbs=$$('.fb');
fbs.forEach(function(f){f.addEventListener('click',function(){
  fbs.forEach(function(x){x.setAttribute('aria-pressed','false')});f.setAttribute('aria-pressed','true');
  var k=f.dataset.f;$$('.mas .it').forEach(function(it){it.hidden=!(k==='all'||it.dataset.c===k)});
})});
if(lb&&items.length){
  var li=$('img',lb),ct=$('.ct',lb),cur=0,list=[];
  function vis2(){return $$('.mas .it,.prev .it').filter(function(i){return!i.hidden})}
  function show(n){list=vis2();cur=(n+list.length)%list.length;var it=list[cur];li.src=it.dataset.full;li.alt=$('img',it).alt;ct.textContent=(cur+1)+' / '+list.length+' — '+(it.dataset.cap||'')}
  function open(i){list=vis2();lb.classList.add('on');D.body.style.overflow='hidden';show(list.indexOf(i));$('.x',lb).focus()}
  function shut(){lb.classList.remove('on');D.body.style.overflow=''}
  items.forEach(function(i){i.addEventListener('click',function(){open(i)})});
  $('.x',lb).addEventListener('click',shut);$('.nx',lb).addEventListener('click',function(){show(cur+1)});$('.pv',lb).addEventListener('click',function(){show(cur-1)});
  lb.addEventListener('click',function(e){if(e.target===lb)shut()});
  D.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')shut();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
  var tx=0;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)show(cur+(d<0?1:-1))},{passive:true});
}

/* request form: validate, then pre-filled SMS (or Formspree if an endpoint is pasted in later) */
var f=$('#quote');
if(f){
  var P=f.dataset.phone,FS=f.dataset.formspree,out=$('.fmsg',f);
  function msg(){
    var g=function(n){return(f.elements[n]&&f.elements[n].value||'').trim()};
    var s='Hi Abdul Auto Repair & Tires, I\'d like to ask about a repair.\nName: '+g('name')+'\nPhone: '+g('phone')+'\nNeed: '+g('service');
    if(g('when'))s+='\nVehicle: '+g('when');
    if(g('notes'))s+='\nWhat it is doing: '+g('notes');return s;
  }
  function bad(el,m){el.setAttribute('aria-invalid','true');var e=el.parentNode.querySelector('.err');if(!e){e=D.createElement('span');e.className='err';e.setAttribute('role','alert');el.parentNode.appendChild(e)}e.textContent=m}
  function ok(el){el.removeAttribute('aria-invalid');var e=el.parentNode.querySelector('.err');if(e)e.remove()}
  $$('input,select,textarea',f).forEach(function(el){el.addEventListener('input',function(){ok(el)})});
  f.addEventListener('submit',function(e){
    e.preventDefault();var v=true,first=null,n=f.elements.name,p=f.elements.phone,s=f.elements.service;
    [n,p,s].forEach(ok);
    if(f.elements.company.value)return;
    if(n.value.trim().length<2){bad(n,'Please enter your name.');v=false;first=first||n}
    if(p.value.replace(/\D/g,'').length<10){bad(p,'Enter a valid phone number (10 digits).');v=false;first=first||p}
    if(!s.value){bad(s,'Please choose what you need.');v=false;first=first||s}
    if(!v){first.focus();return}
    var text=msg();
    if(FS){
      var btn=$('button[type=submit]',f);btn.disabled=true;
      fetch(FS,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(f)}).then(function(r){
        if(!r.ok)throw 0;out.innerHTML='<strong>Request sent.</strong> This is a request, not a confirmed appointment. The shop will reply to confirm.';out.classList.add('on');f.reset();
      }).catch(function(){out.innerHTML='<strong>We couldn\'t send that online.</strong> Please call <a href="tel:'+P+'">'+P+'</a>.';out.classList.add('on')}).finally(function(){btn.disabled=false});
      return;
    }
    var mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    out.innerHTML='<strong>Almost done — send your request by text.</strong><br><span class="fine">This is not a confirmed appointment. The shop will answer to confirm. If your text doesn\'t go through, please call instead.</span><textarea readonly aria-label="Your request message">'+text.replace(/</g,'&lt;')+'</textarea><div class="cta"><a class="btn p sm" href="sms:'+P+'?&body='+encodeURIComponent(text)+'">Open in Messages</a><button type="button" class="btn g sm" id="cp">Copy message</button><a class="btn g sm" href="tel:'+P+'">Call instead</a></div>';
    out.classList.add('on');
    $('#cp').addEventListener('click',function(){var t=this;(navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(function(){t.textContent='Copied ✓'}).catch(function(){var ta=$('textarea',out);ta.select();try{D.execCommand('copy');t.textContent='Copied ✓'}catch(x){t.textContent='Press Ctrl/Cmd+C'}})});
    if(mobile)location.href='sms:'+P+'?&body='+encodeURIComponent(text);
    out.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  });
}
})();
