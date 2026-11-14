/* Khan Auto Detailing — v2 interactions (vanilla JS, no dependencies) */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.remove("no-js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var PHONE_E164 = "+18328772459", PHONE_DISPLAY = "(832) 877-2459";

  requestAnimationFrame(function () { setTimeout(function () { root.classList.add("loaded"); }, 60); });

  /* ---------- Cinematic background stage ---------- */
  var stage = document.querySelector(".bg-stage");
  var slides = stage ? Array.prototype.slice.call(stage.querySelectorAll(".bg-slide")) : [];
  var bgW = window.innerWidth <= 760 ? 1000 : (window.innerWidth <= 1400 ? 1700 : 2200);
  function loadSlide(s) {
    if (!s || s.dataset.loaded) return;
    if (s.dataset.inline && bgW <= 1000) { s.dataset.loaded = "1"; return; } // already in the HTML at phone size
    var src = s.getAttribute("data-src");
    if (!src) return;
    var url = src + (src.indexOf("?") > -1 ? "&" : "?") + "auto=format&fit=crop&q=72&w=" + bgW;
    var img = new Image();
    img.onload = function () { s.style.backgroundImage = 'url("' + url + '")'; };
    img.src = url;
    s.dataset.loaded = "1";
  }
  function activate(key) {
    slides.forEach(function (s) {
      var on = s.getAttribute("data-key") === key;
      if (on) loadSlide(s);
      s.classList.toggle("on", on);
    });
  }
  if (slides.length) {
    loadSlide(slides[0]);
    // warm the rest when the browser is idle
    (window.requestIdleCallback || function (f) { setTimeout(f, 1500); })(function () { slides.forEach(loadSlide); });
    var bgSections = document.querySelectorAll("[data-bg]");
    if ("IntersectionObserver" in window) {
      var bgIO = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) activate(en.target.getAttribute("data-bg")); });
      }, { rootMargin: "-45% 0px -45% 0px" });
      bgSections.forEach(function (s) { bgIO.observe(s); });
    }
  }

  /* ---------- Scroll: header, progress, mobile bar, parallax ---------- */
  var header = document.querySelector(".site-header");
  var bar = document.querySelector(".mobile-bar");
  var progress = document.querySelector(".progress");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (header) header.classList.toggle("is-solid", y > 30);
    if (bar) bar.classList.toggle("show", y > window.innerHeight * 0.7);
    if (progress) progress.style.transform = "scaleX(" + (y / max).toFixed(4) + ")";
    if (!reduce && slides.length) {
      var shift = ((y / max) - 0.5) * 10; // vh, stays within the slide's 8% overscan
      for (var i = 0; i < slides.length; i++) slides[i].style.transform = "translate3d(0," + shift.toFixed(2) + "vh,0) scale(1.08)";
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
    document.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { setNav(false); }); });
  }

  /* ---------- Reveal + counters + rating bars ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count")), dec = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var revealEls = document.querySelectorAll(".reveal, .clip-reveal, .media-frame, [data-count], .bar .fill");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add("in");
        if (el.hasAttribute("data-count")) countUp(el);
        if (el.classList.contains("fill")) el.style.width = el.getAttribute("data-w");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); if (el.classList.contains("fill")) el.style.width = el.getAttribute("data-w"); });
  }

  /* ---------- Hero word rotator ---------- */
  document.querySelectorAll(".rotator").forEach(function (r) {
    var words = r.querySelectorAll("span"); if (words.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      var cur = words[i]; i = (i + 1) % words.length; var nxt = words[i];
      cur.classList.remove("on"); cur.classList.add("out");
      nxt.classList.remove("out"); nxt.classList.add("on");
      setTimeout(function () { cur.classList.remove("out"); }, 700);
    }, 2600);
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
        el.style.transform = "perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" + (px * 6).toFixed(2) + "deg) translateY(-4px)";
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

  /* ---------- Water-bead canvas (hero ambience) ---------- */
  var cv = document.querySelector("canvas.beads");
  if (cv && !reduce && cv.getContext) {
    var ctx = cv.getContext("2d"), beads = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true, mx = -999, my = -999;
    function size() {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(46, W / 28)); beads = [];
      for (var k = 0; k < n; k++) beads.push({ x: Math.random() * W, y: Math.random() * H, r: 2 + Math.pow(Math.random(), 2.2) * 16, vy: -(0.08 + Math.random() * 0.25), vx: (Math.random() - 0.5) * 0.12, a: 0.25 + Math.random() * 0.5 });
    }
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var k = 0; k < beads.length; k++) {
        var b = beads[k];
        var dx = b.x - mx, dy = b.y - my, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { b.x += dx / d * 0.8; b.y += dy / d * 0.8; }
        b.x += b.vx; b.y += b.vy;
        if (b.y < -30) { b.y = H + 30; b.x = Math.random() * W; }
        if (b.x < -30) b.x = W + 30; if (b.x > W + 30) b.x = -30;
        var g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.1, b.x, b.y, b.r);
        g.addColorStop(0, "rgba(255,255,255," + (0.85 * b.a) + ")");
        g.addColorStop(0.35, "rgba(160,225,255," + (0.22 * b.a) + ")");
        g.addColorStop(0.85, "rgba(61,220,255," + (0.10 * b.a) + ")");
        g.addColorStop(1, "rgba(61,220,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(200,240,255," + (0.25 * b.a) + ")"; ctx.lineWidth = 0.8; ctx.stroke();
      }
      requestAnimationFrame(draw);
    }
    size(); window.addEventListener("resize", size);
    cv.parentElement.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    cv.parentElement.addEventListener("pointerleave", function () { mx = my = -999; });
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
    function perView() { return Math.max(1, Math.round(track.clientWidth / cards[0].getBoundingClientRect().width)); }
    function pages() { return Math.max(1, cards.length - perView() + 1); }
    function current() { var w = cards[0].getBoundingClientRect().width + 16; return Math.round(track.scrollLeft / w); }
    function go(i) { var n = pages(); i = (i + n) % n; track.scrollTo({ left: i * (cards[0].getBoundingClientRect().width + 16), behavior: reduce ? "auto" : "smooth" }); }
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
    // autoplay
    var paused = false, timer;
    if (!reduce) timer = setInterval(function () { if (!paused && !document.hidden) go(current() + 1); }, 5200);
    ["pointerenter", "focusin", "touchstart"].forEach(function (ev) { c.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    ["pointerleave", "focusout"].forEach(function (ev) { c.addEventListener(ev, function () { paused = false; }); });
    // mouse drag
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; track.classList.add("dragging"); });
    window.addEventListener("pointermove", function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; track.scrollLeft = sl - dx; });
    window.addEventListener("pointerup", function () { if (!down) return; down = false; track.classList.remove("dragging"); go(current()); });
    track.addEventListener("click", function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Gallery filters ---------- */
  var filterBtns = document.querySelectorAll("[data-filter]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cat = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { var on = b === btn; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on ? "true" : "false"); });
      document.querySelectorAll(".masonry [data-cat]").forEach(function (it) {
        var show = cat === "all" || it.getAttribute("data-cat") === cat;
        it.classList.toggle("is-hidden", !show);
        it.classList.add("in");
        if (show && !reduce) { it.classList.remove("pop"); void it.offsetWidth; it.classList.add("pop"); }
      });
    });
  });

  /* ---------- Lightbox (steps through visible photos only) ---------- */
  var allItems = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]")), items = allItems;
  var lb = document.getElementById("lightbox");
  if (allItems.length && lb && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img"), lbCap = lb.querySelector("figcaption"), idx = 0;
    var show = function (i) {
      idx = (i + items.length) % items.length; var it = items[idx];
      lbImg.style.animation = "none"; void lbImg.offsetWidth; lbImg.style.animation = "";
      lbImg.src = it.getAttribute("data-full"); lbImg.alt = it.querySelector("img").alt; lbCap.textContent = it.getAttribute("data-caption") || "";
    };
    allItems.forEach(function (it) {
      it.addEventListener("click", function () {
        items = allItems.filter(function (x) { return !x.classList.contains("is-hidden"); });
        show(items.indexOf(it)); lb.showModal();
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
    items.forEach(function (it) { it.addEventListener("click", function () { window.open(it.getAttribute("data-full"), "_blank", "noopener"); }); });
  }

  /* ---------- Quote form ----------
     Validates; POSTs to data-endpoint (e.g. Formspree) when set, otherwise builds a pre-filled SMS
     to the business phone. Never claims an appointment is confirmed. */
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
       [f.vehicle, f.vehicle.value.trim().length >= 2 ? "" : "Tell us the year, make and model."]
      ].forEach(function (p) { setErr(p[0], p[1]); if (p[1]) { ok = false; if (!first) first = p[0]; } });
      var set = form.querySelector("fieldset[data-required]"), any = form.querySelectorAll('input[name="service"]:checked').length > 0;
      if (set) { set.classList.toggle("invalid", !any); if (!any) { ok = false; if (!first) first = set.querySelector("input"); } }
      if (first) first.focus();
      return ok;
    };
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () { var w = el.closest(".field"); if (w && w.classList.contains("invalid")) { w.classList.remove("invalid"); el.setAttribute("aria-invalid", "false"); } });
    });
    var buildMessage = function () {
      var f = form.elements, services = Array.prototype.map.call(form.querySelectorAll('input[name="service"]:checked'), function (c) { return c.value; });
      var lines = ["Quote request — via website", "Name: " + f.name.value.trim(), "Phone: " + f.phone.value.trim(),
        "Vehicle: " + f.vehicle.value.trim() + (f.vtype.value ? " (" + f.vtype.value + ")" : ""), "Service: " + services.join(", ")];
      if (f.zip.value.trim()) lines.push("Location/ZIP: " + f.zip.value.trim());
      if (f.date.value) lines.push("Preferred date: " + f.date.value);
      if (f.notes.value.trim()) lines.push("Notes: " + f.notes.value.trim());
      return lines.join("\n");
    };
    var result = document.getElementById("quote-result"), isTouch = window.matchMedia("(pointer: coarse)").matches;
    var showSms = function (msg, intro) {
      var sep = /iPhone|iPad|iPod/.test(navigator.userAgent) ? "&" : "?", smsHref = "sms:" + PHONE_E164 + sep + "body=" + encodeURIComponent(msg);
      result.innerHTML = "<h3>Your request is ready to send.</h3><p>" + (intro || (isTouch ? "Tap below to open your messages app with everything filled in." : "Text this to " + PHONE_DISPLAY + ", or copy it and send it from your phone.")) + "</p><pre></pre>" +
        '<div class="btn-row"><a class="btn btn-primary" href="' + smsHref + '">Text this request</a><button type="button" class="btn btn-glass" data-copy>Copy message</button><a class="btn btn-glass" href="tel:' + PHONE_E164 + '">Call instead</a></div>' +
        '<p class="form-note" style="margin-top:14px">Appointments are confirmed directly by Khan — nothing is booked until you hear back.</p>';
      result.querySelector("pre").textContent = msg; result.classList.add("show");
      result.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
      var copyBtn = result.querySelector("[data-copy]");
      copyBtn.addEventListener("click", function () {
        var done = function () { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy message"; }, 2000); };
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
            result.innerHTML = '<h3>Request sent.</h3><p class="mb-0">Thanks — Khan will reach out by phone to confirm pricing and a time. This is a request, not a confirmed booking. Need it sooner? Call <a href="tel:' + PHONE_E164 + '">' + PHONE_DISPLAY + "</a>.</p>";
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
