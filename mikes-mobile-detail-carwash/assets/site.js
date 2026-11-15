/* Mike’s Mobile Detail Carwash — interactions (vanilla JS, no dependencies). Built by BUILDORA. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js"); root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var PHONE_E164 = "+19155883559", PHONE_DISPLAY = "(915) 588-3559", BIZ = "Mike’s Mobile Detail Carwash";
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  requestAnimationFrame(function () { setTimeout(function () { root.classList.add("loaded"); }, 40); });

  /* ---------- Cinematic background stage: crossfade per section + parallax ---------- */
  var slides = $$(".bg-stage .bg-slide");
  var mobile = window.matchMedia("(max-width: 760px)").matches;
  function loadSlide(s) {
    if (!s || s.dataset.loaded || s.querySelector("img")) { if (s) s.dataset.loaded = "1"; return; }
    s.dataset.loaded = "1";
    var img = new Image(); img.alt = ""; img.decoding = "async";
    if (mobile) img.src = s.getAttribute("data-mob");
    else { img.sizes = "100vw"; img.srcset = s.getAttribute("data-desk"); img.src = s.getAttribute("data-mob"); }
    s.appendChild(img);
  }
  var activeKey = slides.length ? slides[0].getAttribute("data-key") : null;
  function activate(key) {
    if (key === activeKey) return;
    activeKey = key;
    slides.forEach(function (s) { var on = s.getAttribute("data-key") === key; if (on) loadSlide(s); s.classList.toggle("on", on); });
  }
  if (slides.length) {
    var preloadRest = function () { slides.forEach(function (s, i) { if (i) setTimeout(function () { loadSlide(s); }, i * 250); }); };
    window.addEventListener("load", function () { setTimeout(function () { (window.requestIdleCallback || setTimeout)(preloadRest); }, 2500); });
    if ("IntersectionObserver" in window) {
      var bgIO = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) activate(en.target.getAttribute("data-bg")); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      $$("[data-bg]").forEach(function (s) { bgIO.observe(s); });
      // make sure the next background is ready before it is needed
      var nearIO = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { var k = en.target.getAttribute("data-bg"); slides.forEach(function (s) { if (s.getAttribute("data-key") === k) loadSlide(s); }); nearIO.unobserve(en.target); } });
      }, { rootMargin: "60% 0px 60% 0px" });
      $$("[data-bg]").forEach(function (s) { nearIO.observe(s); });
    }
  }

  /* ---------- Scroll: header, progress, mobile bar, parallax ---------- */
  var header = document.querySelector(".site-header"), bar = document.querySelector(".mobile-bar"), progress = document.querySelector(".progress");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0, max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (header) header.classList.toggle("is-solid", y > 30);
    if (bar) bar.classList.toggle("show", y > window.innerHeight * 0.55);
    if (progress) progress.style.transform = "scaleX(" + (y / max).toFixed(4) + ")";
    if (!reduce) {
      var shift = ((y / max) - 0.5) * 8; // vh, within the slide's 6% overscan
      for (var i = 0; i < slides.length; i++) slides[i].style.transform = "translate3d(0," + shift.toFixed(2) + "vh,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".menu-toggle");
  if (toggle) {
    var setNav = function (open) {
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    toggle.addEventListener("click", function () { setNav(!document.body.classList.contains("nav-open")); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("nav-open")) { setNav(false); toggle.focus(); } });
    $$(".nav a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) setNav(false); });
  }

  /* ---------- Reveal + counters + rating bars ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var t0 = null, dur = 1700;
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var revealEls = $$(".reveal, .media-frame, [data-count], .bar .fill, .area-map");
  function reveal(el) {
    el.classList.add("in");
    if (el.hasAttribute("data-count")) countUp(el);
    if (el.classList.contains("fill")) el.style.width = el.getAttribute("data-w");
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else { revealEls.forEach(reveal); }

  /* ---------- Hero keyword rotator ---------- */
  $$(".rotator").forEach(function (r) {
    var words = r.querySelectorAll("span"); if (words.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      if (document.hidden) return;
      var cur = words[i]; i = (i + 1) % words.length; var nxt = words[i];
      cur.classList.remove("on"); cur.classList.add("out");
      nxt.classList.remove("out"); nxt.classList.add("on");
      setTimeout(function () { cur.classList.remove("out"); }, 800);
    }, 2400);
  });

  /* ---------- Open / closed status (Rio Grande Valley = America/Chicago) ---------- */
  function txNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      return { day: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[o.weekday], min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function toMin(s) { var a = s.split(":"); return +a[0] * 60 + (+a[1]); }
  function fmt(s) { var m = toMin(s), h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return h + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; }
  function paintStatus() {
    var now = txNow();
    $$(".open-status[data-hours]").forEach(function (el) {
      var hours; try { hours = JSON.parse(el.getAttribute("data-hours")); } catch (e) { return; }
      var today = hours[String(now.day)], txt = el.querySelector(".txt"), open = false, msg;
      if (today && now.min >= toMin(today[0]) && now.min < toMin(today[1])) { open = true; msg = "Open now · until " + fmt(today[1]); }
      else if (today && now.min < toMin(today[0])) msg = "Closed · opens today " + fmt(today[0]);
      else { var nx = hours[String((now.day + 1) % 7)]; msg = "Closed · opens tomorrow " + (nx ? fmt(nx[0]) : ""); }
      el.classList.toggle("closed", !open);
      if (txt) txt.textContent = msg;
    });
  }
  paintStatus(); setInterval(paintStatus, 60000);
  var dayIdx = txNow().day;
  $$(".hours li[data-day]").forEach(function (li) { if (+li.getAttribute("data-day") === dayIdx) li.classList.add("today"); });

  /* ---------- Spotlight, tilt, magnetic buttons ---------- */
  if (finePointer) {
    $$(".spot").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px"); el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }
  if (finePointer && !reduce) {
    $$("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
    $$(".btn-magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Water beads (hydrophobic ceramic beading) on the hero ---------- */
  var cv = document.querySelector("canvas.beads");
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext("2d"), beads = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 1.75), running = false, mx = -999, my = -999, started = false;
    var mk = function (top) {
      var r = 2 + Math.pow(Math.random(), 2.6) * 15;
      return { x: Math.random() * W, y: top ? -r - Math.random() * H * 0.3 : Math.random() * H, r: r, v: 0, slide: Math.random() < 0.22 + r / 60, wob: Math.random() * 6.28 };
    };
    var size = function () {
      W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, W * H / 16000)); beads = [];
      for (var k = 0; k < n; k++) beads.push(mk(false));
    };
    var draw = function (t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < beads.length; k++) {
        var b = beads[k];
        if (b.slide) { b.v = Math.min(b.v + 0.004 * b.r, 0.25 + b.r * 0.06); b.y += b.v; b.x += Math.sin(t / 900 + b.wob) * 0.08; }
        var dx = b.x - mx, dy = b.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 90 && d > 0) { b.x += dx / d * 1.4; b.y += dy / d * 1.4; }
        if (b.y - b.r > H) { beads[k] = mk(true); continue; }
        // shadow / body / refraction / highlight
        ctx.fillStyle = "rgba(0,0,0,0.28)";
        ctx.beginPath(); ctx.ellipse(b.x + b.r * 0.25, b.y + b.r * 0.35, b.r, b.r * 0.92, 0, 0, 6.2832); ctx.fill();
        var g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
        g.addColorStop(0, "rgba(255,255,255,0.22)"); g.addColorStop(0.55, "rgba(200,215,235,0.06)"); g.addColorStop(0.9, "rgba(40,170,255,0.16)"); g.addColorStop(1, "rgba(255,255,255,0.32)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.2832); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.38, b.y - b.r * 0.4, b.r * 0.24, b.r * 0.14, -0.7, 0, 6.2832); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    var start = function () { if (!running) { running = true; requestAnimationFrame(draw); } };
    var host = cv.parentElement;
    host.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener("pointerleave", function () { mx = my = -999; });
    window.addEventListener("resize", function () { if (started) size(); });
    // start after first paint so it never competes with loading
    window.addEventListener("load", function () {
      setTimeout(function () {
        started = true; size();
        if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting) start(); else running = false; }).observe(cv);
        else start();
      }, 600);
    });
    document.addEventListener("visibilitychange", function () { if (document.hidden) running = false; else if (started) start(); });
  }

  /* ---------- Reviews carousel (snap + drag + autoplay, pauses on hover) ---------- */
  $$(".carousel").forEach(function (c) {
    var track = c.querySelector(".carousel-track"), cards = track.children, dotsWrap = c.querySelector(".dots");
    var prev = c.querySelector("[data-prev]"), next = c.querySelector("[data-next]");
    function step() { var g = parseFloat(getComputedStyle(track).columnGap) || 16; return cards[0].getBoundingClientRect().width + g; }
    function perView() { return Math.max(1, Math.round((track.clientWidth + 16) / step())); }
    function pages() { return Math.max(1, cards.length - perView() + 1); }
    function current() { return Math.round(track.scrollLeft / step()); }
    function go(i) { var n = pages(); i = (i + n) % n; track.scrollTo({ left: i * step(), behavior: reduce ? "auto" : "smooth" }); }
    function sync() { var cur = current(); Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.classList.toggle("on", i === cur); }); }
    function buildDots() {
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pages(); i++) {
        var d = document.createElement("button"); d.type = "button"; d.setAttribute("aria-label", "Go to review " + (i + 1));
        (function (k) { d.addEventListener("click", function () { go(k); }); })(i);
        dotsWrap.appendChild(d);
      }
      sync();
    }
    track.addEventListener("scroll", function () { requestAnimationFrame(sync); }, { passive: true });
    prev.addEventListener("click", function () { go(current() - 1); });
    next.addEventListener("click", function () { go(current() + 1); });
    window.addEventListener("resize", buildDots); buildDots();
    var paused = false, visible = false;
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(c);
    if (!reduce) setInterval(function () { if (!paused && visible && !document.hidden) go(current() + 1); }, 5600);
    ["pointerenter", "focusin", "touchstart"].forEach(function (ev) { c.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["pointerleave", "focusout"].forEach(function (ev) { c.addEventListener(ev, function () { paused = false; }); });
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; track.classList.remove("dragging"); go(current()); });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ---------- Service finder ---------- */
  $$(".picker").forEach(function (p) {
    var btns = $$(".pick-btn", p), panes = $$(".pick-pane", p);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var i = b.getAttribute("data-pick");
        btns.forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
        panes.forEach(function (x) { x.classList.toggle("on", x.getAttribute("data-pane") === i); });
      });
    });
  });

  /* ---------- Gallery filter ---------- */
  var grid = document.getElementById("g-grid");
  if (grid) {
    var gItems = $$(".g-item", grid), chips = $$(".chip-btn[data-filter]"), empty = document.querySelector(".g-empty");
    chips.forEach(function (c) {
      var k = c.getAttribute("data-filter"), n = k === "all" ? gItems.length : gItems.filter(function (g) { return (" " + g.getAttribute("data-cat") + " ").indexOf(" " + k + " ") > -1; }).length;
      var span = c.querySelector(".n"); if (span) span.textContent = n;
      c.addEventListener("click", function () {
        chips.forEach(function (x) { var on = x === c; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
        var shown = 0;
        gItems.forEach(function (g) {
          var show = k === "all" || (" " + g.getAttribute("data-cat") + " ").indexOf(" " + k + " ") > -1;
          g.classList.toggle("hide", !show);
          if (show) { shown++; g.classList.remove("in"); void g.offsetWidth; g.classList.add("in"); }
        });
        if (empty) empty.hidden = shown > 0;
      });
    });
  }

  /* ---------- Lightbox (keyboard + swipe; follows the active gallery filter) ---------- */
  var allItems = $$("[data-lightbox]"), lb = document.getElementById("lightbox");
  if (allItems.length && lb && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), lbCount = lb.querySelector(".lb-count"), list = allItems, idx = 0;
    var show = function (i) {
      idx = (i + list.length) % list.length; var it = list[idx];
      lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = "";
      lbImg.src = it.getAttribute("data-full"); lbImg.alt = it.querySelector("img").alt;
      lbCap.textContent = it.getAttribute("data-caption") || "";
      if (lbCount) lbCount.textContent = (idx + 1) + " / " + list.length;
    };
    allItems.forEach(function (it) {
      it.addEventListener("click", function () {
        list = allItems.filter(function (x) { return !x.classList.contains("hide"); });
        show(list.indexOf(it)); lb.showModal();
        var single = list.length < 2; lb.querySelector(".lb-prev").hidden = single; lb.querySelector(".lb-next").hidden = single;
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") show(idx + 1); if (e.key === "ArrowLeft") show(idx - 1); });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
  } else {
    allItems.forEach(function (it) { it.addEventListener("click", function () { window.open(it.getAttribute("data-full"), "_blank", "noopener"); }); });
  }

  /* ---------- Year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Quote form ----------
     Validates; POSTs to data-endpoint (e.g. Formspree) when one is set, otherwise builds a pre-filled
     SMS to the business phone (with a copy option on desktop). Never claims a booking is confirmed. */
  var form = document.getElementById("quote-form");
  if (form) {
    var pre = new URLSearchParams(window.location.search).get("service");
    if (pre) { $$('input[name="service"]', form).forEach(function (b) { if (b.value === pre) b.checked = true; }); }
    var dateInput = form.querySelector('input[type="date"]');
    if (dateInput) { var t = new Date(); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); dateInput.min = t.toISOString().slice(0, 10); }
    var setErr = function (field, msg) {
      var wrap = field.closest(".field"); if (!wrap) return;
      wrap.classList.toggle("invalid", !!msg); var e = wrap.querySelector(".err"); if (e) e.textContent = msg || "";
      field.setAttribute("aria-invalid", msg ? "true" : "false");
    };
    var validate = function () {
      var ok = true, first = null, f = form.elements;
      [[f.name, f.name.value.trim().length >= 2 ? "" : "Please enter your name."],
       [f.phone, f.phone.value.replace(/\D/g, "").length >= 10 ? "" : "Please enter a 10-digit phone number."],
       [f.vehicle, f.vehicle.value.trim().length >= 2 ? "" : "Tell us the year, make and model."],
       [f.where, f.where.value.trim().length >= 2 ? "" : "Tell us the city or ZIP so we can confirm we cover it."]
      ].forEach(function (p) { setErr(p[0], p[1]); if (p[1]) { ok = false; if (!first) first = p[0]; } });
      var set = form.querySelector("fieldset[data-required]"), any = form.querySelectorAll('input[name="service"]:checked').length > 0;
      if (set) { set.classList.toggle("invalid", !any); if (!any) { ok = false; if (!first) first = set.querySelector("input"); } }
      if (first) first.focus();
      return ok;
    };
    $$("input, select, textarea", form).forEach(function (el) {
      el.addEventListener("input", function () { var w = el.closest(".field"); if (w && w.classList.contains("invalid") && el.type !== "checkbox") { w.classList.remove("invalid"); el.setAttribute("aria-invalid", "false"); var e = w.querySelector(".err"); if (e) e.textContent = ""; } });
      if (el.type === "checkbox") el.addEventListener("change", function () { var s = el.closest("fieldset"); if (s && form.querySelectorAll('input[name="service"]:checked').length) s.classList.remove("invalid"); });
    });
    var buildMessage = function () {
      var f = form.elements, services = $$('input[name="service"]:checked', form).map(function (c) { return c.value; });
      var lines = ["Quote request from the Mike’s Mobile Detail Carwash website", "Name: " + f.name.value.trim(), "Phone: " + f.phone.value.trim(),
        "Vehicle: " + f.vehicle.value.trim() + (f.vtype.value ? " (" + f.vtype.value + ")" : ""), "Interested in: " + services.join(", "),
        "Location: " + f.where.value.trim()];
      if (f.date.value) lines.push("Preferred day: " + f.date.value);
      if (f.notes.value.trim()) lines.push("Notes: " + f.notes.value.trim());
      return lines.join("\n");
    };
    var result = document.getElementById("quote-result"), isTouch = window.matchMedia("(pointer: coarse)").matches;
    var showSms = function (msg, intro) {
      var sep = /iPhone|iPad|iPod/.test(navigator.userAgent) ? "&" : "?", smsHref = "sms:" + PHONE_E164 + sep + "body=" + encodeURIComponent(msg);
      result.innerHTML = "<h3>Your request is ready to send.</h3><p>" + (intro || (isTouch ? "Your messages app should open with everything filled in — add photos if you like, then hit send." : "Text this to " + PHONE_DISPLAY + " from your phone, or copy it below.")) + "</p><pre></pre>" +
        '<div class="btn-row"><a class="btn btn-primary btn-sm" href="' + smsHref + '">Text this request</a><button type="button" class="btn btn-glass btn-sm" data-copy>Copy message</button><a class="btn btn-glass btn-sm" href="tel:' + PHONE_E164 + '">Call instead</a></div>' +
        '<p class="form-note">This is a request, not a confirmed booking — ' + BIZ + " will reply to confirm the price and time.</p>";
      result.querySelector("pre").textContent = msg; result.classList.add("show");
      result.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      var copyBtn = result.querySelector("[data-copy]");
      copyBtn.addEventListener("click", function () {
        var done = function () { copyBtn.textContent = "Copied ✓"; setTimeout(function () { copyBtn.textContent = "Copy message"; }, 2000); };
        var fallback = function () {
          var ta = document.createElement("textarea"); ta.value = msg; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
          document.body.appendChild(ta); ta.select();
          try { if (document.execCommand("copy")) done(); } catch (err) {}
          document.body.removeChild(ta);
        };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(msg).then(done, fallback); else fallback();
      });
      if (isTouch) window.location.href = smsHref;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.elements.company && form.elements.company.value) return;
      if (!validate()) return;
      var msg = buildMessage(), endpoint = form.getAttribute("data-endpoint"), btn = form.querySelector('button[type="submit"]'), label = btn.innerHTML;
      if (endpoint) {
        btn.disabled = true; btn.textContent = "Sending…";
        fetch(endpoint, { method: "POST", headers: { "Accept": "application/json" }, body: new FormData(form) })
          .then(function (r) { if (!r.ok) throw new Error("status"); })
          .then(function () {
            result.innerHTML = '<h3>Request sent.</h3><p style="margin:0">Thanks — we’ll reach out to confirm the price and time. This is a request, not a confirmed booking. Need it sooner? Call <a href="tel:' + PHONE_E164 + '">' + PHONE_DISPLAY + "</a>.</p>";
            result.classList.add("show"); form.reset();
          })
          .catch(function () { showSms(msg, "We couldn't send the form just now. You can text the request instead:"); })
          .finally(function () { btn.disabled = false; btn.innerHTML = label; });
        return;
      }
      showSms(msg);
    });
  }
})();
