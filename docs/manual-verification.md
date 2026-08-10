# Manual site verification

Run this concise checklist against the production origin after the automated smoke check.

- **Desktop:** At 1280 px or wider, confirm the headline and calendar listing are legible, source/download actions work, no content overlaps, and the copied URL exactly matches the stable production feed.
- **Mobile:** On a physical iOS or Android device, confirm there is no horizontal scrolling, text remains readable, controls are comfortably tappable, the source opens, and the `.ics` action downloads or hands off the feed as the browser permits.
- **Keyboard:** Starting at the address bar, use only Tab, Shift+Tab, Enter, and Space. Confirm every link and button is reachable in logical order, focus is conspicuous, activation works, and “Copied” is announced/visible.
- **Narrow viewport:** At 320 CSS px wide and at 200% browser zoom, confirm the headline wraps without clipping, the calendar layout becomes one column, buttons do not overflow, and all copy remains available.
- **Content:** Confirm the landing explanation does not present forecasts as endorsements; the forecast source and stable feed link are visible and correct.

## Actual production results

Do not mark a row passed from source review, a local browser, or the automated smoke test. Record the production URL, date, browser/device or assistive technology, tester, and observations after performing the check.

| Check | Production URL | Test date | Environment | Tester | Status | Observations |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop browser and download | https://forecastcalendar.org/ | 2026-08-09 | Google Chrome (version not recorded) on macOS (version not recorded), desktop layout | Project owner | Passed | The desktop layout was legible with no overlapping content; source and download actions worked. The downloaded `ai-2027.ics` feed contained all 24 events. |
| Physical mobile browser and download/handoff | — | — | — | — | Not performed | Not separately tested |
| Keyboard and focus accessibility | — | — | — | — | Not performed | Not separately tested |
| 320 px viewport and 200% zoom | — | — | — | — | Not performed | Not separately tested |
| Subscription URL and production content review | https://forecastcalendar.org/ | 2026-08-09 | Apple Calendar (version not recorded) on macOS (version not recorded) | Project owner | Passed | Subscribed using the exact feed URL `https://forecastcalendar.org/calendars/ai-2027.ics`. Apple Calendar displayed 24 events, including “AI 2027: Agent-3 becomes a superhuman AI researcher” once as a single all-day event on October 15, 2027, with readable description paragraphs, source timing, calendar anchor, and source URL. Production copy and source links were reviewed. Refresh propagation was not tested. |
