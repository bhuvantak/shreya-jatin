/* =====================================================================
   Shreya & Jatin — Wedding Invitation
   Vanilla JavaScript, no dependencies. Reads everything from
   window.WEDDING_CONFIG (js/config.js).

   Modules (each is self-contained and fails quietly):
     1. Helpers            6. Scratch card
     2. Config binding     7. Countdown
     3. Music              8. Functions (render + stacking)
     4. Opening gate       9. Venue
     5. Navigation         11. Heading reveals
                           12. Motion layer (sparkles, garlands, letters)
   ===================================================================== */
(function () {
  "use strict";

  var CFG = window.WEDDING_CONFIG || {};
  var COUPLE = CFG.couple || {};
  var MEDIA = CFG.media || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  // "2026-12-03" -> Date at noon UTC (safe from time-zone day shifts)
  function parseDay(iso) {
    var p = iso.split("-").map(Number);
    return new Date(Date.UTC(p[0], p[1] - 1, p[2], 12));
  }
  var fmt = {
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "UTC" }),
    month: new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }),
    full: new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
  };
  // en-GB gives "Thursday 3 December 2026"; add the comma after the weekday
  function fullDate(d) { return fmt.full.format(d).replace(/^(\w+)\s/, "$1, "); }

  /* ---------- 2. Bind names / hashtag from config ---------- */
  $all("[data-bind]").forEach(function (n) {
    var key = n.getAttribute("data-bind");
    if (COUPLE[key]) n.textContent = COUPLE[key];
  });

  // Optional portraits replace the monogram frames
  $all("[data-photo]").forEach(function (frame) {
    var src = COUPLE[frame.getAttribute("data-photo") + "Photo"];
    if (!src) return;
    var img = new Image();
    img.alt = frame.getAttribute("data-photo") === "bride" ? COUPLE.bride : COUPLE.groom;
    img.loading = "lazy";
    img.decoding = "async";
    img.onload = function () {
      frame.appendChild(img);
      var mono = $(".person__mono", frame);
      if (mono) mono.hidden = true;
    };
    img.src = src;
  });

  /* ---------- 2b. Artwork from config.images ----------
     Each image becomes a CSS variable plus a body class, so the stylesheet
     can switch from line drawings to artwork only when a path is set. */
  var IMG = CFG.images || {};
  (function applyArt() {
    var root = document.documentElement.style;
    // absolute URLs, because CSS resolves url() in variables relative to the stylesheet
    function abs(path) { try { return new URL(path, document.baseURI).href; } catch (e) { return path; } }
    var map = {
      gateDoor: ["--img-door", "has-door-img"],
      heroMobile: ["--img-hero-m", "has-hero-img"],
      heroDesktop: ["--img-hero-d", "has-hero-img"],
      garland: ["--img-garland", "has-garland-img"],
      corner: ["--img-corner", "has-corner-img"],
      paper: ["--img-paper", "has-paper"]
    };
    Object.keys(map).forEach(function (k) {
      if (!IMG[k]) return;
      root.setProperty(map[k][0], 'url("' + abs(IMG[k]) + '")');
      document.body.classList.add(map[k][1]);
    });
    // desktop hero falls back to the mobile image and vice versa
    if (IMG.heroMobile && !IMG.heroDesktop) root.setProperty("--img-hero-d", 'url("' + abs(IMG.heroMobile) + '")');
    if (IMG.heroDesktop && !IMG.heroMobile) root.setProperty("--img-hero-m", 'url("' + abs(IMG.heroDesktop) + '")');

    // illustrated couple, unless individual portraits were supplied
    var artHost = $("#couple-art");
    if (artHost && IMG.couple && !(COUPLE.bridePhoto || COUPLE.groomPhoto)) {
      var img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.loading = "lazy";
      img.width = 900; img.height = 1125;
      img.onload = function () { $("#story").classList.add("has-couple-art"); };
      img.onerror = function () { artHost.remove(); };
      img.src = IMG.couple;
      artHost.appendChild(img);
      $("#story").classList.add("has-couple-art");
    }

    // venue illustration replaces the line-drawn haveli
    var venueArt = $("#venue-art");
    if (venueArt && IMG.venue) {
      var v = new Image();
      v.alt = "";
      v.className = "venue__img";
      v.loading = "lazy";
      v.decoding = "async";
      v.width = 1000; v.height = 667;
      v.onerror = function () { v.replaceWith(venueArt); };
      v.src = IMG.venue;
      venueArt.replaceWith(v);
    }
  })();

  /* ---------- 3. Music ----------
     Created only after the guest taps, so browsers allow playback.
     If the file is missing, the toggle simply never appears. */
  var music = (function () {
    var btn = $("#music-toggle");
    var label = $(".music__label", btn);
    var audio = null;
    var available = true;
    var wantsPlay = false;      // guest's own choice

    function render(playing) {
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      label.textContent = playing ? "Music on" : "Music off";
    }
    function ensure() {
      if (audio || !MEDIA.music) return audio;
      audio = new Audio();
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.55;
      audio.addEventListener("error", function () {
        available = false;
        btn.hidden = true;
      });
      audio.addEventListener("play", function () { render(true); });
      audio.addEventListener("pause", function () { render(false); });
      audio.src = MEDIA.music;
      return audio;
    }
    function play() {
      if (!ensure() || !available) return;
      wantsPlay = true;
      var p = audio.play();
      if (p && p.catch) p.catch(function () { render(false); });
    }
    function pause(byUser) {
      if (byUser) wantsPlay = false;
      if (audio) audio.pause();
    }

    btn.addEventListener("click", function () {
      if (audio && !audio.paused) pause(true); else play();
    });

    // Never play into a hidden tab; resume only if the guest had it on
    document.addEventListener("visibilitychange", function () {
      if (!audio) return;
      if (document.hidden) audio.pause();
      else if (wantsPlay) audio.play().catch(function () {});
    });

    return {
      reveal: function () { if (MEDIA.music && available) btn.hidden = false; },
      play: play
    };
  })();

  /* ---------- 4. Opening gate ---------- */
  (function gate() {
    var gateEl = $("#gate");
    var openBtn = $("#gate-open");
    var musicBox = $("#gate-music");
    if (!gateEl || !openBtn) return;

    if (!MEDIA.music) musicBox.closest("label").hidden = true;

    function open() {
      openBtn.disabled = true;
      if (musicBox.checked) music.play();   // inside the click = allowed by browsers
      gateEl.classList.add("is-opening");
      document.body.classList.add("site-open");
      var wait = reduceMotion ? 50 : 2300;
      setTimeout(function () {
        gateEl.classList.add("is-open");
        gateEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-gated");
        music.reveal();
        var title = $("#hero-title");
        title.setAttribute("tabindex", "-1");
        title.focus({ preventScroll: true });
      }, wait);
          }
    openBtn.addEventListener("click", open);
    // tapping the doors themselves (or the empty space around the panel) also opens
    $all(".gate__door").forEach(function (d) { d.addEventListener("click", function () { if (!openBtn.disabled) openBtn.click(); }); });
    var scrollLayer = $("#gate-scroll");
    if (scrollLayer) scrollLayer.addEventListener("click", function (e) { if (e.target === scrollLayer && !openBtn.disabled) openBtn.click(); });

    // Arriving via a link like …/#venue: still show the gate, then go there.
    if (location.hash && location.hash.length > 1) {
      var target = location.hash;
      openBtn.addEventListener("click", function () {
        setTimeout(function () {
          var t = document.querySelector(target);
          if (t) t.scrollIntoView();
        }, reduceMotion ? 60 : 2400);
      });
    }
  })();

  /* ---------- 5. Navigation: hides while scrolling down, returns on scroll up; current-section underline ---------- */
  (function nav() {
    var navEl = $("#nav");
    var links = $all("#nav-links a");
    var ticking = false;
    var hideOn = CFG.navHideOn || "down";
    var lastY = window.scrollY, travel = 0;
    function onScroll() {
      var y = window.scrollY;
      navEl.classList.toggle("is-solid", y > 40);
      var dy = y - lastY;
      // only react to deliberate scrolling, not tiny jitters
      travel = (dy > 0) === (travel > 0) ? travel + dy : dy;
      if (y < 80 || hideOn === "never") navEl.classList.remove("is-hidden");
      else if (Math.abs(travel) > 12) {
        var goingDown = travel > 0;
        navEl.classList.toggle("is-hidden", hideOn === "down" ? goingDown : !goingDown);
      }
      lastY = y;
      ticking = false;
    }
    // keyboard users always get the bar back
    navEl.addEventListener("focusin", function () { navEl.classList.remove("is-hidden"); });
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (!("IntersectionObserver" in window)) return;
    var map = { story: "#story", functions: "#functions", venue: "#venue" };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var href = map[en.target.id];
        links.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === href); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "story", "save-the-date", "countdown", "functions", "venue"].forEach(function (id) {
      var n = document.getElementById(id); if (n) io.observe(n);
    });
    // sections without a tab clear the underline
    var clear = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) links.forEach(function (a) { a.classList.remove("is-active"); }); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "save-the-date", "countdown"].forEach(function (id) { var n = document.getElementById(id); if (n) clear.observe(n); });
  })();

  /* ---------- 6. Scratch card ---------- */
  (function scratch() {
    var wrap = $("#scratch");
    var canvas = $("#scratch-canvas");
    var resetBtn = $("#scratch-reset");
    var live = $("#scratch-live");
    if (!wrap || !canvas || !canvas.getContext) return;

    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    var foil = null;
    if (IMG.foil) {
      foil = new Image();
      foil.onload = function () { if (!revealed) paint(); };
      foil.src = IMG.foil;
    }
    var revealed = false, drawing = false, last = null, moves = 0, dpr = 1;

    function paint() {
      var r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      var w = r.width, h = r.height;

      if (foil && foil.complete && foil.naturalWidth) {
        // artwork foil, drawn to cover the card
        var sc = Math.max(w / foil.naturalWidth, h / foil.naturalHeight);
        var fw = foil.naturalWidth * sc, fh = foil.naturalHeight * sc;
        ctx.drawImage(foil, (w - fw) / 2, (h - fh) / 2, fw, fh);
        var shade = ctx.createLinearGradient(0, h * 0.55, 0, h);
        shade.addColorStop(0, "rgba(90,16,34,0)");
        shade.addColorStop(1, "rgba(90,16,34,.35)");
        ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#FBF6EE";
        ctx.shadowColor = "rgba(58,9,20,.6)"; ctx.shadowBlur = 8;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.font = "italic 400 " + Math.round(w * 0.1) + "px 'Bodoni Moda', Georgia, serif";
        ctx.fillText("Our wedding day", w / 2, h * 0.80);
        ctx.font = "400 " + Math.round(w * 0.046) + "px Jost, sans-serif";
        ctx.fillText("Scratch here with your finger", w / 2, h * 0.89);
        ctx.shadowBlur = 0;
        return;
      }

      // brushed antique-gold foil
      var g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#9C7A45");
      g.addColorStop(0.35, "#D9BF8C");
      g.addColorStop(0.55, "#B8955D");
      g.addColorStop(0.8, "#E6CF9F");
      g.addColorStop(1, "#9C7A45");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 0.12;
      ctx.strokeStyle = "#5A1022";
      for (var y = 0; y < h; y += 3) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (Math.random() * 2 - 1)); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // inset frame + instruction
      ctx.strokeStyle = "rgba(90,16,34,.45)";
      ctx.lineWidth = 1;
      ctx.strokeRect(14, 14, w - 28, h - 28);
      ctx.fillStyle = "#5A1022";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "italic 400 " + Math.round(w * 0.11) + "px 'Bodoni Moda', Georgia, serif";
      ctx.fillText("Our wedding day", w / 2, h / 2 - w * 0.06);
      ctx.font = "400 " + Math.round(w * 0.048) + "px Jost, sans-serif";
      ctx.fillText("Scratch here with your finger", w / 2, h / 2 + w * 0.08);
    }

    function point(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    function stroke(a, b) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(34, canvas.width / dpr * 0.12);
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    function cleared() {
      var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      var clear = 0, total = 0;
      for (var i = 3; i < data.length; i += 4 * 24) { total++; if (data[i] < 40) clear++; }
      return clear / total;
    }
    function reveal() {
      if (revealed) return;
      revealed = true;
      wrap.classList.add("is-revealed");
      live.textContent = "Revealed: Friday, 4 December 2026.";
      if (!reduceMotion) petals();
    }
    function petals() {
      var colors = ["#B08D57", "#D9BF8C", "#7A2236", "#F2D58E"];
      for (var i = 0; i < 22; i++) {
        var p = el("span", "petal");
        p.style.left = Math.random() * 100 + "%";
        p.style.background = colors[i % colors.length];
        p.style.setProperty("--dx", (Math.random() * 80 - 40) + "px");
        p.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
        p.style.animationDelay = Math.random() * 0.6 + "s";
        wrap.appendChild(p);
        setTimeout(function (n) { n.remove(); }.bind(null, p), 5000);
      }
    }

    canvas.addEventListener("pointerdown", function (e) {
      if (revealed) return;
      drawing = true; last = point(e);
      canvas.setPointerCapture(e.pointerId);
      stroke(last, { x: last.x + 0.1, y: last.y + 0.1 });
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      var p = point(e); stroke(last, p); last = p;
      if (++moves % 8 === 0 && cleared() > 0.5) reveal();
    });
    function end() {
      if (!drawing) return;
      drawing = false;
      if (cleared() > 0.5) reveal();
    }
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    // keyboard / screen-reader users can reveal with Enter or Space
    canvas.tabIndex = 0;
    canvas.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); }
    });

    resetBtn.addEventListener("click", function () {
      revealed = false; moves = 0;
      wrap.classList.remove("is-revealed");
      live.textContent = "";
      paint();
    });

    var rw = 0;
    window.addEventListener("resize", function () {
      var w = wrap.clientWidth;
      if (w !== rw && !revealed) { rw = w; paint(); }
    });
    rw = wrap.clientWidth;
    paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!revealed) paint(); });
  })();

  /* ---------- 7. Countdown ---------- */
  (function countdown() {
    var target = new Date(CFG.countdownTarget || "2026-12-04T00:00:00+05:30").getTime();
    if (isNaN(target)) return;
    var grid = $("#countdown-grid");
    var done = $("#countdown-done");
    var cells = {};
    $all("[data-unit]", grid).forEach(function (n) { cells[n.getAttribute("data-unit")] = n; });
    var DAY = 86400000, timer;
    var names = (COUPLE.bride || "Shreya") + " and " + (COUPLE.groom || "Jatin");

    function set(unit, v) {
      var n = cells[unit], t = pad(v);
      if (n.textContent === t) return;
      n.textContent = t;
      if (reduceMotion) return;
      n.classList.remove("tick"); void n.offsetWidth; n.classList.add("tick");
    }
    function tick() {
      var diff = target - Date.now();
      if (diff <= 0) {
        grid.hidden = true;
        done.hidden = false;
        done.textContent = diff > -DAY
          ? "Today is the day. " + names + " are getting married."
          : names + " are married. Thank you for celebrating with us.";
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      set("days", Math.floor(s / 86400));
      set("hours", Math.floor((s % 86400) / 3600));
      set("minutes", Math.floor((s % 3600) / 60));
      set("seconds", s % 60);
    }
    tick();
    timer = setInterval(tick, 1000);
  })();

  /* ---------- 8. Functions: render grouped by date, then stack on scroll ---------- */
  (function functions() {
    var host = $("#days");
    var list = CFG.functions || [];
    if (!host || !list.length) return;

    // group by date, keeping config order
    var groups = [];
    list.forEach(function (f, idx) {
      var g = groups[groups.length - 1];
      if (!g || g.date !== f.date) { g = { date: f.date, items: [] }; groups.push(g); }
      g.items.push({ f: f, seq: idx + 1 });
    });

    var lede = $("#functions-lede");
    if (lede) lede.textContent = numberWord(list.length) + " ceremonies across " + numberWord(groups.length).toLowerCase() + " days. Scroll to move through them in order.";

    groups.forEach(function (g, gi) {
      var d = parseDay(g.date);
      var day = el("article", "day day--" + Math.min(gi + 1, 4));
      day.setAttribute("aria-label", fullDate(d));

      var head = el("header", "day__head");
      head.appendChild(el("span", "day__num", pad(d.getUTCDate())));
      var info = el("div", "day__info");
      info.appendChild(el("span", "day__weekday", fmt.weekday.format(d)));
      info.appendChild(el("span", "day__month", fmt.month.format(d) + " " + d.getUTCFullYear()));
      info.appendChild(el("span", "day__count", "Day " + (gi + 1) + " of " + groups.length + ", " + g.items.length + (g.items.length === 1 ? " ceremony" : " ceremonies")));
      head.appendChild(info);
      day.appendChild(head);

      var stack = el("div", "stack");
      g.items.forEach(function (it, i) {
        var f = it.f;
        // sanity check: configured weekday must match the calendar
        var realDay = fmt.weekday.format(d);
        if (f.day && f.day !== realDay) console.warn("Config: " + f.name + " says " + f.day + " but " + f.date + " is a " + realDay + ".");

        var card = el("div", "fn-card");
        card.setAttribute("role", "group");
        card.style.setProperty("--i", i);
        card.setAttribute("aria-label", f.name);

        var motif = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        motif.setAttribute("class", "fn-card__motif");
        motif.setAttribute("aria-hidden", "true");
        var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", "#m-" + (f.motif || "thali"));
        motif.appendChild(use);
        if (f.image) {
          var pic = new Image();
          pic.alt = "";
          pic.className = "fn-card__img" + (f.framed ? " fn-card__img--framed" : "");
          pic.loading = "lazy";
          pic.decoding = "async";
          pic.onerror = (function (p, m, c) { return function () { p.replaceWith(m); c.classList.remove("has-img"); }; })(pic, motif, card);
          pic.src = f.image;
          card.classList.add("has-img");
          if (f.framed) card.classList.add("has-framed");
          card.appendChild(pic);
        } else {
          card.appendChild(motif);
        }

        card.appendChild(el("span", "fn-card__seq", "Ceremony " + it.seq + " of " + list.length));
        card.appendChild(el("h3", "fn-card__name", f.name));

        var dl = el("dl", "fn-card__meta");
        function row(k, v) {
          var r = el("div", "fn-card__row");
          r.appendChild(el("dt", null, k));
          r.appendChild(el("dd", null, v));
          dl.appendChild(r);
        }
        row("Date", (f.day || realDay) + ", " + d.getUTCDate() + " " + fmt.month.format(d) + " " + d.getUTCFullYear());
        row("Time", f.time);
        if (f.location) row("Location", f.location);
        card.appendChild(dl);
        stack.appendChild(card);
      });
      day.appendChild(stack);
      host.appendChild(day);
    });

    // Stacking: as the next card slides over, the one beneath settles back
    if (reduceMotion) return;
    var stacks = $all(".stack", host).map(function (s) { return $all(".fn-card", s); });
    var queued = false;
    function update() {
      queued = false;
      stacks.forEach(function (cards) {
        for (var i = 0; i < cards.length - 1; i++) {
          var a = cards[i].getBoundingClientRect();
          var b = cards[i + 1].getBoundingClientRect();
          var overlap = Math.max(0, Math.min(1, (a.bottom - b.top) / a.height));
          cards[i].style.scale = overlap ? (1 - overlap * 0.06).toFixed(4) : "";
          cards[i].style.filter = overlap ? "brightness(" + (1 - overlap * 0.12).toFixed(3) + ")" : "";
        }
      });
    }
    window.addEventListener("scroll", function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();

    function numberWord(n) {
      return ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"][n] || String(n);
    }
  })();

  /* ---------- 9. Venue ---------- */
  (function venue() {
    var host = $("#venue-body");
    if (!host) return;
    var v = CFG.venue || {};

    if (v.name || v.address) {
      if (v.name) host.appendChild(el("p", "venue__name", v.name));
      if (v.address) host.appendChild(el("address", "venue__address", v.address));
      if (v.note) host.appendChild(el("p", "venue__note", v.note));
    } else {
      host.appendChild(el("p", "venue__pending", "The wedding venue and address will be shared here soon."));
    }

    // Where the earlier ceremonies take place, straight from the functions list
    var places = {};
    (CFG.functions || []).forEach(function (f) {
      if (!f.location) return;
      (places[f.location] = places[f.location] || []).push(f.name);
    });
    var keys = Object.keys(places);
    if (keys.length) {
      var ul = el("ul", "venue__places");
      keys.forEach(function (k) {
        var li = el("li");
        li.appendChild(el("strong", null, k));
        li.appendChild(el("span", null, places[k].join(", ")));
        ul.appendChild(li);
      });
      host.appendChild(ul);
    }

    var href = v.mapsUrl || (v.address ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((v.name ? v.name + ", " : "") + v.address) : "");
    if (href) {
      var a = el("a", "btn btn--solid", "Get directions in Google Maps");
      a.href = href; a.target = "_blank"; a.rel = "noopener";
      host.appendChild(a);
    }
  })();



  /* ---------- 11. Heading and footer reveals ---------- */
  (function reveals() {
    var targets = $all(".section-title, #footer-ornament");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    targets.forEach(function (t) { io.observe(t); });
  })();
  /* ---------- 12. Motion layer: sparkles, garlands, letters, scroll reveals ---------- */

  // 12a. Gold dust and falling marigold petals on a canvas. Pauses off-screen.
  function particles(canvas, opts) {
    if (!canvas || reduceMotion || !canvas.getContext) return { burst: function () {} };
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var parts = [], running = false, visible = true, raf = 0;
    var petalColors = ["#F7A81B", "#F2C14E", "#E2711D", "#9E2A3F", "#D9BF8C"];

    function size() {
      var r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function dust(fresh) {
      return { k: 0, x: Math.random() * W, y: fresh ? H + 10 : Math.random() * H, r: .6 + Math.random() * 1.8,
        vy: -(.12 + Math.random() * .35), vx: (Math.random() - .5) * .15, t: Math.random() * 6.28, tw: .01 + Math.random() * .03 };
    }
    function petal(fresh, burst) {
      return { k: 1, x: burst ? W / 2 + (Math.random() - .5) * W * .3 : Math.random() * W, y: burst ? H * .4 : (fresh ? -20 : Math.random() * H),
        s: 5 + Math.random() * 6, vy: burst ? -2 - Math.random() * 3 : .5 + Math.random() * .8, vx: burst ? (Math.random() - .5) * 7 : (Math.random() - .5) * .4,
        a: Math.random() * 6.28, va: (Math.random() - .5) * .06, sw: Math.random() * 6.28, c: petalColors[(Math.random() * petalColors.length) | 0], g: burst ? .08 : 0, once: !!burst };
    }
    function init() {
      size(); parts = [];
      for (var i = 0; i < (opts.dust || 0); i++) parts.push(dust(false));
      for (var j = 0; j < (opts.petals || 0); j++) parts.push(petal(false));
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = parts.length - 1; i >= 0; i--) {
        var p = parts[i];
        if (p.k === 0) {
          p.x += p.vx; p.y += p.vy; p.t += p.tw;
          var al = .25 + .55 * (0.5 + 0.5 * Math.sin(p.t));
          ctx.beginPath(); ctx.fillStyle = "rgba(240, 214, 160," + al.toFixed(3) + ")";
          ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
          if (p.r > 1.8) { ctx.fillStyle = "rgba(240,214,160," + (al * .15).toFixed(3) + ")"; ctx.arc(p.x, p.y, p.r * 3, 0, 6.283); ctx.fill(); }
          if (p.y < -10) parts[i] = dust(true);
        } else {
          p.sw += .02; p.vy += p.g; if (p.g && p.vy > 1.4) p.g = 0;
          p.x += p.vx + Math.sin(p.sw) * .5; p.y += p.vy; p.a += p.va;
          if (p.once) p.vx *= .985;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
          ctx.fillStyle = p.c; ctx.globalAlpha = .9;
          ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * .55, 0, 0, 6.283); ctx.fill();
          ctx.globalAlpha = .25; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.ellipse(-p.s * .25, -p.s * .1, p.s * .4, p.s * .18, 0, 0, 6.283); ctx.fill();
          ctx.restore();
          if (p.y > H + 20) { if (p.once) parts.splice(i, 1); else parts[i] = petal(true); }
        }
      }
      if (running) raf = requestAnimationFrame(frame);
    }
    function start() { if (!running && visible) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }
    init(); start();
    window.addEventListener("resize", function () { size(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) start(); else stop(); }).observe(canvas);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    return {
      burst: function (n) { for (var i = 0; i < n; i++) parts.push(petal(false, true)); start(); },
      stop: stop
    };
  }
  var gateFx = particles($("#gate-sparkles"), { dust: 46, petals: 12 });
  particles($("#hero-sparkles"), { dust: 34, petals: 0 });
  var gateBtn = $("#gate-open");
  if (gateBtn) gateBtn.addEventListener("click", function () {
    gateFx.burst(60);
    setTimeout(gateFx.stop, 3200);
  });

  // 12b. Marigold garlands hanging at both sides of the hero
  (function garland() {
    var host = $("#garland");
    if (!host) return;
    function build() {
      host.innerHTML = "";
      var w = window.innerWidth;
      var n = w < 480 ? 4 : w < 1024 ? 6 : 8;           // strands per side
      var gap = Math.min(30, w * 0.075);
      var colors = [["#F7A81B", "#C9620B"], ["#FFD34E", "#D99A0B"], ["#E2711D", "#A8450A"]];
      for (var side = 0; side < 2; side++) {
        for (var i = 0; i < n; i++) {
          var strand = el("div", "strand");
          var x = 10 + i * gap;
          strand.style[side ? "right" : "left"] = x + "px";
          var len = Math.round((n - i) * (w < 480 ? 1.6 : 1.8) + 3);   // longest at the edges
          strand.style.setProperty("--sway", (4 + Math.random() * 3).toFixed(2) + "s");
          strand.style.setProperty("--amp", (1.2 + Math.random() * 1.8).toFixed(2) + "deg");
          strand.style.animationDelay = (-Math.random() * 5).toFixed(2) + "s";
          var pal = colors[(i + side) % colors.length];
          for (var b = 0; b < len; b++) {
            var bloom = el("span", b > 0 && b % 5 === 0 ? "bloom bloom--leaf" : "bloom");
            var sizePx = w < 480 ? 12 + (b % 2) * 2 : 15 + (b % 2) * 2;
            bloom.style.setProperty("--b", sizePx + "px");
            bloom.style.setProperty("--c1", pal[0]); bloom.style.setProperty("--c2", pal[1]);
            strand.appendChild(bloom);
          }
          strand.appendChild(el("span", "bloom bloom--bell"));
          host.appendChild(strand);
        }
      }
    }
    build();
    var lastW = window.innerWidth;
    window.addEventListener("resize", function () { if (Math.abs(window.innerWidth - lastW) > 60) { lastW = window.innerWidth; build(); } });
  })();

  // 12c. Hero names arrive letter by letter
  $all(".hero__name, .hero__amp").forEach(function (node, ni) {
    var text = node.textContent;
    node.setAttribute("aria-label", text);
    node.textContent = "";
    text.split("").forEach(function (ch, i) {
      var c = el("span", "char", ch);
      c.setAttribute("aria-hidden", "true");
      c.style.setProperty("--d", ni * 6 + i);
      node.appendChild(c);
    });
  });

  // 12d. Scroll reveals, staggered within each group
  (function scrollReveals() {
    var groups = [
      [".section-lede", "up"], [".person:first-child", "left"], [".person:last-child", "right"], [".couple__amp", "zoom"],
      [".scratch", "zoom"], ["#scratch-reset", "up"], [".countdown__cell", "up"],
      [".day__head", "left"], [".fn-card", "up"], [".venue__body > *", "up"], [".venue__places li", "up"],
      [".footer > p", "up"]
    ];
    var items = [];
    groups.forEach(function (g) {
      $all(g[0]).forEach(function (n, i) {
        if (n.hasAttribute("data-reveal")) return;
        n.setAttribute("data-reveal", g[1]);
        if (/cell|footer|places/.test(g[0])) n.style.setProperty("--delay", (i * 0.12) + "s");
        items.push(n);
      });
    });
    var extra = $all(".fn-card, .venue__art");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.concat(extra).forEach(function (n) { n.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.05 });
    items.concat(extra).forEach(function (n) { io.observe(n); });
  })();
  /* ---------- 13. 3D layer: scroll depth, pointer tilt, flips ---------- */
  (function depth3d() {
    if (reduceMotion) return;

    // headings: split into words so each one flips up in turn
    $all(".section-title").forEach(function (h) {
      var words = h.textContent.trim().split(/\s+/);
      h.setAttribute("aria-label", h.textContent.trim());
      h.textContent = "";
      words.forEach(function (w, i) {
        var span = el("span", "w", w);
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--wi", i);
        h.appendChild(span);
        if (i < words.length - 1) h.appendChild(document.createTextNode(" "));
      });
      h.classList.add("has-words");
    });

    // painting depth: follows the mouse on computers and the phone's tilt on phones
    var heroEl = $("#home");
    function setLean(x, y) {
      if (!heroEl) return;
      heroEl.style.setProperty("--px", x.toFixed(3));
      heroEl.style.setProperty("--py", y.toFixed(3));
    }
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      if (heroEl) heroEl.addEventListener("pointermove", function (e) {
        setLean(e.clientX / window.innerWidth - .5, e.clientY / window.innerHeight - .5);
      });
    } else if ("DeviceOrientationEvent" in window && typeof DeviceOrientationEvent.requestPermission !== "function") {
      // Android shares tilt freely; iPhones need a permission prompt, so they get the scroll depth only
      var base = null;
      window.addEventListener("deviceorientation", function (e) {
        if (e.gamma == null || window.scrollY > window.innerHeight) return;
        if (!base) base = { b: e.beta, g: e.gamma };
        var gx = Math.max(-1, Math.min(1, (e.gamma - base.g) / 25));
        var gy = Math.max(-1, Math.min(1, (e.beta - base.b) / 25));
        setLean(gx * .5, gy * .5);
        var names = $(".hero__names");
        if (names) names.style.transform = "perspective(900px) rotateY(" + (gx * 8).toFixed(2) + "deg) rotateX(" + (-gy * 6).toFixed(2) + "deg)";
      }, { passive: true });
    }
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var vh = window.innerHeight;
    var heroFrame = $(".hero__frame"), hero = $("#home");
    var tracked = [
      // [element, function(progress) -> transform]
      [$(".couple-art"), function (p) { return "perspective(900px) rotateY(" + (p * 16).toFixed(2) + "deg) rotateX(" + (p * -6).toFixed(2) + "deg) translateY(" + (p * -26).toFixed(1) + "px)"; }],
      [$(".venue__img") || $(".venue__art"), function (p) { return "perspective(900px) rotateX(" + (p * 18).toFixed(2) + "deg) translateY(" + (p * -18).toFixed(1) + "px) scale(" + (1 - Math.abs(p) * .06).toFixed(3) + ")"; }],
      [$(".scratch"), function (p) { return "perspective(1000px) rotateX(" + (p * 14).toFixed(2) + "deg)"; }]
    ].filter(function (t) { return t[0]; });
    var queued = false;

    function update() {
      queued = false;
      var y = window.scrollY;
      // hero: as it scrolls away the frame tips back into depth
      if (hero && heroFrame && y < hero.offsetHeight * 1.1) {
        var hp = Math.min(1, y / (hero.offsetHeight * .9));
        heroFrame.style.transform = "perspective(1000px) translateZ(" + (-hp * 160).toFixed(1) + "px) rotateX(" + (hp * 22).toFixed(2) + "deg) translateY(" + (hp * 40).toFixed(1) + "px)";
        heroFrame.style.opacity = (1 - hp * .85).toFixed(3);
        hero.style.setProperty("--hs", hp.toFixed(3));
      }
      tracked.forEach(function (t) {
        var r = t[0].getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = ((r.top + r.height / 2) - vh / 2) / vh;       // -1 (above) .. 1 (below)
        p = Math.max(-1, Math.min(1, p));
        t[0].style.transform = t[1](p);
      });
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", function () { vh = window.innerHeight; queue(); });
    update();

    // pointer tilt on computers: names and function cards lean toward the mouse
    if (finePointer) {
      var names = $(".hero__names");
      if (hero && names) {
        hero.addEventListener("pointermove", function (e) {
          var x = e.clientX / window.innerWidth - .5, yy = e.clientY / window.innerHeight - .5;
          names.style.transform = "perspective(900px) rotateY(" + (x * 12).toFixed(2) + "deg) rotateX(" + (-yy * 10).toFixed(2) + "deg) translateZ(30px)";
        });
        hero.addEventListener("pointerleave", function () { names.style.transform = ""; });
      }
      $all(".fn-card").forEach(function (card) {
        card.addEventListener("pointermove", function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5, yy = (e.clientY - r.top) / r.height - .5;
          card.style.setProperty("--tilt-x", (-yy * 8).toFixed(2) + "deg");
          card.style.setProperty("--tilt-y", (x * 10).toFixed(2) + "deg");
          card.classList.add("is-tilting");
        });
        card.addEventListener("pointerleave", function () { card.classList.remove("is-tilting"); });
      });
    }
  })();
})();
