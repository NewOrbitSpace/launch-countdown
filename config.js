// Mission configuration — edit this file to change the countdown.
// Dates are ISO 8601, interpreted in the viewer's local timezone
// (append an offset like "+00:00" to pin them to UTC).
const LAUNCH_CONFIG = {
  mission: "NEO Rideshare",
  launchedMessage: "We have liftoff.",
  // The LAST event is the launch the main clock counts down to.
  events: [
    { code: "PRR", name: "Preliminary Requirements Review", date: "2026-04-22T12:00:00" },
    { code: "SRR", name: "System Requirements Review", date: "2026-07-14T12:00:00" },
    { code: "PDR", name: "Preliminary Design Review", date: "2026-10-16T12:00:00" },
    { code: "CDR", name: "Critical Design Review", date: "2027-06-24T12:00:00" },
    { code: "AR", name: "Acceptance Review", date: "2028-03-02T12:00:00" },
    { code: "LRR", name: "Launch Readiness Review", date: "2028-05-25T12:00:00" },
    // Launch day not decided yet — precision: "month" hides the day everywhere
    // it's displayed (the clock still counts down to the date below).
    { code: "LAUNCH", name: "NEO Rideshare Launch", date: "2028-07-01T12:00:00", isLaunch: true, precision: "month" },
  ],
};
