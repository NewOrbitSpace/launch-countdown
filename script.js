(function () {
  "use strict";

  const cfg = LAUNCH_CONFIG;
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const events = cfg.events.map(function (e, i) {
    return Object.assign({}, e, {
      t: new Date(e.date).getTime(),
      isLaunch: !!e.isLaunch,
      last: i === cfg.events.length - 1,
    });
  });
  const launch = events[events.length - 1];
  const start = events[0].t;
  const launchLong = new Date(launch.date).toLocaleDateString("en-US",
    launch.precision === "month"
      ? { month: "long", year: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" });

  function qa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtShort(ev) {
    const d = new Date(ev.date);
    const my = MONTHS[d.getMonth()] + " " + d.getFullYear();
    return ev.precision === "month" ? my : pad(d.getDate()) + " " + my;
  }

  // ---------- Static copy fills ----------
  qa(".js-launchline").forEach(function (el) { el.textContent = cfg.mission + " launches " + launchLong; });
  qa(".js-launchsub").forEach(function (el) { el.textContent = "to launch — " + launchLong; });
  qa(".js-launchlead").forEach(function (el) { el.textContent = cfg.mission + " launches in"; });
  qa(".js-datecaps").forEach(function (el) { el.textContent = launchLong.toUpperCase(); });
  qa(".launched-msg").forEach(function (el) { el.textContent = cfg.launchedMessage; });

  // ---------- Milestone rendering ----------
  function evState(ev, now) {
    const done = ev.t <= now;
    const dDays = Math.round(Math.abs(ev.t - now) / 86400000);
    return {
      done: done,
      delta: done ? "T+" + dDays + "D" : "T-" + dDays + "D",
      cls: "m-item" + (ev.isLaunch ? " launch" : "") + (done ? " done" : ""),
    };
  }

  const BUILDERS = {
    strip: function (ev, st) {
      return '<div class="m-cell ' + st.cls + '">' +
        '<div class="m-row"><span class="dot"></span><span class="m-code mono">' + ev.code + '</span><span class="m-delta mono">' + st.delta + '</span></div>' +
        '<div class="m-name">' + ev.name + '</div>' +
        '<div class="m-date mono">' + fmtShort(ev) + '</div></div>';
    },
    ledger: function (ev, st) {
      return '<div class="m-lrow ' + st.cls + '"><span class="dot"></span>' +
        '<div class="m-lmain"><span class="m-ltitle">' + ev.code + ' — ' + ev.name + '</span>' +
        '<span class="m-date mono">' + fmtShort(ev) + '</span></div>' +
        '<span class="m-delta mono">' + st.delta + '</span></div>';
    },
    trajectory: function (ev, st, i) {
      const pos = (i / (events.length - 1)) * 100;
      return '<div class="m-node ' + st.cls + '" style="left:' + pos + '%">' +
        '<div class="m-delta-slot"><span class="m-delta mono">' + st.delta + '</span></div>' +
        '<span class="dot dot-lg"></span>' +
        '<span class="m-code mono">' + ev.code + '</span>' +
        '<span class="m-name">' + ev.name + '</span>' +
        '<span class="m-date mono">' + fmtShort(ev) + '</span></div>';
    },
    chips: function (ev, st) {
      return '<div class="m-chip ' + st.cls + '">' +
        '<span class="m-code mono">' + ev.code + '</span>' +
        '<span class="m-delta mono">' + (st.done ? "COMPLETE" : st.delta) + '</span></div>';
    },
    rail: function (ev, st) {
      return '<div class="m-ritem ' + st.cls + '"><div class="m-rrow"><span class="dot"></span>' +
        '<div class="m-rmain"><div class="m-rhead"><span class="m-rcode">' + ev.code + '</span>' +
        '<span class="m-delta mono">' + st.delta + '</span></div>' +
        '<span class="m-rname">' + ev.name + '</span>' +
        '<span class="m-date mono">' + fmtShort(ev) + '</span></div></div>' +
        (ev.last ? '' : '<div class="stem"></div>') + '</div>';
    },
  };

  function buildMilestones() {
    const now = Date.now();
    qa("[data-milestones]").forEach(function (box) {
      const build = BUILDERS[box.getAttribute("data-milestones")];
      if (!build) return;
      box.innerHTML = events.map(function (ev, i) { return build(ev, evState(ev, now), i); }).join("");
    });
  }

  // ---------- Countdown ----------
  const els = {
    d: qa(".v-days"), h: qa(".v-hours"), m: qa(".v-min"), s: qa(".v-sec"),
  };
  const progressEls = qa(".js-progress");
  let doneKey = "";

  function setAll(list, text) { list.forEach(function (el) { el.textContent = text; }); }

  function tick() {
    const now = Date.now();
    if (launch.t - now <= 0) document.body.classList.add("launched");
    const ts = Math.max(0, Math.floor((launch.t - now) / 1000));
    setAll(els.d, String(Math.floor(ts / 86400)));
    setAll(els.h, pad(Math.floor((ts % 86400) / 3600)));
    setAll(els.m, pad(Math.floor((ts % 3600) / 60)));
    setAll(els.s, pad(ts % 60));

    const pct = Math.min(100, Math.max(0, ((now - start) / (launch.t - start)) * 100));
    progressEls.forEach(function (el) { el.style.width = pct.toFixed(3) + "%"; });

    // Rebuild milestone lists only when an event flips to complete
    const key = events.map(function (e) { return e.t <= now ? "1" : "0"; }).join("");
    if (key !== doneKey) { doneKey = key; buildMilestones(); }
  }

  tick();
  setInterval(tick, 1000);

  // ---------- Stage scaling (1920x1080 fit to viewport) ----------
  const stage = document.getElementById("stage");
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = "translate(-50%, -50%) scale(" + s + ")";
  }
  fit();
  window.addEventListener("resize", fit);

  /* ── DESIGN SWITCHER — temporary. Delete from here to the end (and the
     <nav id="design-switcher"> in index.html) once one design is chosen.
     Also supports ?design=1a..1g in the URL; choice persists locally. ── */
  const DESIGNS = ["1a", "1c", "1d", "1e", "1g"];
  const sw = document.getElementById("design-switcher");

  function setDesign(id) {
    qa(".design").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-design") === id);
    });
    if (sw) {
      qa("#design-switcher button").forEach(function (b) {
        b.classList.toggle("active", b.getAttribute("data-design") === id);
      });
    }
    try { localStorage.setItem("countdown-design", id); } catch (e) { /* private mode */ }
  }

  if (sw) {
    DESIGNS.forEach(function (id) {
      const b = document.createElement("button");
      b.textContent = id;
      b.setAttribute("data-design", id);
      b.addEventListener("click", function () { setDesign(id); });
      sw.appendChild(b);
    });
  }

  let initial = new URLSearchParams(window.location.search).get("design");
  if (!initial) { try { initial = localStorage.getItem("countdown-design"); } catch (e) { /* */ } }
  if (DESIGNS.indexOf(initial) === -1) initial = DESIGNS[0];
  setDesign(initial);
  /* ── end DESIGN SWITCHER ── */
})();
