# Data collection: Slack, Jira, GitHub

Scope every pull below to the resolved date range from `references/report-generation.md`. Use config-resolved IDs/keys/names directly (channel IDs, project keys, repo names) rather than re-searching each run — the one exception is incident channels, which are inherently dynamic (created per-incident) and always require a live search.

## Slack

- **Comms:** `slack_read_channel` on the configured comms channel, scoped to the date range — general team activity/announcements.
- **Incidents:** search live (`slack_search_channels` / `slack_search_public_and_private`) using the team's `incidents_channel_pattern`, with `include_archived: true` — old incident channels get archived and would otherwise disappear from search.
- **Deployments:** `slack_read_channel` on the configured deployments channel, if the team tracks deploys via Slack bot messages rather than GitHub Actions (check `github.deployments_via_github` in config).
- **Alerts:** `slack_read_channel` on the configured alerts channel, if present.

## Jira / Confluence

- Use `searchJiraIssuesUsingJql` scoped to the resolved date range and the team's project key: completed work, in-progress work, incident-linked tickets, epics, current sprint context.
- Use `search` (Rovo) for anything not cleanly expressible in JQL (e.g. free-text discovery across epics/docs).
- `getAccessibleAtlassianResources` is an onboarding-time lookup (resolving cloud ID), not something to re-run on every report.

## GitHub (via `gh` CLI, not the GitHub MCP connector)

This skill targets Claude Code specifically, so GitHub data comes from shelling out to `gh`, not an MCP connector. Request everything as JSON and parse programmatically — don't scrape human-readable `gh` output.

**Merged/opened PRs:**
```
gh pr list --repo {owner}/{repo} --state all --search "created:{start}..{end}" \
  --json number,title,author,createdAt,mergedAt,closedAt,additions,deletions,reviews,labels
```

**PR reviews and review latency:** derive from the `reviews` field in the PR list above — use it to flag slow review turnaround, don't make a separate call per PR unless you need thread-level detail.

**Commits** (for contributor activity when PR data alone misses direct pushes):
```
gh api repos/{owner}/{repo}/commits --field since={start} --field until={end}
```

**CI/deployment status** (only if `github.deployments_via_github: true` for this team):
```
gh run list --repo {owner}/{repo} --created "{start}..{end}" \
  --json name,status,conclusion,createdAt,headBranch
```

**Issues** (only if `github.issues_via_github: true`):
```
gh issue list --repo {owner}/{repo} --search "created:{start}..{end}"
```

**Onboarding-only sanity checks** (not run during normal report generation):
```
gh auth status
gh repo view {owner}/{repo}
```

### Per-PR/commit fields to capture for the report

- Author, title, and any Jira ticket key cross-referenced from the title, branch name, or commit messages
- Lines changed (additions/deletions) as a rough size signal
- Time to merge, time to first review
- Whether it was reverted (search title for "revert", or match against a revert commit)
- Labels (`bug`, `security`, `breaking-change`, etc.) — feed these into the Work Summary's thematic breakdown alongside the Jira ticket types, not as a separate disconnected list

### Cross-referencing GitHub with Jira

Ticket keys commonly show up in branch names, PR titles, or commit messages (e.g. `PHTN-1234`). Extract these and use them to connect a PR/commit back to the planned work it implements — this is what lets the report show "ticket X shipped via PR Y" instead of two disconnected lists.
