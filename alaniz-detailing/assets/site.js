/* Alaniz Detailing — interactions (vanilla JS, no dependencies). Built by BUILDORA. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var PHONE_E164 = "+13616499815", PHONE_DISPLAY = "(361) 649-9815", BIZ = "Alaniz Detailing";

  requestAnimationFrame(function () { setTimeout(function () { root.classList.add("loaded"); }, 60); });

  /* ---------- Cinematic background stage (crossfade per section + parallax + Ken Burns) ---------- */
  var stage = document.querySelector(".bg-stage");
  var slides = stage ? Array.prototype.slice.call(stage.querySelectorAll(".bg-slide")) : [];
  var wide = window.innerWidth > 760;
  var activeKey = slides.length ? slides[0].getAttribute("data-key") : null;
  function loadSlide(s) {
    if (!s || s.dataset.loaded) return;
    if (s.dataset.inline && !wide) { s.dataset.loaded = "1"; return; } // already in the HTML at phone size
    var src = s.getAttribute("data-src");
    if (!src) return;
    var url = src + (wide ? "-d.webp" : "-m.webp"); // self-hosted crops: 1920px landscape / 900px portrait
    var img = new Image();
    img.onload = function () { s.style.backgroundImage = 'url("' + url + '")'; };
    img.src = url;
    s.dataset.loaded = "1";
  }
  function activate(key) {
    if (key === activeKey) return;
    activeKey = key;
    slides.forEach(function (s) {
      var on = s.getAttribute("data-key") === key;
      if (on) loadSlide(s);
      s.classList.toggle("on", on);
    });
  }
  if (slides.length) {
    loadSlide(slides[0]);
    window.addEventListener("load", function () { setTimeout(function () { slides.forEach(loadSlide); }, 1200); });
    if ("IntersectionObserver" in window) {
      var bgIO = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) activate(en.target.getAttribute("data-bg")); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      document.querySelectorAll("[data-bg]").forEach(function (s) { bgIO.observe(s); });
    }
  }

  /* ---------- Scroll: header, progress, mobile bar, parallax ---------- */
  var header = document.querySelector(".site-header");
  var bar = document.querySelector(".mobile-bar");
  var progress = document.querySelector(".progress");
  var scrollY = 0, ticking = false;
  function paintSlides(t) {
    if (reduce || !slides.length) return;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var shift = ((scrollY / max) - 0.5) * 9; // vh — stays inside the slide's 6% overscan
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i], sc = 1.08;
      if (s.classList.contains("on")) sc += 0.05 * (0.5 - 0.5 * Math.cos((t || 0) / 18000 * Math.PI * 2)); // slow Ken Burns
      s.style.transform = "translate3d(0," + shift.toFixed(2) + "vh,0) scale(" + sc.toFixed(4) + ")";
    }
  }
  function onScroll() {
    scrollY = window.scrollY || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (header) header.classList.toggle("is-solid", scrollY > 30);
    if (bar) bar.classList.toggle("show", scrollY > window.innerHeight * 0.6);
    if (progress) progress.style.transform = "scaleX(" + (scrollY / max).toFixed(4) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
  if (!reduce && slides.length) {
    (function loop(t) { if (!document.hidden) paintSlides(t); requestAnimationFrame(loop); })(0);
  }

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
    document.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth > 920) setNav(false); });
  }

  /* ---------- Reveal + counters + rating bars ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var t0 = null, dur = 1700;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var revealEls = document.querySelectorAll(".reveal, .media-frame, [data-count], .fill");
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
  } else {
    revealEls.forEach(reveal);
  }

  /* ---------- Hero word rotator ---------- */
  document.querySelectorAll(".rotator").forEach(function (r) {
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

  /* ---------- Open / closed status (shop time = America/Chicago) ---------- */
  function houstonNow() {
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      var o = {}; parts.forEach(function (p) { o[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { day: days[o.weekday], min: (+o.hour % 24) * 60 + (+o.minute) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function toMin(s) { var a = s.split(":"); return +a[0] * 60 + (+a[1]); }
  function fmt(s) { var m = toMin(s), h = Math.floor(m / 60), mm = m % 60, ap = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return h + (mm ? ":" + (mm < 10 ? "0" : "") + mm : "") + " " + ap; }
  var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  function paintStatus() {
    var now = houstonNow();
    document.querySelectorAll(".open-status[data-hours]").forEach(function (el) {
      var hours; try { hours = JSON.parse(el.getAttribute("data-hours")); } catch (e) { return; }
      var today = hours[String(now.day)], txt = el.querySelector(".txt"), open = false, msg;
      if (today && now.min >= toMin(today[0]) && now.min < toMin(today[1])) {
        open = true; msg = "Open now · until " + fmt(today[1]);
      } else if (today && now.min < toMin(today[0])) {
        msg = "Closed · opens today at " + fmt(today[0]);
      } else {
        var nd = (now.day + 1) % 7, nx = hours[String(nd)];
        msg = "Closed · opens " + (nx ? (nd === (now.day + 1) % 7 ? "tomorrow" : dayNames[nd]) + " at " + fmt(nx[0]) : "soon");
      }
      el.classList.toggle("closed", !open);
      if (txt) txt.textContent = msg;
    });
  }
  paintStatus(); setInterval(paintStatus, 60000);

  /* ---------- Today in the hours list ---------- */
  var dayIdx = houstonNow().day;
  document.querySelectorAll(".hours li[data-day]").forEach(function (li) { if (+li.getAttribute("data-day") === dayIdx) li.classList.add("today"); });

  /* ---------- Gallery filter ---------- */
  document.querySelectorAll(".filters").forEach(function (bar) {
    var btns = Array.prototype.slice.call(bar.querySelectorAll(".f-btn"));
    var grid = bar.nextElementSibling;
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-filter");
        btns.forEach(function (x) { var on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on ? "true" : "false"); });
        grid.querySelectorAll(".g-item").forEach(function (it) {
          var show = f === "all" || (" " + it.getAttribute("data-cats") + " ").indexOf(" " + f + " ") > -1;
          it.hidden = !show;
          if (show) { it.classList.add("in"); if (!reduce) { it.classList.remove("pop"); void it.offsetWidth; it.classList.add("pop"); } }
        });
      });
    });
  });

  /* ---------- Spotlight (cursor-following glow) ---------- */
  if (finePointer) {
    document.querySelectorAll(".spot").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", (e.clientX - r.left) + "px");
        el.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ---------- Tilt + magnetic buttons ---------- */
  if (finePointer && !reduce) {
    document.querySelectorAll("[data-tilt]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-py * 5).toFixed(2) + "deg) rotateY(" + (px * 5).toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
    document.querySelectorAll(".btn-magnetic").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      b.addEventListener("pointerleave", function () { b.style.transform = ""; });
    });
  }

  /* ---------- Soap-bubble canvas (hero ambience) ---------- */
  var cv = document.querySelector("canvas.bubbles");
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext("2d"), bubbles = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true, mx = -999, my = -999;
    var size = function () {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(34, W / 36)); bubbles = [];
      for (var k = 0; k < n; k++) bubbles.push(mk(true));
    };
    var mk = function (anywhere) {
      var r = 4 + Math.pow(Math.random(), 2.4) * 30;
      // water beads tinted to the brand: mostly electric aqua, a few volt-lime
      return { x: Math.random() * W, y: anywhere ? Math.random() * H : H + r + 10, r: r, vy: -(0.15 + Math.random() * 0.45) * (1 + 6 / r), vx: 0, ph: Math.random() * 6.28, hue: Math.random() < 0.28 ? 78 : 192, a: 0.35 + Math.random() * 0.5 };
    };
    var draw = function (t) {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < bubbles.length; k++) {
        var b = bubbles[k];
        var dx = b.x - mx, dy = b.y - my, d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < 130) { b.x += dx / d * 1.2; b.y += dy / d * 1.2; }
        b.y += b.vy; b.x += Math.sin(t / 1400 + b.ph) * 0.25;
        if (b.y < -b.r - 20) bubbles[k] = mk(false);
        var hue = b.hue + 14 * Math.sin(t / 2600 + b.ph);
        // thin-film body
        var g = ctx.createRadialGradient(b.x, b.y, b.r * 0.55, b.x, b.y, b.r);
        g.addColorStop(0, "rgba(255,120,190,0)");
        g.addColorStop(0.8, "hsla(" + hue + ",90%,75%," + (0.10 * b.a) + ")");
        g.addColorStop(1, "hsla(" + (hue + 20) + ",95%,78%," + (0.38 * b.a) + ")");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        // rim
        ctx.strokeStyle = "rgba(255,225,240," + (0.35 * b.a) + ")"; ctx.lineWidth = 0.8; ctx.stroke();
        // highlight
        ctx.fillStyle = "rgba(255,255,255," + (0.75 * b.a) + ")";
        ctx.beginPath(); ctx.ellipse(b.x - b.r * 0.38, b.y - b.r * 0.42, b.r * 0.22, b.r * 0.12, -0.7, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    size(); window.addEventListener("resize", size);
    var host = cv.parentElement;
    host.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener("pointerleave", function () { mx = my = -999; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !running) { running = true; requestAnimationFrame(draw); } else if (!v) running = false; }).observe(cv);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) running = false; else if (!running) { running = true; requestAnimationFrame(draw); } });
    requestAnimationFrame(draw);
  }

  /* ---------- Reviews carousel (snap + drag + autoplay) ---------- */
  document.querySelectorAll(".carousel").forEach(function (c) {
    var track = c.querySelector(".carousel-track"), cards = track.children, dotsWrap = c.querySelector(".dots");
    var prev = c.querySelector("[data-prev]"), next = c.querySelector("[data-next]");
    function step() { var g = parseFloat(getComputedStyle(track).columnGap) || 16; return cards[0].getBoundingClientRect().width + g; }
    function perView() { return Math.max(1, Math.round((track.clientWidth + 16) / step())); }
    function pages() { return Math.max(1, cards.length - perView() + 1); }
    function current() { return Math.round(track.scrollLeft / step()); }
    function go(i) { var n = pages(); i = (i + n) % n; track.scrollTo({ left: i * step(), behavior: reduce ? "auto" : "smooth" }); }
    function buildDots() {
      dotsWrap.innerHTML = "";
      for (var i = 0; i < pages(); i++) {
        var d = document.createElement("button"); d.type = "button"; d.setAttribute("aria-label", "Go to review " + (i + 1));
        (function (k) { d.addEventListener("click", function () { go(k); }); })(i);
        dotsWrap.appendChild(d);
      }
      sync();
    }
    function sync() { var cur = current(); Array.prototype.forEach.call(dotsWrap.children, function (d, i) { d.classList.toggle("on", i === cur); }); }
    track.addEventListener("scroll", function () { requestAnimationFrame(sync); }, { passive: true });
    prev.addEventListener("click", function () { go(current() - 1); });
    next.addEventListener("click", function () { go(current() + 1); });
    window.addEventListener("resize", buildDots); buildDots();
    var paused = false;
    if (!reduce) setInterval(function () { if (!paused && !document.hidden) go(current() + 1); }, 5600);
    ["pointerenter", "focusin", "touchstart"].forEach(function (ev) { c.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["pointerleave", "focusout"].forEach(function (ev) { c.addEventListener(ev, function () { paused = false; }); });
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; track.classList.remove("dragging"); go(current()); });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  var lb = document.getElementById("lightbox");
  if (items.length && lb && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), idx = 0;
    var list = items; // only the photos visible under the current gallery filter
    var show = function (i) {
      idx = (i + list.length) % list.length; var it = list[idx];
      lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = "";
      lbImg.src = it.getAttribute("data-full"); lbImg.alt = it.querySelector("img").alt; lbCap.textContent = it.getAttribute("data-caption") || "";
    };
    items.forEach(function (it) {
      it.addEventListener("click", function () {
        list = items.filter(function (x) { return !x.hidden; });
        show(list.indexOf(it)); lb.showModal();
      });
    });
    var single = items.length < 2;
    lb.querySelector(".lb-prev").hidden = single; lb.querySelector(".lb-next").hidden = single;
    lb.querySelector(".lb-close").addEventListener("click", function () { lb.close(); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(idx - 1); });
    lb.querySelector(".lb-next").addEventListener("click", function () { show(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (e) { if (e.key === "ArrowRight") show(idx + 1); if (e.key === "ArrowLeft") show(idx - 1); });
    var tx = null;
    lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); tx = null; });
  } else {
    items.forEach(function (it) { it.addEventListener("click", function () { window.open(it.getAttribute("data-full"), "_blank", "noopener"); }); });
  }

  /* ---------- Quote form ----------
     Validates; POSTs to data-endpoint (e.g. Formspree) when set, otherwise builds a pre-filled SMS
     to the shop's phone (with a copy option on desktop). Never claims an appointment is confirmed. */
  var form = document.getElementById("quote-form");
  if (form) {
    var params = new URLSearchParams(window.location.search), pre = params.get("service");
    if (pre) { var box = form.querySelector('input[name="service"][value="' + pre.replace(/"/g, "") + '"]'); if (box) box.checked = true; }
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
       [f.vehicle, f.vehicle.value.trim().length >= 2 ? "" : "Tell us what needs cleaning."]
      ].forEach(function (p) { setErr(p[0], p[1]); if (p[1]) { ok = false; if (!first) first = p[0]; } });
      var set = form.querySelector("fieldset[data-required]"), any = form.querySelectorAll('input[name="service"]:checked').length > 0;
      if (set) { set.classList.toggle("invalid", !any); if (!any) { ok = false; if (!first) first = set.querySelector("input"); } }
      if (first) first.focus();
      return ok;
    };
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () { var w = el.closest(".field"); if (w && w.classList.contains("invalid") && el.type !== "checkbox") { w.classList.remove("invalid"); el.setAttribute("aria-invalid", "false"); } });
      if (el.type === "checkbox") el.addEventListener("change", function () { var s = el.closest("fieldset"); if (s && form.querySelectorAll('input[name="service"]:checked').length) s.classList.remove("invalid"); });
    });
    var buildMessage = function () {
      var f = form.elements, services = Array.prototype.map.call(form.querySelectorAll('input[name="service"]:checked'), function (c) { return c.value; });
      var lines = ["Quote request from the Alaniz Detailing website", "Name: " + f.name.value.trim(), "Phone: " + f.phone.value.trim(),
        "Job: " + f.vehicle.value.trim() + (f.vtype.value ? " (" + f.vtype.value + ")" : ""), "Needs: " + services.join(", ")];
      if (f.location.value.trim()) lines.push("Location: " + f.location.value.trim());
      if (f.date.value) lines.push("Preferred day: " + f.date.value);
      if (f.notes.value.trim()) lines.push("Notes: " + f.notes.value.trim());
      return lines.join("\n");
    };
    var result = document.getElementById("quote-result"), isTouch = window.matchMedia("(pointer: coarse)").matches;
    var showSms = function (msg, intro) {
      var sep = /iPhone|iPad|iPod/.test(navigator.userAgent) ? "&" : "?", smsHref = "sms:" + PHONE_E164 + sep + "body=" + encodeURIComponent(msg);
      result.innerHTML = "<h3>Your request is ready to send.</h3><p>" + (intro || (isTouch ? "Your messages app should open with everything filled in — just hit send." : "Text this to " + PHONE_DISPLAY + " from your phone, or copy it below.")) + "</p><pre></pre>" +
        '<div class="btn-row"><a class="btn btn-primary btn-sm" href="' + smsHref + '">Text this request</a><button type="button" class="btn btn-glass btn-sm" data-copy>Copy message</button><a class="btn btn-glass btn-sm" href="tel:' + PHONE_E164 + '">Call instead</a></div>' +
        '<p class="form-note" style="margin-top:14px;text-align:left">This is a request, not a confirmed booking. ' + BIZ + " will reply to confirm price and timing.</p>";
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
            result.innerHTML = '<h3>Request sent.</h3><p style="margin:0">Thanks! We’ll reach out to confirm price and timing. This is a request, not a confirmed booking. Need it sooner? Call <a href="tel:' + PHONE_E164 + '">' + PHONE_DISPLAY + "</a>.</p>";
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
