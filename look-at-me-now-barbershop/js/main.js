(function(){
'use strict';
var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||d).querySelectorAll(s))};
d.documentElement.classList.add('js');
var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
/* header turns solid on scroll */
var hdr=$('.hdr');
function hs(){if(hdr)hdr.classList.toggle('sc',window.scrollY>30)}addEventListener('scroll',hs,{passive:true});hs();
/* mobile menu */
var nav=$('#nav'),scrim=$('.scrim'),burger=$('.burger');
function menu(o){if(!nav)return;nav.classList.toggle('on',o);scrim.classList.toggle('on',o);d.body.classList.toggle('lock',o);burger.setAttribute('aria-expanded',o?'true':'false')}
if(burger){burger.addEventListener('click',function(){menu(true)});
$('.nclose').addEventListener('click',function(){menu(false)});scrim.addEventListener('click',function(){menu(false)});
$$('#nav a').forEach(function(a){a.addEventListener('click',function(){menu(false)})});
d.addEventListener('keydown',function(e){if(e.key==='Escape'){menu(false);lbClose()}});}
/* sticky mobile call bar after the hero */
var mbar=$('.mbar');
if(mbar){var th=function(){mbar.classList.toggle('on',window.scrollY>window.innerHeight*.6)};addEventListener('scroll',th,{passive:true});th()}
/* reveals */
var rv=$$('.rv');
if('IntersectionObserver' in window&&!rm){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -6% 0px'});rv.forEach(function(el){io.observe(el)});setTimeout(function(){rv.forEach(function(el){el.classList.add('in')})},2500)}else{rv.forEach(function(el){el.classList.add('in')})}
/* open / closed status and today's row, in Waco time (from the hours shown on Google) */
var H={0:null,1:null,2:[9,19],3:[9,19],4:[9,19],5:[9,19],6:[9,18]},DN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function wacoNow(){try{var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',weekday:'long',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),o={};p.forEach(function(x){o[x.type]=x.value});return {day:DN.indexOf(o.weekday),mins:(+o.hour%24)*60+(+o.minute)}}catch(e){var n=new Date();return {day:n.getDay(),mins:n.getHours()*60+n.getMinutes()}}}
var now=wacoNow(),hrs=H[now.day];
function fmt(h){return (h%12||12)+(h<12?' AM':' PM')}
$$('.hrs tr[data-d]').forEach(function(r){if(+r.getAttribute('data-d')===now.day)r.classList.add('today')});
$$('.status').forEach(function(s){var t;
if(hrs&&now.mins>=hrs[0]*60&&now.mins<hrs[1]*60){s.classList.add('open');t='Open now · until '+fmt(hrs[1])}
else{var nd=now.day,add=0,nh=null;if(hrs&&now.mins<hrs[0]*60){nh=hrs;add=0}else{for(var i=1;i<=7;i++){var dd=(now.day+i)%7;if(H[dd]){nh=H[dd];add=i;nd=dd;break}}}
t='Closed now · opens '+(add===0?'today':add===1?'tomorrow':DN[nd])+' '+fmt(nh[0])}
s.textContent=t+' (Waco time)'});
/* reviews carousel: drag + arrows */
var tk=$('.track');
if(tk){var down=false,sx=0,sl=0;
tk.addEventListener('mousedown',function(e){down=true;sx=e.pageX;sl=tk.scrollLeft;tk.classList.add('drag')});
addEventListener('mouseup',function(){down=false;tk.classList.remove('drag')});
tk.addEventListener('mousemove',function(e){if(!down)return;e.preventDefault();tk.scrollLeft=sl-(e.pageX-sx)});
var step=function(dir){var c=$('.rev',tk);tk.scrollBy({left:dir*(c.offsetWidth+22),behavior:rm?'auto':'smooth'})};
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
if(form){var TEL=form.getAttribute('data-tel'),BN=form.getAttribute('data-biz');
form.setAttribute('novalidate','');
form.addEventListener('submit',function(e){e.preventDefault();var ok=true;
['name','phone','service'].forEach(function(n){var f=form.elements[n],bad=!f.value.trim()||(n==='phone'&&f.value.replace(/\D/g,'').length<10);f.classList.toggle('bad',bad);if(bad){f.setAttribute('aria-invalid','true');ok=false}else f.removeAttribute('aria-invalid')});
if(!ok){var first=$('.bad',form);first&&first.focus();return}
var v=function(n){return form.elements[n].value.trim()};
var body='Hi '+BN+', this is '+v('name')+' ('+v('phone')+'). I would like: '+v('service')+'.'+(v('when')?' Best day/time: '+v('when')+'.':'')+(v('msg')?' '+v('msg'):'');
var m=$('.fmsg');m.hidden=false;
var sms='sms:'+TEL+'?&body='+encodeURIComponent(body);
m.innerHTML='<strong>Almost there. This is not a confirmed appointment.</strong><br>Your request has not been sent yet. Tap a button to open a pre-filled text or WhatsApp message to the shop, or call <a href="tel:'+TEL+'">'+form.getAttribute('data-phone')+'</a>. The shop will confirm a time with you.<br><a class="btn" href="'+sms+'">Open text message</a> <a class="btn ghost" style="color:var(--ink);border-color:var(--ink)" target="_blank" rel="noopener" href="https://wa.me/'+form.getAttribute('data-wa')+'?text='+encodeURIComponent(body)+'">Open WhatsApp</a><button type="button" class="cpy">Copy the message instead</button>';
$('.cpy',m).addEventListener('click',function(){var b=this;(navigator.clipboard?navigator.clipboard.writeText(body):Promise.reject()).then(function(){b.textContent='Copied'}).catch(function(){b.textContent='Copy not available. Select and copy from the text app.'})});
m.scrollIntoView({block:'nearest',behavior:rm?'auto':'smooth'});});}
})();
