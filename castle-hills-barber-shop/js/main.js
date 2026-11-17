(function(){
'use strict';
var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
d.documentElement.classList.add('js');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
/* mobile menu */
var nav=$('#nav'),scrim=$('.scrim'),burger=$('.burger');
function menu(o){if(!nav)return;nav.classList.toggle('on',o);scrim.classList.toggle('on',o);d.body.classList.toggle('lock',o);burger.setAttribute('aria-expanded',o?'true':'false')}
if(burger){burger.addEventListener('click',function(){menu(true)});
$('.nclose').addEventListener('click',function(){menu(false)});scrim.addEventListener('click',function(){menu(false)});
$$('#nav a').forEach(function(a){a.addEventListener('click',function(){menu(false)})});
d.addEventListener('keydown',function(e){if(e.key==='Escape'){menu(false);lbClose()}});}
/* sticky mobile call bar after the hero */
var mbar=$('.mbar');
if(mbar){var th=function(){mbar.classList.toggle('on',window.scrollY>window.innerHeight*.7)};addEventListener('scroll',th,{passive:true});th()}
/* reveals */
var rv=$$('.rv');
if('IntersectionObserver' in window&&!rm){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});rv.forEach(function(el){io.observe(el)});setTimeout(function(){rv.forEach(function(el){el.classList.add('in')})},2500)}else{rv.forEach(function(el){el.classList.add('in')})}
/* highlight today's opening hours */
var tr=$$('.hrs tr[data-d]'),dow=new Date().getDay();tr.forEach(function(r){if(+r.getAttribute('data-d')===dow)r.classList.add('today')});
/* reviews carousel: drag + arrows */
var tk=$('.track');
if(tk){var down=false,sx=0,sl=0,moved=0;
tk.addEventListener('mousedown',function(e){down=true;moved=0;sx=e.pageX;sl=tk.scrollLeft;tk.classList.add('drag')});
addEventListener('mouseup',function(){down=false;tk.classList.remove('drag')});
tk.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();moved=Math.abs(e.pageX-sx);tk.scrollLeft=sl-(e.pageX-sx)});
var step=function(dir){var c=$('.rev',tk);tk.scrollBy({left:dir*(c.offsetWidth+20),behavior:rm?'auto':'smooth'})};
var pv=$('.rctl .pv'),nx=$('.rctl .nx');if(pv)pv.addEventListener('click',function(){step(-1)});if(nx)nx.addEventListener('click',function(){step(1)});}
/* gallery filter + lightbox */
var lb=$('.lb'),items=[],cur=0;
function vis(){return $$('.mas .it').filter(function(e){return !e.hidden})}
function lbShow(i){items=vis();if(!items.length)return;cur=(i+items.length)%items.length;var b=items[cur];var im=$('.lb img');im.src=b.getAttribute('data-big');im.alt=b.getAttribute('data-alt');$('.lb .cp').textContent=b.getAttribute('data-cap');lb.classList.add('on');d.body.classList.add('lock')}
function lbClose(){if(!lb)return;lb.classList.remove('on');d.body.classList.remove('lock')}
if(lb){$$('.mas .it').forEach(function(b){b.addEventListener('click',function(){lbShow(vis().indexOf(b))})});
$('.lb .x').addEventListener('click',lbClose);$('.lb .pv').addEventListener('click',function(){lbShow(cur-1)});$('.lb .nx').addEventListener('click',function(){lbShow(cur+1)});
lb.addEventListener('click',function(e){if(e.target===lb)lbClose()});
d.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='ArrowRight')lbShow(cur+1);if(e.key==='ArrowLeft')lbShow(cur-1)});
var tx=0;lb.addEventListener('touchstart',function(e){tx=e.changedTouches[0].clientX},{passive:true});lb.addEventListener('touchend',function(e){var dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50)lbShow(cur+(dx<0?1:-1))},{passive:true});}
$$('.fb2').forEach(function(b){b.addEventListener('click',function(){var f=b.getAttribute('data-f');$$('.fb2').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});$$('.mas .it').forEach(function(it){it.hidden=!(f==='all'||it.getAttribute('data-c')===f)})})});
/* quote form: pre-filled text message (no backend, never a fake confirmation) */
var form=$('#quote');
if(form){var TEL=form.getAttribute('data-tel'),FS=form.getAttribute('data-formspree');
form.setAttribute('novalidate','');
form.addEventListener('submit',function(e){e.preventDefault();var ok=true;
['name','phone','service'].forEach(function(n){var f=form.elements[n],bad=!f.value.trim()||(n==='phone'&&f.value.replace(/\D/g,'').length<10);f.classList.toggle('bad',bad);if(bad){f.setAttribute('aria-invalid','true');ok=false}else f.removeAttribute('aria-invalid')});
if(!ok){var first=$('.bad',form);first&&first.focus();return}
var v=function(n){return form.elements[n].value.trim()};
var body='Hi Castle Hills Barber Shop, this is '+v('name')+' ('+v('phone')+'). I am interested in: '+v('service')+'.'+(v('when')?' Best day/time: '+v('when')+'.':'')+(v('msg')?' '+v('msg'):'');
var m=$('.fmsg');m.hidden=false;
var sms='sms:'+TEL+'?&body='+encodeURIComponent(body);
m.innerHTML='<strong>Almost there. This is not a confirmed appointment.</strong><br>Your request has not been sent yet. Tap the button to open a pre-filled text message to the shop, or call <a href="tel:'+TEL+'">'+form.getAttribute('data-phone')+'</a>. The shop will confirm a time with you.<br><a class="btn" style="margin-top:14px" href="'+sms+'">Open text message</a><br><button type="button" class="cpy">Copy message text</button>';
$('.cpy',m).addEventListener('click',function(){var b=this;(navigator.clipboard?navigator.clipboard.writeText(body):Promise.reject()).then(function(){b.textContent='Copied'}).catch(function(){b.textContent='Copy not available. Select and copy from the text app.'})});
m.scrollIntoView({block:'nearest',behavior:rm?'auto':'smooth'});});}
})();
