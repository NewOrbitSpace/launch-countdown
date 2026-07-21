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
    // Reviews also show remaining working days (weekdays minus holidays)
    const showWd = wt && !done && !ev.isLaunch;
    return {
      done: done,
      delta: done ? "T+" + dDays + "D" : "T-" + dDays + "D",
      wd: showWd ? " · " + workdaysUntil(ev.t, now) + "WD" : "",
      cls: "m-item" + (ev.isLaunch ? " launch" : "") + (done ? " done" : ""),
    };
  }

  const BUILDERS = {
    strip: function (ev, st) {
      return '<div class="m-cell ' + st.cls + '">' +
        '<div class="m-row"><span class="dot"></span><span class="m-code mono">' + ev.code + '</span><span class="m-delta mono">' + st.delta + st.wd + '</span></div>' +
        '<div class="m-name">' + ev.name + '</div>' +
        '<div class="m-date mono">' + fmtShort(ev) + '</div></div>';
    },
    ledger: function (ev, st) {
      return '<div class="m-lrow ' + st.cls + '"><span class="dot"></span>' +
        '<div class="m-lmain"><span class="m-ltitle">' + ev.code + ' — ' + ev.name + '</span>' +
        '<span class="m-date mono">' + fmtShort(ev) + '</span></div>' +
        '<span class="m-delta mono">' + st.delta + st.wd + '</span></div>';
    },
    trajectory: function (ev, st, i) {
      const pos = (i / (events.length - 1)) * 100;
      return '<div class="m-node ' + st.cls + '" style="left:' + pos + '%">' +
        '<div class="m-delta-slot"><span class="m-delta mono">' + st.delta + st.wd + '</span></div>' +
        '<span class="dot dot-lg"></span>' +
        '<span class="m-code mono">' + ev.code + '</span>' +
        '<span class="m-name">' + ev.name + '</span>' +
        '<span class="m-date mono">' + fmtShort(ev) + '</span></div>';
    },
    chips: function (ev, st) {
      return '<div class="m-chip ' + st.cls + '">' +
        '<span class="m-code mono">' + ev.code + '</span>' +
        '<span class="m-delta mono">' + (st.done ? "COMPLETE" : st.delta + st.wd) + '</span></div>';
    },
    mcx: function (ev, st) {
      // Mission Control status strip: one card per milestone.
      const status = ev.isLaunch
        ? (st.done ? "LIFTOFF" : "GO")
        : (st.done ? "COMPLETE" : st.delta);
      const cls = "mcx-mcard" + (ev.isLaunch ? " launch" : "") + (st.done ? " done" : "");
      return '<div class="' + cls + '">' +
        '<div class="mcx-mrow"><span class="mcx-mdot"></span>' +
        '<span class="mcx-mcode">' + ev.code + '</span>' +
        '<span class="mcx-mstatus">' + status + '</span></div>' +
        '<div class="mcx-mname">' + ev.name + '</div>' +
        '<div class="mcx-mdate">' + fmtShort(ev) + '</div></div>';
    },
    rail: function (ev, st) {
      return '<div class="m-ritem ' + st.cls + '"><div class="m-rrow"><span class="dot"></span>' +
        '<div class="m-rmain"><div class="m-rhead"><span class="m-rcode">' + ev.code + '</span>' +
        '<span class="m-delta mono">' + st.delta + st.wd + '</span></div>' +
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

  // ---------- Working-time countdown ----------
  // Counts only wt.startHour-wt.endHour on weekdays, excluding cfg holidays;
  // outside those windows the remaining total doesn't change, so it freezes.
  const wt = cfg.workingTime;
  const workBoxes = qa(".workclock");
  const workEls = qa(".js-workclock");
  const holidaySet = {};
  (wt ? wt.holidays : []).forEach(function (d) { holidaySet[d] = true; });

  function isWorkday(d) {
    const dow = d.getDay();
    return dow !== 0 && dow !== 6 &&
      !holidaySet[d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate())];
  }

  // Working days strictly after today, up to and including the event's day.
  function workdaysUntil(t, now) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    const end = new Date(t);
    end.setHours(0, 0, 0, 0);
    let n = 0;
    while (day.getTime() < end.getTime()) {
      day.setDate(day.getDate() + 1);
      if (isWorkday(day)) n++;
    }
    return n;
  }

  // Overlap of [a, b) with the working windows, in ms (local time).
  function workingMsBetween(a, b) {
    let total = 0;
    const day = new Date(a);
    day.setHours(0, 0, 0, 0);
    while (day.getTime() < b) {
      if (isWorkday(day)) {
        const lo = Math.max(a, day.getTime() + wt.startHour * 3600000);
        const hi = Math.min(b, day.getTime() + wt.endHour * 3600000);
        if (hi > lo) total += hi - lo;
      }
      day.setDate(day.getDate() + 1);
    }
    return total;
  }

  function tickWorkclock(now) {
    if (!wt || !workEls.length) return;
    const rem = Math.floor(workingMsBetween(now, launch.t) / 1000);
    const dayLen = (wt.endHour - wt.startHour) * 3600; // seconds per working day
    const inDay = rem % dayLen;
    const text = Math.floor(rem / dayLen) + " WD " +
      pad(Math.floor(inDay / 3600)) + ":" + pad(Math.floor((inDay % 3600) / 60)) + ":" + pad(inDay % 60);
    setAll(workEls, text);
    const d = new Date(now);
    const frozen = !(isWorkday(d) && d.getHours() >= wt.startHour && d.getHours() < wt.endHour);
    workBoxes.forEach(function (el) { el.classList.toggle("frozen", frozen); });
  }

  // ---------- Countdown ----------
  const els = {
    d: qa(".v-days"), h: qa(".v-hours"), m: qa(".v-min"), s: qa(".v-sec"),
  };
  const progressEls = qa(".js-progress");
  const metaEls = {
    remdays: qa(".js-remdays"),
    pct: qa(".js-pct"),
    next: qa(".js-next"),
    gates: qa(".js-gates"),
  };
  const gateCount = events.filter(function (e) { return !e.isLaunch; }).length;
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

    // Mission Control panel readouts
    setAll(metaEls.remdays, String(Math.floor(ts / 86400)));
    setAll(metaEls.pct, String(Math.round(pct)));
    const nextEv = events.find(function (e) { return e.t > now; });
    setAll(metaEls.next, nextEv
      ? nextEv.code + " · T-" + Math.round((nextEv.t - now) / 86400000) + "D"
      : "—");
    const cleared = events.filter(function (e) { return !e.isLaunch && e.t <= now; }).length;
    setAll(metaEls.gates, cleared + " / " + gateCount);

    tickWorkclock(now);

    // Rebuild milestone lists when an event flips to complete or the day
    // changes (the T-xD / WD deltas move at midnight on long-running screens)
    const key = new Date(now).toDateString() +
      events.map(function (e) { return e.t <= now ? "1" : "0"; }).join("");
    if (key !== doneKey) { doneKey = key; buildMilestones(); }
  }

  tick();
  setInterval(tick, 1000);

  // ---------- Stage scaling (1920x1080 fit to viewport) ----------
  // On narrow/mobile viewports the fixed canvas would scale down to an
  // unreadable sliver, so we drop the transform and let the CSS media
  // query reflow the layout into a natural vertical document.
  const stage = document.getElementById("stage");
  const mobileMq = window.matchMedia("(max-width: 900px), (orientation: portrait)");
  function fit() {
    if (mobileMq.matches) {
      stage.style.transform = "";
      return;
    }
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = "translate(-50%, -50%) scale(" + s + ")";
  }
  fit();
  window.addEventListener("resize", fit);

  /* ---------- Design toggle (Dashboard ⇄ Mission Control) ----------
     Two options only: the live Dashboard (1a) and the Mission Control
     console (2). Honours ?design=1a / ?design=2; choice persists locally. */
  const DESIGNS = [
    { id: "1a", label: "Dashboard" },
    { id: "2", label: "Mission Control" },
  ];
  const DESIGN_IDS = DESIGNS.map(function (d) { return d.id; });
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
    DESIGNS.forEach(function (d) {
      const b = document.createElement("button");
      b.textContent = d.label;
      b.setAttribute("data-design", d.id);
      b.addEventListener("click", function () { setDesign(d.id); });
      sw.appendChild(b);
    });
  }

  let initial = new URLSearchParams(window.location.search).get("design");
  if (!initial) { try { initial = localStorage.getItem("countdown-design"); } catch (e) { /* */ } }
  if (DESIGN_IDS.indexOf(initial) === -1) initial = DESIGN_IDS[0];
  setDesign(initial);
})();
