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

/* mobile nav: copper panel, dimmed backdrop, X button, Esc, scroll lock */
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
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -5% 0px'});
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

/* open now (America/Chicago): Mon-Fri 9 AM - 5 PM, as listed on Google */
var st=$('#status');
if(st){
  try{
    var H={0:null,1:[540,1020],2:[540,1020],3:[540,1020],4:[540,1020],5:[540,1020],6:null};
    var parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),g={};
    parts.forEach(function(p){g[p.type]=p.value});
    var dn={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[g.weekday],mins=(parseInt(g.hour,10)%24)*60+parseInt(g.minute,10),h=H[dn],t=$('.t',st);
    if(h&&mins>=h[0]&&mins<h[1]){st.classList.add('open');t.textContent='Open now · until 5 PM today'}
    else{var nx=dn,add=0;if(h&&mins<h[0]){t.textContent='Closed now · opens 9 AM today'}else{do{nx=(nx+1)%7;add++}while(!H[nx]);t.textContent='Closed now · opens 9 AM '+(add===1?'tomorrow':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][nx])}}
    $$('.hours tr[data-d]').forEach(function(r){r.classList.toggle('today',+r.dataset.d===dn)});
  }catch(e){}
}

/* magnetic buttons (fine pointers only) */
if(fine&&!RM){
  $$('.btn.p').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--bx',((e.clientX-r.left-r.width/2)*.12).toFixed(1)+'px');b.style.setProperty('--by',((e.clientY-r.top-r.height/2)*.18).toFixed(1)+'px')});
    b.addEventListener('mouseleave',function(){b.style.setProperty('--bx','0px');b.style.setProperty('--by','0px')});
  });
}

/* reviews: read full review */
$$('.rev').forEach(function(r){var b=$('.more',r);if(!b)return;
  b.addEventListener('click',function(){var o=r.classList.toggle('open');b.textContent=o?'Show less':'Read full review';b.setAttribute('aria-expanded',o?'true':'false')})});

/* photo lightbox */
var items=$$('.photos .it'),lb=$('.lb');
if(lb&&items.length){
  var li=$('img',lb),ct=$('.ct',lb),cur=0,list=items;
  function show(n){cur=(n+list.length)%list.length;var it=list[cur];li.src=it.dataset.full;li.alt=$('img',it).alt;ct.textContent=(cur+1)+' / '+list.length+' — '+(it.dataset.cap||'')}
  function open(i){lb.classList.add('on');D.body.style.overflow='hidden';show(list.indexOf(i));$('.x',lb).focus()}
  function shut(){lb.classList.remove('on');D.body.style.overflow=''}
  items.forEach(function(i){i.addEventListener('click',function(){open(i)})});
  $('.x',lb).addEventListener('click',shut);$('.nx',lb).addEventListener('click',function(){show(cur+1)});$('.pv',lb).addEventListener('click',function(){show(cur-1)});
  lb.addEventListener('click',function(e){if(e.target===lb)shut()});
  D.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')shut();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
  var tx=0;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)show(cur+(d<0?1:-1))},{passive:true});
}

/* estimate request: validate, then pre-filled SMS (or Formspree if an endpoint is pasted in later) */
var f=$('#quote-form');
if(f){
  var P=f.dataset.phone,FS=f.dataset.formspree,out=$('.fmsg',f);
  function msg(){
    var g=function(n){return(f.elements[n]&&f.elements[n].value||'').trim()};
    var s='Hi Garcia Brothers Roofers, I\'d like to ask about a roofing estimate.\nName: '+g('name')+'\nPhone: '+g('phone')+'\nWhat I need: '+g('service')+'\nCity/area: '+g('area')+'\nBest day/time to call: '+g('when');
    if(g('notes'))s+='\nDetails: '+g('notes');return s;
  }
  function bad(el,m){el.setAttribute('aria-invalid','true');var e=el.parentNode.querySelector('.err');if(!e){e=D.createElement('span');e.className='err';e.setAttribute('role','alert');el.parentNode.appendChild(e)}e.textContent=m}
  function ok(el){el.removeAttribute('aria-invalid');var e=el.parentNode.querySelector('.err');if(e)e.parentNode.removeChild(e)}
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
        if(!r.ok)throw 0;out.innerHTML='<strong>Request sent.</strong> This is a request, not a confirmed appointment or a quote. Garcia Brothers Roofers will reply to confirm.';out.classList.add('on');f.reset();
      }).catch(function(){out.innerHTML='<strong>We couldn\'t send that online.</strong> Please call <a href="tel:'+P+'">(432) 220-2400</a>.';out.classList.add('on')}).finally(function(){btn.disabled=false});
      return;
    }
    var mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    out.innerHTML='<strong>Almost done — send your request by text.</strong><br><span class="fine">This is not a confirmed appointment or a price quote. The company will reply to confirm. If your text doesn\'t go through, please call instead.</span><textarea readonly aria-label="Your request message">'+text.replace(/</g,'&lt;')+'</textarea><div class="cta"><a class="btn p sm" href="sms:'+P+'?&body='+encodeURIComponent(text)+'">Open in Messages</a><button type="button" class="btn g sm" id="cp">Copy message</button><a class="btn g sm" href="tel:'+P+'">Call instead</a></div>';
    out.classList.add('on');
    $('#cp').addEventListener('click',function(){var t=this;(navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(function(){t.textContent='Copied ✓'}).catch(function(){var ta=$('textarea',out);ta.select();try{D.execCommand('copy');t.textContent='Copied ✓'}catch(x){t.textContent='Press Ctrl/Cmd+C'}})});
    if(mobile)location.href='sms:'+P+'?&body='+encodeURIComponent(text);
    out.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  });
}
})();
