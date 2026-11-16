(function(){
'use strict';
var D=document,W=window,$=function(s,c){return(c||D).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))};
var RM=W.matchMedia('(prefers-reduced-motion: reduce)').matches;
var fine=W.matchMedia('(hover:hover) and (pointer:fine)').matches;
var raf=W.requestAnimationFrame.bind(W);

/* header / progress / mobile bar / parallax (single rAF scroll loop) */
var hdr=$('.hdr'),prog=$('#prog'),mbar=$('.mbar'),hero=$('.hero,.page-hero'),bgs=$$('.bgl[data-par]'),tick=false;
function onScroll(){
  var y=W.scrollY,h=D.documentElement.scrollHeight-W.innerHeight;
  if(hdr)hdr.classList.toggle('sc',y>40);
  if(prog)prog.style.transform='scaleX('+(h>0?y/h:0)+')';
  if(mbar){var lim=hero?hero.offsetHeight*.7:300;mbar.classList.toggle('on',y>lim)}
  if(!RM){var vh=W.innerHeight;for(var i=0;i<bgs.length;i++){var b=bgs[i],r=b.parentNode.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)continue;var im=b.firstElementChild;im.style.transform='translate3d(0,'+((r.top+r.height/2-vh/2)*-0.12).toFixed(1)+'px,0) scale(1.12)'}}
  tick=false;
}
W.addEventListener('scroll',function(){if(!tick){tick=true;raf(onScroll)}},{passive:true});
W.addEventListener('resize',onScroll);onScroll();

/* mobile nav */
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

/* hero intro */
if(hero&&hero.classList.contains('hero')){raf(function(){raf(function(){hero.classList.add('go')})})}

/* reveals */
var rvs=$$('.rv');
if('IntersectionObserver' in W&&!RM){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){(e.target._rv||e.target).classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  rvs.forEach(function(el){if(el.classList.contains('imgr')){el.parentNode._rv=el;io.observe(el.parentNode)}else io.observe(el)});
}else rvs.forEach(function(el){el.classList.add('in')});

/* counters */
function count(el){
  var to=parseFloat(el.dataset.to),dec=(el.dataset.to.split('.')[1]||'').length,suf=el.dataset.suf||'';
  if(RM){el.textContent=to.toFixed(dec)+suf;return}
  var t0=null,dur=1600;
  (function f(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,4);el.textContent=(to*e).toFixed(dec)+suf;if(p<1)raf(f)})(performance.now());
}
var cs=$$('[data-to]');
if('IntersectionObserver' in W){var co=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){count(e.target);co.unobserve(e.target)}})},{threshold:.5});cs.forEach(function(c){co.observe(c)})}

/* rotating keyword */
var rot=$('.rot');
if(rot&&!RM){
  var words=rot.dataset.words.split('|'),wi=0,b=rot.firstElementChild;
  setInterval(function(){
    b.style.transform='translateY(-40%)';b.style.opacity='0';
    setTimeout(function(){wi=(wi+1)%words.length;b.textContent=words[wi];b.style.transition='none';b.style.transform='translateY(40%)';
      void b.offsetWidth;b.style.transition='';b.style.transform='none';b.style.opacity='1'},420);
  },2600);
}

/* card spotlight + tilt + magnetic buttons (fine pointers only) */
if(fine&&!RM){
  $$('.card').forEach(function(c){
    c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
      c.style.setProperty('--mx',x+'px');c.style.setProperty('--my',y+'px');
      c.style.setProperty('--ry',((x/r.width-.5)*7).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-y/r.height)*7).toFixed(2)+'deg')});
    c.addEventListener('mouseleave',function(){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg')});
  });
  $$('.btn.p').forEach(function(b){
    b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.setProperty('--bx',((e.clientX-r.left-r.width/2)*.22).toFixed(1)+'px');b.style.setProperty('--by',((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px')});
    b.addEventListener('mouseleave',function(){b.style.setProperty('--bx','0px');b.style.setProperty('--by','0px')});
  });
}

/* reviews: auto-scroll, pause on hover/touch, drag */
var tr=$('.rv-track');
if(tr){
  var paused=false,down=false,sx=0,sl=0,pos=tr.scrollLeft,moved=0;
  tr.addEventListener('mouseenter',function(){paused=true});tr.addEventListener('mouseleave',function(){paused=false;down=false;tr.classList.remove('drag')});
  tr.addEventListener('focusin',function(){paused=true});tr.addEventListener('focusout',function(){paused=false});
  tr.addEventListener('touchstart',function(){paused=true},{passive:true});
  tr.addEventListener('touchend',function(){setTimeout(function(){pos=tr.scrollLeft;paused=false},2500)},{passive:true});
  tr.addEventListener('mousedown',function(e){down=true;sx=e.pageX;sl=tr.scrollLeft;tr.classList.add('drag')});
  W.addEventListener('mouseup',function(){down=false;tr.classList.remove('drag');pos=tr.scrollLeft});
  tr.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();tr.scrollLeft=sl-(e.pageX-sx)});
  if(!RM){
    var vis=true;if('IntersectionObserver' in W)new IntersectionObserver(function(es){vis=es[0].isIntersecting}).observe(tr);
    (function loop(){if(!paused&&!down&&vis){pos+=.55;if(pos>=tr.scrollWidth-tr.clientWidth-1)pos=0;tr.scrollLeft=pos}else if(!down&&paused)pos=tr.scrollLeft;raf(loop)})();
  }
}

/* gallery filter + lightbox */
var items=$$('.mas .it,.prev .it'),lb=$('.lb');
var fbs=$$('.fb');
fbs.forEach(function(f){f.addEventListener('click',function(){
  fbs.forEach(function(x){x.setAttribute('aria-pressed','false')});f.setAttribute('aria-pressed','true');
  var k=f.dataset.f;$$('.mas .it').forEach(function(it){it.hidden=!(k==='all'||it.dataset.c===k)});
})});
if(lb&&items.length){
  var li=$('img',lb),ct=$('.ct',lb),cur=0,list=[];
  function vis2(){return $$('.mas .it,.prev .it').filter(function(i){return!i.hidden})}
  function show(n){list=vis2();cur=(n+list.length)%list.length;var it=list[cur];li.src=it.dataset.full;li.alt=$('img',it).alt;ct.textContent=(cur+1)+' / '+list.length+' — '+(it.dataset.cap||'')}
  function open(i){list=vis2();lb.classList.add('on');D.body.style.overflow='hidden';show(list.indexOf(i));$('.x',lb).focus()}
  function shut(){lb.classList.remove('on');D.body.style.overflow='';}
  items.forEach(function(i){i.addEventListener('click',function(){open(i)})});
  $('.x',lb).addEventListener('click',shut);$('.nx',lb).addEventListener('click',function(){show(cur+1)});$('.pv',lb).addEventListener('click',function(){show(cur-1)});
  lb.addEventListener('click',function(e){if(e.target===lb)shut()});
  D.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='Escape')shut();if(e.key==='ArrowRight')show(cur+1);if(e.key==='ArrowLeft')show(cur-1)});
  var tx=0;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)show(cur+(d<0?1:-1))},{passive:true});
}

/* ambient water beads canvas */
var cv=$('#beads');
if(cv&&!RM){
  var ctx=cv.getContext('2d'),bs=[],run=false,cw,ch,N=W.innerWidth<700?14:28;
  function rs(){cw=cv.width=cv.offsetWidth;ch=cv.height=cv.offsetHeight}
  rs();W.addEventListener('resize',rs);
  for(var i=0;i<N;i++)bs.push({x:Math.random(),y:Math.random(),r:2+Math.random()*7,s:.012+Math.random()*.03,p:Math.random()*6});
  function draw(t){
    if(!run)return;ctx.clearRect(0,0,cw,ch);
    bs.forEach(function(b){b.y-=b.s/60;if(b.y<-.05){b.y=1.05;b.x=Math.random()}
      var x=(b.x+Math.sin(t/2600+b.p)*.012)*cw,y=b.y*ch,g=ctx.createRadialGradient(x-b.r*.3,y-b.r*.3,b.r*.1,x,y,b.r);
      g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(.5,'rgba(220,230,245,.12)');g.addColorStop(1,'rgba(166,226,46,.28)');
      ctx.beginPath();ctx.arc(x,y,b.r,0,6.283);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=.8;ctx.stroke()});
    raf(draw);
  }
  new IntersectionObserver(function(es){var v=es[0].isIntersecting;if(v&&!run){run=true;raf(draw)}else if(!v)run=false}).observe(cv);
}

/* quote form: validate, then SMS fallback or Formspree */
var f=$('#quote');
if(f){
  var P=f.dataset.phone,FS=f.dataset.formspree,out=$('.fmsg',f);
  function msg(){
    var g=function(n){return(f.elements[n]&&f.elements[n].value||'').trim()};
    var s='Hi Gallardo Auto Detail, I\'d like a quote.\nName: '+g('name')+'\nPhone: '+g('phone')+'\nVehicle: '+g('vehicle')+'\nService: '+g('service')+'\nArea / ZIP: '+g('area');
    if(g('notes'))s+='\nNotes: '+g('notes');return s;
  }
  function bad(el,m){el.setAttribute('aria-invalid','true');var e=el.parentNode.querySelector('.err');if(!e){e=D.createElement('span');e.className='err';e.setAttribute('role','alert');el.parentNode.appendChild(e)}e.textContent=m}
  function ok(el){el.removeAttribute('aria-invalid');var e=el.parentNode.querySelector('.err');if(e)e.remove()}
  $$('input,select,textarea',f).forEach(function(el){el.addEventListener('input',function(){ok(el)})});
  f.addEventListener('submit',function(e){
    e.preventDefault();var v=true,first=null,n=f.elements.name,p=f.elements.phone,s=f.elements.service,a=f.elements.area;
    [n,p,s,a].forEach(ok);
    if(f.elements.company.value)return;
    if(n.value.trim().length<2){bad(n,'Please enter your name.');v=false;first=first||n}
    if(p.value.replace(/\D/g,'').length<10){bad(p,'Enter a valid phone number (10 digits).');v=false;first=first||p}
    if(!s.value){bad(s,'Please choose a service.');v=false;first=first||s}
    if(a.value.trim().length<3){bad(a,'Enter your city or ZIP so we can check your area.');v=false;first=first||a}
    if(!v){first.focus();return}
    var text=msg();
    if(FS){
      var btn=$('button[type=submit]',f);btn.disabled=true;btn.firstChild.textContent='Sending… ';
      fetch(FS,{method:'POST',headers:{'Accept':'application/json'},body:new FormData(f)}).then(function(r){
        if(!r.ok)throw 0;out.innerHTML='<strong>Request sent.</strong> This is a quote request, not a confirmed appointment. Gallardo Auto Detail will contact you to confirm details and availability.';out.classList.add('on');f.reset();
      }).catch(function(){out.innerHTML='<strong>We couldn\'t send that online.</strong> Please text or call <a href="tel:'+P+'">'+P+'</a>.';out.classList.add('on')}).finally(function(){btn.disabled=false;btn.firstChild.textContent='Request a free quote '});
      return;
    }
    var mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    out.innerHTML='<strong>Almost done — send your request by text.</strong><br><span class="fine">This is not a confirmed booking. Your message will be answered by the shop to confirm details and availability.</span><textarea readonly aria-label="Your quote request message">'+text.replace(/</g,'&lt;')+'</textarea><div class="cta"><a class="btn p sm" href="sms:'+P+'?&body='+encodeURIComponent(text)+'">Open in Messages</a><button type="button" class="btn g sm" id="cp">Copy message</button><a class="btn g sm" href="tel:'+P+'">Call instead</a></div>';
    out.classList.add('on');
    $('#cp').addEventListener('click',function(){var t=this;(navigator.clipboard?navigator.clipboard.writeText(text):Promise.reject()).then(function(){t.textContent='Copied ✓'}).catch(function(){var ta=$('textarea',out);ta.select();try{D.execCommand('copy');t.textContent='Copied ✓'}catch(x){t.textContent='Press Ctrl/Cmd+C'}})});
    if(mobile)location.href='sms:'+P+'?&body='+encodeURIComponent(text);
    out.scrollIntoView({behavior:RM?'auto':'smooth',block:'center'});
  });
}
})();
