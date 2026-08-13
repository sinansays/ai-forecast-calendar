# V0 specification status audit

**Audit date:** 2026-08-13  
**Scope:** [`SPEC.md`](../SPEC.md), especially the V0 definition of done in section 31  
**Status:** V0 is implemented and publicly deployable, but it is **not yet fully accepted**.

This audit distinguishes missing product work from acceptance checks that require a person or an external calendar provider. A requirement is not marked complete merely because the source code appears capable of satisfying it.

## Outstanding before V0 can be called complete

### P0 — Test the production feed in Google Calendar

The definition of done requires testing in both Apple Calendar and Google Calendar and intelligible event display in those applications. Apple Calendar subscription has a recorded pass, but both Google Calendar scenarios are still marked “Not performed” in [`provider-testing.md`](provider-testing.md).

Complete at least one Google Calendar scenario against the production feed and record the date, tester, Google Calendar/platform version, and observations. Verify the reference event's title, single all-day date, description formatting, source timing, calendar anchor, and working source URL. A file import is enough to establish basic feed compatibility and event presentation; subscription refresh remains a separate check.

**Acceptance evidence:** a completed Google Calendar result row in [`provider-testing.md`](provider-testing.md). If the URL-subscription scenario is used, distinguish initial subscription success from refresh propagation.

### P0 — Verify the site on a physical mobile device

The definition of done says the site works well on desktop and mobile. Production desktop verification is recorded, but physical mobile browsing and download/handoff are still marked “Not performed” in [`manual-verification.md`](manual-verification.md). Responsive CSS and automated tests are implementation evidence, not proof of behavior on an actual device.

Run the documented physical iOS or Android check against production and record the device, OS/browser version, tester, and observations.

**Acceptance evidence:** the physical-mobile result row in [`manual-verification.md`](manual-verification.md) is completed with an actual production test result.

## Outstanding acceptance coverage (recommended before declaring V0 polished)

These checks support the specification's accessibility, responsive-design, and subscription goals. They are not additional product features.

### P1 — Keyboard and zoom/narrow-viewport checks

The production keyboard/focus check and the 320 CSS px/200% zoom check are still marked “Not performed” in [`manual-verification.md`](manual-verification.md). Perform and record both checks. Fix any failures before V0 sign-off.

### P1 — Apple Calendar file import

Apple URL subscription has passed, but Apple file import is untested. Since the site offers both subscription and `.ics` download/import, complete the Apple import scenario in [`provider-testing.md`](provider-testing.md) to cover the download path inside a named mainstream calendar client.

### P2 — Subscription refresh behavior

The initial Apple subscription passed, but refresh propagation was explicitly not tested; Google subscription is entirely untested. The specification prefers subscriptions because corrections can propagate, so a staging-feed refresh exercise would validate that operational assumption.

This is not required to prove that the production snapshot can be downloaded and displayed. Provider-controlled refresh timing should be reported as observed, not promised.

## External repository work

### P1 — Move the repository to the required organization

Section 23 says the repository should live in the General Cognitions GitHub organization. As of the audit date, the public commit history resolves to `sinansays/ai-forecast-calendar`, while this checkout has no configured Git remote. Transfer the production repository to the required organization (or explicitly revise the specification if personal ownership is intentional), preserving redirects, deployment settings, and public feed URLs.

## Implemented; no further V0 product work identified

The repository already contains the following required capabilities:

- a dependency-free static build, CI workflow, and automatic Cloudflare Workers deployment from `main`;
- a curated 24-milestone AI 2027 snapshot with dates, provenance, source timing, normalization rationale, uncertainty, and conditional branches;
- deterministic ICS generation with stable feed paths and stable event UIDs;
- automated schema, data, ICS, determinism, ingestion, build, and deployed-response checks;
- a production landing page with explanation, attribution, milestone count/date range, milestone preview, subscription URL copy action, and `.ics` download;
- concise editorial/responsive styling with no accounts, backend, search, scoring, or other non-goal features;
- source-specific semi-automated AI 2027 ingestion with human-review and guarded-promotion steps;
- a source-independent qualification and publication guide for adding forecast calendars;
- changelog and architectural/identity/hosting decisions; and
- recorded production desktop/download and Apple Calendar subscription acceptance.

The optional preview is intentionally limited to five events; the specification only makes a preview optional and does not require every milestone to appear on the landing page. The future possibilities in section 33—including AI 2040, an aggregate feed, categories, archives, and provider-specific shortcuts—are **not outstanding V0 work**.

## Recommended completion order

1. Run and record Google Calendar production testing.
2. Run and record physical-mobile, keyboard, and narrow/zoom production checks; repair any issues found.
3. Run and record Apple file import.
4. Exercise provider refresh using a disposable staging feed when practical.
5. Transfer the repository to the required GitHub organization, or record an explicit product decision to change that requirement.

After items 1–2 pass, the remaining explicit definition-of-done gaps will be closed. Items 3–5 strengthen acceptance evidence and operational confidence without expanding product scope.
