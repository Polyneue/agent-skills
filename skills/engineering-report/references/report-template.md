# Report content, section by section

This is the single template for every report — depth and framing scale per `references/report-generation.md`, but the section identity stays the same so a reader who's seen one report knows where to look in the next.

Fill in `assets/report_template.html`'s placeholder blocks with the content described below. Every section must render something — if a section is empty for this period (e.g. zero incidents), say so explicitly ("No incidents in this period") rather than collapsing or omitting the section, so the reader can tell "nothing happened" apart from "this wasn't checked."

## Design system — use these components, don't invent one-offs

The shell is a dark-first dashboard style (IBM Plex Sans/Mono, dark/light toggle, sticky scroll-spy nav). It exists to fix a specific failure mode: a report where every number is buried in a sentence and every section looks like every other section, so a busy reader can't triage in 5 seconds. Concretely, that means:

- **Headline numbers get KPI tiles (`.kpi-grid` / `.kpi`), never bare prose.** Executive Summary opens with 3-5 tiles (pick whichever numbers matter most this period — don't force a fixed schema). GitHub Activity's stat row is tiles too. Use `.good`/`.warn`/`.bad` modifiers to pre-signal whether a number is reassuring or concerning before the reader even reads the label.
- **Every PR number and Jira ticket key is a styled pill (`.pr-link` / `.ticket-link`), everywhere it appears** — tables, prose, thematic breakdowns alike. One plain-text ticket key next to five styled ones reads as unfinished, not as a stylistic choice.
- **Every Risk & Resourcing item carries a severity** (`.risk-item.high` / `.med` / `.low`, each with a `.sev` tag) — never a plain bullet list. High = needs attention this cycle, med = worth a look, low = fyi. This is what lets a skip-level triage the section without reading every paragraph.
- **Roster status is a badge, not parenthetical text.** The per-engineer workload table tags each name `.badge.roster` or `.badge.gray` ("non-roster") — this distinction is load-bearing for the roster-coverage analysis in Risk & Resourcing, so it needs to be scannable down the column, not read one name at a time.
- **Outlier or notable table rows get `tr.flag-row`** (a colored left border) — a revert, a failed deploy, an unusually large diff. The point is that a reader scanning the table vertically catches the flagged rows without reading every cell.
- **Snapshot comparisons (top contributors, ticket-type mix) use the lightweight `.barchart` component**, not a table and not a Chart.js chart — a horizontal bar per row, width scaled to the largest value in the set. Reserve Chart.js (still wired in `<head>`, deletable if unused) for genuine time-series trend framing in long (>45 day) periods, e.g. PRs-merged-per-week across a quarter. A snapshot doesn't need a JS charting library; a trend line does.
- **Look Ahead's three groups are color-coded columns** (`.la-col.now` / `.soon` / `.watch`), not an inline bold label inside a shared bullet list — urgency should be visible before the text is read.
- **The header carries the report's identity as a dashboard, not a document subtitle**: meta pills for period/generated-timestamp/repo, plus a status chip (green "Zero incidents this period" or amber/red "{N} incidents this period") that gives the one-line health read before the reader scrolls at all.

## 1. Header

Team name, resolved date range, generation timestamp, and (if GitHub is configured) the repo — rendered as meta pills in the masthead, not plain text under the title. The status chip next to them is the one part of the report that never changes shape regardless of period length; its color (green/amber/red) and text should reflect this period's incident count at a glance — it's the anchor a reader checks first to confirm both what they're looking at and whether anything's on fire.

## 2. Executive Summary

Opens with a 3-5 tile KPI grid of the period's headline numbers, then 4-6 sentences of narrative for medium/long periods (condensed to 1-2 sentences for ≤3-day periods — see report-generation.md, short periods use a "sprint pulse" instead of a full summary). This is the one section a busy reader (e.g. a skip-level) might read alone, so both the tiles and the prose should stand on their own: overall health, the one or two things that most changed since last time, and anything that needs attention.

## 3. Incidents & Issues

Per incident (as an `.incident-row`): severity as a `.badge`, status, a link to the originating Slack thread (if a URL is available), a one-line summary, associated Jira tickets as `.ticket-link` pills, partner/customer impact if known, whether it was escalated, and detection→resolution time. If nothing occurred this period, state that explicitly rather than omitting the section — and the header status chip should already reflect that at a glance.

## 4. Deployments & Releases

A table: per deployment, date, what shipped (in plain terms, not just a commit list), category as a `.badge`, any rollbacks or failures, whether it required off-hours coordination, and — this is the part that makes the report valuable rather than just a log — its correlation to an incident (if the deploy caused or was implicated in one, shown as a `.badge red` and the row marked `flag-row`) and its linked PRs as `.pr-link` pills, surfaced inline so the reader doesn't have to cross-reference the GitHub Activity section by hand.

## 5. GitHub Activity

Stat-row KPI tiles for PR volume and merge velocity, review turnaround time; a `.barchart` of top contributors by activity (human authors, excluding bot/dependency-bump noise — call out the excluded count in a table-note rather than silently dropping it); a table of the largest or riskiest changes (by size or by label like `breaking-change`/`security`), with any reverted PRs marked `flag-row` and tagged with a `.badge red` "Revert"; CI health if the team tracks deploys/CI via GitHub Actions. For long periods, replace the contributor snapshot with a Chart.js trend line (PRs merged per week/month) rather than a single-point-in-time bar list.

## 6. Work Summary

A `.barchart` ticket-type mix (bugs vs. features vs. tech debt, etc.) for medium periods, a thematic breakdown table (grouping related tickets/PRs by the actual initiative or area they served, with every ticket/PR reference as a pill) and a short narrative tying the two together — cross-referenced against merged PRs so a reader can see which shipped work fulfilled which planned ticket. For periods >45 days, replace the ticket-type barchart with a Chart.js throughput-over-time chart — a 90-day snapshot of 200 tickets crammed into one bar list doesn't communicate a trend any better than a table would.

## 7. Risk & Resourcing

Risk flags (technical or delivery risk visible in the data — e.g. a cluster of reverts, a single person owning all the risky changes) as severity-tagged `.risk-item`s, resourcing concerns, a per-engineer workload breakdown combining Jira + GitHub signal (ticket count/type mix + PR volume/size — not just one or the other) with roster/non-roster badges, dependency risks, and upcoming risk windows (e.g. a key person's vacation, an external dependency's deadline). This is also where you note any roster discrepancy the user didn't confirm resolving (see `references/onboarding.md`'s roster handling) — e.g. "activity detected from a non-roster contributor this period" — as its own risk item with an appropriate severity, not a footnote.

## 8. Strategic Alignment (optional)

Roadmap progress, priority shifts, wins worth calling out to a reader who cares more about direction than mechanics. Omit this section entirely (not just leave it empty) if there's genuinely nothing strategic to report for the period — unlike the other sections, "nothing to say" is a legitimate reason to skip it rather than something to flag, since it's explicitly optional per the spec.

## 9. Look Ahead / Near-Term Focus

For short (≤3 day) periods: a per-engineer "what's next" table (one line each, inferred from in-progress/open work) plus up to 5 flags for the lead. For medium/long periods: the three-column `.lookahead-grid` — Immediate (`.now`, red top border) / On the Horizon (`.soon`, amber) / Watch Items (`.watch`, accent blue) — each a short list, not a paragraph. The color coding should make urgency visible before the text is read.

## General rules across all sections

- **Never fabricate.** If a source wasn't configured for this team (e.g. no alerts channel) or a pull failed and the user chose to proceed anyway, say so in the relevant section instead of silently leaving it blank or inventing plausible-sounding content.
- **Cross-reference, don't just list.** Wherever two sources describe the same underlying thing (a deploy and its PRs, a ticket and the PR that closed it, an incident and the deploy that caused it), show that connection inline rather than making the reader mentally match up two separate lists.
- **Link out for real.** Every `.ticket-link` and `.pr-link` is a working `<a>`, not a styled span — build the href from config (`{jira.site_url}/browse/{TICKET-KEY}`, `https://github.com/{owner}/{repo}/pull/{number}`) and open it in a new tab (`target="_blank" rel="noopener"`) so a click doesn't navigate away from the report. Incident summaries link to the originating Slack thread the same way, wherever a URL is actually available. Don't fabricate a URL if one wasn't captured during data collection — better to leave a ticket/PR reference as plain text than to link to a guessed URL.
- **Use the design system consistently.** A KPI tile in one section and a plain sentence with the same kind of number in another, or a `.ticket-link` pill in one table and bare text in another, reads as an unfinished report even if the underlying content is complete.
