# Onboarding, drift detection, and roster handling

## When this triggers

- No config exists yet for the requested team (automatic).
- The user explicitly asks to "set up," "configure," "onboard," "add a team," or "reconfigure" — even if config already exists (treat as an update to specific fields, not a full re-interview, unless the user wants to start over).

## The interview

Ask for, in roughly this order (skip anything the user has already volunteered):

1. **Team name.**
2. **Jira:** cloud ID / site URL (see below — often discoverable without asking), project key, board ID.
3. **Slack channels** (each optional — don't force a team without Slack into providing one): comms, incidents (plus the naming pattern, e.g. `team-inc-{date}` — ask what date format they actually use), deployments, alerts.
4. **GitHub:** organization/owner, repo(s) to track, default branch. Also ask whether deployments and/or issues are tracked via GitHub instead of Slack/Jira for this team — this changes which data-collection path applies later.
5. **Deployment tooling:** tool name (Volt, Harness, GitHub Actions, etc.) and either the Slack bot message format used for deploy notifications, or the GitHub Actions workflow name, whichever applies.
6. **Roster:** optional. Many teams are fine inferring roster live each run from Jira assignees + GitHub authors — only capture an explicit roster if the user wants one (e.g., to include people who don't file tickets but should still show up, like an EM).
7. **Default reporting period** for this team, if they want one different from the global 30-day default.

## Pre-filling before asking

Don't make the user type everything from a blank slate. Before asking a question, try to answer it yourself and bring a confirmable guess:

- **Jira cloud ID / site URL:** call `getAccessibleAtlassianResources` — if there's exactly one accessible resource, propose it; if there are several, list them and ask which one.
- **Slack channels:** search by likely name (`slack_search_channels`) using the team name and the category (e.g. "photon incidents", "photon deploys"). Propose the best match, but confirm — channel naming is rarely consistent enough to trust blindly. Verify with a search before ever reading a channel directly: `slack_read_channel` on an ID that turns out not to exist can hang for several minutes instead of failing fast, while a search returns "no results" quickly — so confirm existence via search first, then read.
- **GitHub repo access:** run `gh repo view {owner}/{repo}` to confirm a repo the user names actually exists and is accessible before writing it to config.

If a lookup comes back empty, ambiguous, or errors, **don't guess and don't silently pick the top result** — tell the user what you tried and ask them directly. A wrong auto-fill here is worse than asking, because it gets written to config and silently poisons every future report for this team.

If a value came from the user directly rather than a lookup you ran (e.g. they typed a channel ID or repo name themselves), and you weren't able to independently verify it, write it to config anyway — don't refuse to record what the user told you — but annotate it as unverified. Apply this consistently across every section (Jira, Slack, GitHub, deployment) rather than only the ones where a lookup happened to fail first; a config where only some sections carry an "unverified" comment reads as if the others were checked when they weren't.

## GitHub auth check

Before finishing onboarding for any team that includes GitHub data, run `gh auth status`. If it fails, tell the user to run `gh auth login` and pause onboarding there — don't write a config that includes GitHub settings you haven't verified are actually usable.

## Writing the config

Once confirmed, write to the resolved config path (see `references/config-schema.md`) and tell the user explicitly what was saved, in plain terms (not a raw YAML dump) — e.g. "Saved Photon Engineering: Jira project PHTN, GitHub repo photon-labs/photon-app, Slack channels for comms/incidents/deploys/alerts, roster of 6."

For incremental updates ("add a team", "update Photon Engineering's deploy channel"), only touch the relevant keys — read the full config, change what was asked, write the full file back unchanged elsewhere.

---

## Config drift detection (every report run, not just onboarding)

Before collecting report data, verify the stored config still points at real, active things. This exists because config can go stale silently — a renamed repo or archived channel shouldn't cause a report to silently use wrong or missing data, and it shouldn't require the user to notice and report a bug either.

- **Slack channels:** if a configured channel ID errors as not-found or archived where an active channel was expected, re-search by the stored name/pattern. Clear match found → update config automatically, tell the user what changed. No clear match → ask the user for the new channel before proceeding.
- **GitHub repos:** if `gh repo view {owner}/{repo}` fails, surface this and ask for the corrected repo before proceeding with data collection for that repo.
- **Jira project/board:** if the configured project key or board ID no longer resolves, ask the user to confirm the new key/ID — don't guess a replacement.
- Any value you auto-correct gets written back to config immediately, so the next run doesn't pay this cost again.

Incident channels are exempt from "use the stored ID directly" — they're created per-incident, so they're always searched live regardless of drift state.

## Roster handling

Roster is config-driven — it is not thrown away and re-inferred from scratch each run — but it's cross-checked against reality every run:

1. While collecting Jira assignees and GitHub PR/commit authors for the period, build the set of people who actually show up in the data.
2. Compare that set against the configured roster.
3. Discrepancies get surfaced to the user as a question, not a silent change:
   - Someone appears in the data but isn't on the roster → "I noticed {name} isn't on {team}'s roster but has activity this period — add them?"
   - Someone is on the roster but has zero activity across all sources → "{name} is on the roster but had no activity this period — remove them, or are they on leave?"
4. Only write a roster change to config if the user confirms it. If they don't respond or decline, use the roster exactly as configured for this report, and note the discrepancy inline in the Risk & Resourcing section (e.g. "activity detected from a non-roster contributor this period") rather than silently dropping it.
