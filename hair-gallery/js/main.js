(function () {
'use strict';
var D = document, W = window;
var $ = function (s, c) { return (c || D).querySelector(s); };
var $$ = function (s, c) { return Array.prototype.slice.call((c || D).querySelectorAll(s)); };
var RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* sticky mobile bar appears after the hero */
var mbar = $('.mbar'), hero = $('.hero,.phero'), tick = false;
function onScroll() {
  if (mbar) mbar.classList.toggle('on', W.scrollY > (hero ? hero.offsetHeight * 0.7 : 300));
  tick = false;
}
W.addEventListener('scroll', function () { if (!tick) { tick = true; W.requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* mobile nav: accent panel, dimmed backdrop, X button, Esc, scroll lock */
var bg = $('.burger'), nav = $('#nav');
if (bg && nav) {
  var scrim = D.createElement('div'); scrim.className = 'scrim'; D.body.appendChild(scrim);
  var xb = D.createElement('button'); xb.type = 'button'; xb.className = 'nclose'; xb.setAttribute('aria-label', 'Close menu'); xb.innerHTML = '&times;'; nav.appendChild(xb);
  var close = function () { nav.classList.remove('on'); scrim.classList.remove('on'); bg.setAttribute('aria-expanded', 'false'); D.body.style.overflow = ''; };
  bg.addEventListener('click', function () {
    if (!nav.classList.contains('on')) { nav.classList.add('on'); scrim.classList.add('on'); bg.setAttribute('aria-expanded', 'true'); D.body.style.overflow = 'hidden'; } else close();
  });
  scrim.addEventListener('click', close); xb.addEventListener('click', close);
  $$('a', nav).forEach(function (a) { a.addEventListener('click', close); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  W.matchMedia('(min-width:900px)').addEventListener('change', close);
}

/* reveals: fade + rise only; anything already on screen shows at once */
var rvs = $$('.rv');
if ('IntersectionObserver' in W && !RM) {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  rvs.forEach(function (el) { io.observe(el); });
  setTimeout(function () { rvs.forEach(function (el) { el.classList.add('in'); }); }, 4000);
} else rvs.forEach(function (el) { el.classList.add('in'); });

/* opening hours: highlight today, say open/closed (Corpus Christi time) */
var HRS = [[14, 19], [10, 20], [10, 20], [10, 20], [10, 20], [10, 19], null]; /* Mon..Sun */
function ccNow() {
  try {
    var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
    var o = {}; p.forEach(function (x) { o[x.type] = x.value; });
    var d = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(o.weekday);
    return { d: d, h: (parseInt(o.hour, 10) % 24) + parseInt(o.minute, 10) / 60 };
  } catch (x) { return null; }
}
var n = ccNow();
if (n && n.d > -1) {
  $$('.hours tr[data-d="' + n.d + '"]').forEach(function (r) { r.classList.add('now'); });
  var t = $('[data-today]'), h = HRS[n.d], fmt = function (x) { return (x % 12 || 12) + (x >= 12 ? ' PM' : ' AM'); };
  if (t) {
    if (h && n.h >= h[0] && n.h < h[1]) t.textContent = 'Open now · until ' + fmt(h[1]);
    else if (h && n.h < h[0]) t.textContent = 'Opens today at ' + fmt(h[0]);
    else t.textContent = 'Closed now · Corpus Christi, Texas';
  }
}

/* gallery: filter + lightbox with swipe */
var fbs = $$('.fb'), items = $$('.mas .it');
fbs.forEach(function (b) {
  b.addEventListener('click', function () {
    fbs.forEach(function (x) { x.classList.toggle('on', x === b); });
    var f = b.getAttribute('data-f');
    items.forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-g') === f); });
  });
});
var lb = $('.lb');
if (lb && items.length) {
  var li = $('img', lb), lc = $('figcaption', lb), cur = 0, vis = [], last = null;
  var show = function (i) {
    cur = (i + vis.length) % vis.length; var b = $('.pbtn', vis[cur]);
    li.src = b.getAttribute('data-full'); li.alt = b.getAttribute('data-alt'); lc.textContent = b.getAttribute('data-cap');
  };
  var open = function (it) {
    vis = items.filter(function (x) { return !x.hidden; }); last = D.activeElement;
    lb.hidden = false; D.body.style.overflow = 'hidden'; show(vis.indexOf(it)); $('.lbx', lb).focus();
  };
  var shut = function () { lb.hidden = true; D.body.style.overflow = ''; if (last) last.focus(); };
  items.forEach(function (it) { $('.pbtn', it).addEventListener('click', function () { open(it); }); });
  $('.lbx', lb).addEventListener('click', shut);
  $('.lbp', lb).addEventListener('click', function () { show(cur - 1); });
  $('.lbn', lb).addEventListener('click', function () { show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) shut(); });
  D.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') shut(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
  });
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
  });
}

/* contact form: no backend, so it builds a pre-filled text (never claims a booking) */
var f = $('#quote');
if (f) {
  var P = f.getAttribute('data-phone'), FS = f.getAttribute('data-formspree'), out = $('.fmsg', f);
  var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = f.elements.name, phone = f.elements.phone, svc = f.elements.service, bad = [];
    [name, phone, svc].forEach(function (el) { el.classList.remove('bad'); if (!el.value.trim()) { el.classList.add('bad'); bad.push(el); } });
    if (phone.value.trim() && phone.value.replace(/\D/g, '').length < 10) { phone.classList.add('bad'); bad.push(phone); }
    if (bad.length) { out.innerHTML = '<span class="err">Please add your name, a phone number the salon can text back, and what you are after.</span>'; bad[0].focus(); return; }
    var text = 'Hi Hair Gallery, this is ' + name.value.trim() + ' (' + phone.value.trim() + '). I am interested in: ' + svc.value + '.' +
      (f.elements.when.value.trim() ? ' Best day or time: ' + f.elements.when.value.trim() + '.' : '') +
      (f.elements.msg.value.trim() ? ' ' + f.elements.msg.value.trim() : '') + ' Could you let me know what is available?';
    var safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    var link = 'sms:' + P + '?&body=' + encodeURIComponent(text);
    if (FS) {
      fetch(FS, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ name: name.value, phone: phone.value, service: svc.value, when: f.elements.when.value, message: f.elements.msg.value }) })
        .then(function (r) { out.innerHTML = r.ok ? '<strong>Request sent.</strong> This is not a confirmed appointment. The salon will reply to confirm.' : '<span class="err">That did not send. Please call ' + P + '.</span>'; })
        .catch(function () { out.innerHTML = '<span class="err">That did not send. Please call ' + P + '.</span>'; });
      return;
    }
    out.innerHTML = '<strong>Almost there: send it as a text.</strong><br><span class="fine">This is not a booked appointment. The salon replies to confirm what is available. If the text does not open, copy it or call instead.</span><textarea readonly aria-label="Your message">' + safe + '</textarea><div class="btns"><a class="btn solid sm" href="' + link + '">Open in Messages</a><button type="button" class="btn line sm" id="cp">Copy message</button><a class="btn line sm" href="tel:' + P + '">Call instead</a></div>';
    $('#cp').addEventListener('click', function () {
      var b = this, ta = $('textarea', out);
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { b.textContent = 'Copied'; }).catch(function () {
        ta.select(); try { D.execCommand('copy'); b.textContent = 'Copied'; } catch (x) { b.textContent = 'Press Ctrl/Cmd+C'; }
      });
    });
    if (mobile) location.href = link;
  });
}
})();
