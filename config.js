// Mission configuration — edit this file to change the countdown.
// Dates are ISO 8601, interpreted in the viewer's local timezone
// (append an offset like "+00:00" to pin them to UTC).
const LAUNCH_CONFIG = {
  mission: "NEO Rideshare",
  launchedMessage: "We have liftoff.",
  // The LAST event is the launch the main clock counts down to.
  events: [
    { code: "PRR", name: "Program Requirements Review", date: "2026-04-20T12:00:00" },
    { code: "SRR", name: "System Requirements Review", date: "2026-07-13T12:00:00" },
    { code: "PDR", name: "Preliminary Design Review", date: "2026-09-20T12:00:00" },
    { code: "CDR", name: "Critical Design Review", date: "2027-01-12T12:00:00" },
    { code: "LAUNCH", name: "NEO Rideshare Launch", date: "2028-07-01T12:00:00", isLaunch: true },
  ],
};
