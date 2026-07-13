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

    tickWorkclock(now);

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
})();
