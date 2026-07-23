# Config: location, resolution, and shape

## Where config lives

Two possible locations, checked in this order:

1. **Project-level:** `.claude/skills/engineering-report/references/teams.yaml` (relative to the current working directory's project). Use this when the team's config should travel with a specific repo/project.
2. **User-level:** `~/.claude/engineering-report/config.yaml`. Use this for teams that should be available regardless of which project you're currently in — this is the default for most onboarding, since a team's Slack/Jira/GitHub identity isn't really tied to any one local repo.

**Resolution order for reads:** check project-level first; if the requested team isn't there, fall back to user-level. If neither has the team, that's an onboarding case.

**Resolution order for writes:** during onboarding, ask the user which scope they want if it isn't obvious from context (e.g., if they're clearly working inside the team's own repo, project-level is a reasonable default to suggest — but confirm rather than assume). For incremental updates (drift auto-corrections, roster changes), write back to wherever the team's config currently lives — don't switch scope on an update.

Both files may not exist yet on a fresh machine/project — create the file (and any missing parent directories) the first time you write a team's config there.

## Shape

Top-level `teams` map keyed by a lowercase, slug-like team name (spaces → hyphens or underscores; be consistent). A `jira` block at the top level holds account-wide settings (cloud ID, site URL) shared across teams, since most orgs have one Jira instance.

```yaml
jira:
  cloud_id: ec71a93e-8281-4457-8a67-0fdeefcafcca
  site_url: https://example.atlassian.net

teams:
  photon:
    jira:
      project_key: PHTN
      board_id: 3339
    slack:
      comms_channel: C08QBTRS5U4
      incidents_channel_pattern: "photon-inc-{date}"
      deployments_channel: C08JDRF0WKY
      alerts_channel: C08NNP147HA
    github:
      owner: photon-labs
      repos: [photon-app]
      default_branch: main
      deployments_via_github: false
      issues_via_github: false
    deployment:
      tool: volt
      production_environments: [Prod, Preprod]
    default_period_days: 30
    roster:
      - name: Jordan Ellis
        role: Engineering Manager
```

Notes:
- Every field under a team is optional except the team name itself — a team might have no Slack config (GitHub+Jira only), or no roster (inferred live each run instead).
- `incidents_channel_pattern` uses `{date}` as a literal placeholder token for the incident's creation date — substitute the real date format the team actually uses (confirm during onboarding; don't assume `YYYY-MM-DD`).
- `deployments_via_github` / `issues_via_github`: set true when a team tracks these via GitHub Actions / GitHub Issues instead of Slack / Jira. When true, use the corresponding `gh` commands in `references/data-collection.md` instead of the Slack/Jira equivalents for that data type.
- Comments are welcome in this file — e.g. noting why a particular channel ID was picked — YAML supports them and this is one of the reasons YAML was chosen over a hand-maintained Markdown doc.
- Treat this file as structured data to parse and target-write, not prose to pattern-match. When updating one field (e.g. "update Photon Engineering's deploy channel"), read the full file, modify only that key, and write the full file back — don't regenerate sections you didn't touch, since that risks losing comments or fields you didn't fully understand.
