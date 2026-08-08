# Calendar provider test scenarios

Provider behavior must be tested with the **deployed production feed**, not inferred from the generated file. Record a date, tester, provider/app version, platform, and pass/fail notes in the results table only after completing every observation below. A blank status means untested.

## Expected reference event

Use **“AI 2027: Agent-3 becomes a superhuman AI researcher”** as the reference. It should be an all-day event on **October 15, 2027**, with no second day. Its description should retain readable paragraph breaks and show:

- the forecast text;
- `Source timing: October 2027`;
- `Calendar anchor: 2027-10-15`;
- the source URL on its own line.

The event's URL/source affordance should open `https://ai-2027.com/2027`.

## Apple Calendar

### Manual file import

1. Download `/calendars/ai-2027.ics` in Safari and save it without editing it.
2. In Calendar on macOS, use **File → Import**, choose the file, and import into a new test calendar.
3. Find the reference event and verify its exact title, single all-day date, paragraph formatting, source timing, calendar anchor, and clickable source URL.
4. Confirm the other events appear once and remove the test calendar afterward.

### URL subscription and refresh

1. In Calendar on macOS, use **File → New Calendar Subscription** and enter the absolute production URL ending `/calendars/ai-2027.ics`.
2. Select an auto-refresh interval and complete the subscription. Confirm the same event details as above.
3. In a disposable staging feed (never by changing canonical production data), publish a uniquely labelled temporary event, allow the selected interval to pass or invoke Calendar's refresh, and confirm it appears without re-subscribing.
4. Remove the temporary staging event, refresh again, then remove the subscription.

## Google Calendar

### Manual file import

1. Download the production `.ics` file without editing it.
2. In Google Calendar on desktop, open **Settings → Import & export → Import**, choose the file, and select a new test calendar.
3. Find the reference event and verify its exact title, single all-day date, preserved/readable line breaks, source timing, calendar anchor, and clickable source URL.
4. Confirm the other events appear once and delete the test calendar afterward. Imported files are snapshots and are not expected to refresh.

### URL subscription and refresh

1. Next to **Other calendars**, choose **From URL** and enter the absolute production `/calendars/ai-2027.ics` URL.
2. After Google fetches it, verify all reference-event fields above.
3. In a disposable staging feed, publish a uniquely labelled temporary event and record when it becomes visible. Google controls refresh timing; do not claim an exact interval unless it was observed in this test.
4. Remove the temporary event and subscribed test calendar when complete.

## Actual provider results

Do not enter “pass” based on `npm test`, the ICS validator, browser rendering, or provider documentation. Those checks do not exercise provider import and refresh behavior.

| Provider and scenario | Test date | App/version and platform | Tester | Status | Observations / refresh timing |
| --- | --- | --- | --- | --- | --- |
| Apple Calendar — file import | — | — | — | Not performed | — |
| Apple Calendar — URL subscription | — | — | — | Not performed | — |
| Google Calendar — file import | — | — | — | Not performed | — |
| Google Calendar — URL subscription | — | — | — | Not performed | — |
