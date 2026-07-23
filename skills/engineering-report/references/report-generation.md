# Resolving the time period and scaling report depth

## Resolving the period

1. User specified a period in their request (a date range, "last N days", "since {date}", "this week", "yesterday") → parse it directly against today's date.
2. User specified nothing → ask them: *"What time period should this report cover? Default is the last 30 days."* Don't silently default without asking — the reader needs to trust the window was deliberate, and a report generated over the wrong window is worse than a 10-second question.
3. If they decline to specify, or confirm the default → use the team's `default_period_days` from config if set, otherwise 30 days ending today (or ending at a user-specified end date, if they gave one without a start).
4. Whatever the resolved window ends up being, display it prominently in the report header. There should be zero ambiguity for a reader about what was and wasn't analyzed.

## Why depth scales with period length

A report over 2 days and a report over 90 days are answering different questions. Over 2 days, thematic/risk analysis is mostly noise — there's no trend to detect, and forcing the standard section list produces empty or padded-out sections. Over 90 days, enumerating every individual PR and ticket is the opposite failure — it's unreadable and buries the signal a reader actually wants (trend, trajectory, risk). The three tiers below exist to keep the report legible at both ends without maintaining three separate templates.

## Short periods (≤3 days): standup-style

Skip the full template. Produce instead:
- A brief sprint pulse (1-2 sentences, not the full Executive Summary)
- Recent activity, grouped loosely by theme if there's an obvious one, otherwise just chronological
- A near-term focus line per active engineer (what they're likely picking up next, inferred from in-progress tickets / open PRs)
- Up to 5 flags for the lead — one line each, only if something actually warrants a flag (don't manufacture flags to fill the list)

Deep thematic or risk analysis doesn't belong here — a 2-day window doesn't contain a trend.

## Medium periods (4–45 days, includes the 30-day default): full report

Use the complete section list from `references/report-template.md`: Header, Executive Summary, Incidents, Deployments, GitHub Activity, Work Summary (ticket-type + thematic tables), Risk & Resourcing (including per-engineer workload), Strategic Alignment, Look Ahead.

## Long periods (>45 days): same sections, trend-framed

Same section list as medium, but Work Summary, GitHub Activity, and Risk favor trend framing — week-over-week or month-over-month deltas, contribution graphs, throughput-by-type-over-time — over listing every individual ticket or PR. The goal is the same information at a different resolution: a reader over a 90-day window wants to know "PR volume dropped 30% in the last three weeks," not a table of 400 individual PRs.

These three thresholds (≤3 / 4–45 / >45 days) are fixed for this skill, not something to renegotiate per-request.

## Data collection applies uniformly

Regardless of which depth tier applies, the underlying data collection process is identical — see `references/data-collection.md`. Only the synthesis and presentation depth changes; don't skip pulling a full data source just because the tier will summarize it more tersely.
