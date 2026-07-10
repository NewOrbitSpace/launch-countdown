(function () {
  const cfg = LAUNCH_CONFIG;
  const target = new Date(cfg.launchDate);

  document.getElementById("title").textContent = cfg.title;
  document.getElementById("subtitle").textContent = cfg.subtitle;
  document.getElementById("target-date").textContent =
    "Target: " + target.toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });

  const els = {
    days: document.getElementById("days"),
    hours: document.getElementById("hours"),
    minutes: document.getElementById("minutes"),
    seconds: document.getElementById("seconds"),
  };
  const countdownEl = document.getElementById("countdown");
  const launchedEl = document.getElementById("launched-message");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function tick() {
    const diff = target - Date.now();

    if (diff <= 0) {
      countdownEl.hidden = true;
      launchedEl.hidden = false;
      launchedEl.textContent = cfg.launchedMessage;
      clearInterval(timer);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    els.days.textContent = Math.floor(totalSeconds / 86400);
    els.hours.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    els.minutes.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    els.seconds.textContent = pad(totalSeconds % 60);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();
