---
name: engineering-report
description: Generate an interactive HTML engineering status report for a single team by pulling live data from Slack, Jira, and GitHub over a configurable time period (default 30 days). Use this whenever the user asks for an "engineering report," "status report," "eng report," or "team report," asks how a team (by name, e.g. "how's Photon Engineering doing") is doing lately, asks to "set up," "configure," or "onboard" a team for reporting, or asks for a report scoped to a time window (e.g. "report for the last 2 weeks," "90-day report," "what's happened since June 1st"). Always trigger this skill for these requests rather than manually querying Slack/Jira/GitHub and writing up a summary by hand — the skill handles config lookup, onboarding new teams, drift detection, and rendering a proper interactive HTML report instead of a plain text summary.
---

# engineering-report

Generates a single-team engineering status report as a self-contained, interactive HTML file, sourced live from Slack, Jira, and GitHub. One report always covers exactly one team and one resolved time window — never combine teams into one report.

## Why this exists

A good status report needs consistent structure (so a reader can trust it covers the same ground every time) but variable depth (a 2-day standup pulse and a 90-day quarterly retro shouldn't look the same). This skill encodes that: a fixed data-collection and rendering process, with depth and framing that scale to the requested time window.

## Step 0: Figure out which mode you're in

1. **Resolve the team name** from the user's message. If ambiguous or missing, ask.
2. **Check for that team's config** (see `references/config-schema.md` for exact paths and resolution order — project-level first, then user-level).
3. Decide the mode:
   - **No config found for this team**, or the user explicitly says "set up," "onboard," "configure," or "reconfigure" → **Onboarding mode**. Read `references/onboarding.md` and follow it fully before attempting any report generation.
   - **Config found, and the user wants a report** → **Report generation mode**. Read `references/report-generation.md`.
   - Both may apply in sequence: if config is missing, onboard first, then immediately proceed to generate the report the user actually asked for (don't make them ask twice).

Do not guess at team details in either mode. Every one of Slack/Jira/GitHub lookups can fail (renamed repo, archived channel, moved project) — when that happens, ask the user rather than proceeding on a guess. This matters more than it might seem: a wrong guess here silently corrupts every future report for that team, since config gets written back to disk.

## Step 1 (Onboarding mode only): interview, verify, persist

Full detail in `references/onboarding.md`, including:
- The interview questions to ask and in what order
- How to pre-fill answers by searching Slack/Jira/GitHub live before asking the user to confirm
- The `gh auth status` check that must pass before finishing GitHub-inclusive onboarding
- Config drift detection (runs on *every* report generation, not just onboarding) and how to self-heal vs. prompt
- Roster handling — config-driven, cross-checked against live data each run, only updated on explicit user confirmation

Once onboarding completes and is confirmed with the user, fall through to Step 2 if the user also wanted a report generated now.

## Step 2 (Report generation mode): resolve the time period

Before collecting any data, resolve exactly what window the report covers:

1. User specified a period (date range, "last N days", "since {date}", "this week", "yesterday") → parse and use it.
2. User specified nothing → **ask them** ("What time period should this report cover? Default is the last 30 days.") — don't silently assume.
3. User declines to specify, or confirms the default → use the team's configured default period if set, else 30 days ending today.
4. Always display the resolved window prominently in the report header — never leave the reader guessing what was analyzed.

The resolved period length determines report depth. Full detail — including the exact section list and how each section adapts — is in `references/report-generation.md`.

## Step 3: collect data

Pull from Slack, Jira, and GitHub scoped to the resolved date range, using the config-resolved channel IDs / project keys / repo names (except incident channels, which are always searched live since they're created per-incident). Exact tool calls and `gh` commands, plus what fields to capture per PR/commit, are in `references/data-collection.md`.

Cross-reference GitHub PRs/commits against Jira ticket keys (from branch names, PR titles, commit messages) so code changes can be tied back to planned work in the report.

## Step 4: render the report

Read `references/report-template.md` for the full section-by-section spec (what goes in Executive Summary, Incidents, Deployments, GitHub Activity, Work Summary, Risk & Resourcing, Strategic Alignment, Look Ahead — and how each is scaled or trend-framed by period length).

Use `assets/report_template.html` as the starting structural shell — it's a dark-first dashboard design (KPI tiles, severity-tagged risk items, sticky scroll-spy nav, dark/light toggle) with the CSS, collapsible-section markup, sortable-table JS, and Chart.js CDN wiring already built in, so you only need to fill in content, not rebuild the interactive scaffolding or restyle it from scratch. Copy it, then replace the marked placeholder blocks with the generated content for this report — the file's own header comment and `references/report-template.md`'s "Design system" section both explain which component (KPI tile, badge, risk-item severity, flag-row, barchart, etc.) to use where. Don't fall back to plain text/tables where a styled component exists for that purpose — an inconsistently-styled report reads as unfinished.

Never fabricate data. If a source is unavailable or a section has nothing to report (e.g., zero incidents), say so explicitly in that section rather than omitting it or inventing filler.

Write the finished file as `engineering-report-{team}-{startDate}_to_{endDate}.html` and tell the user the path plus that it can be opened directly in a browser.

## Reference map

| File | Read when |
|---|---|
| `references/config-schema.md` | Any time you need to know where config lives, its shape, or how to write to it |
| `references/onboarding.md` | Onboarding a new team, updating an existing team's config, or running drift/roster checks on an existing run |
| `references/report-generation.md` | Determining time period, and the full depth-scaling rules per period length |
| `references/data-collection.md` | Pulling Slack/Jira/GitHub data, exact `gh` commands, and what to capture per PR/commit |
| `references/report-template.md` | Writing the actual report content, section by section |
| `assets/report_template.html` | The HTML/CSS/JS shell to copy and fill in for every report |
