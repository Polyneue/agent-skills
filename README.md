# Agent Skills

Collection of custom agent skills and automation tools.

## Syncing Skills

Skills contained in the [`skills/`](skills/) directory can be automatically synced to `~/.agents/skills/<skill_name_directory>` using the provided Node.js sync script.

### Usage

Run the sync script via `npm` or `node`:

```bash
# Sync skills to ~/.agents/skills/
npm run sync

# Or using Node directly
node sync.js

# Or as an executable script
./sync.js
```

### CLI Options

| Flag | Description | Example |
| :--- | :--- | :--- |
| `--dry-run`, `-n` | Preview files to be synced without writing any changes | `node sync.js --dry-run` |
| `--dest <path>`, `-d <path>` | Specify a custom destination directory instead of `~/.agents/skills` | `node sync.js --dest ./custom-dir` |

---

## Skill Directory

| Skill | Purpose | Key Triggers | Primary Output | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| [**`engineering-report`**](skills/engineering-report/SKILL.md) | Generates interactive HTML status dashboards sourcing live data from Slack, Jira, and GitHub. | `"engineering report"`, `"status report"`, `"eng report"`, `"how is <team> doing"` | Interactive HTML Dashboard (`.html`) | `gh` (GitHub CLI), Slack API, Jira API |
| [**`gh-create-issue`**](skills/gh-create-issue/SKILL.md) | Automates discovering issue templates, resolving ambiguous inputs via `ask_question`, populating template fields/labels, and creating GitHub issues via `gh`. | `"create issue"`, `"file a bug report"`, `"submit feature request"`, `"open issue on github"` | GitHub Issue via `gh` | `gh` (GitHub CLI), `ask_question` |
| [**`gh-create-pull-request`**](skills/gh-create-pull-request/SKILL.md) | Automates git diff inspection, test verification, PR template population, and PR creation via `gh`. | `"create pull request"`, `"open a PR"`, `"submit PR"`, `"create PR"` | GitHub Pull Request via `gh` | `git`, `gh` (GitHub CLI) |
| [**`gh-resolve-pull-request-feedback`**](skills/gh-resolve-pull-request-feedback/SKILL.md) | Automates fetching unresolved PR review comments via `gh`, addressing code changes, verifying tests, and replying to review threads. | `"resolve pr review comments"`, `"address PR review comments"`, `"handle code review feedback"`, `"reply to pr comments"` | Inline PR Review Replies & Summary Report | `git`, `gh` (GitHub CLI) |
| [**`gh-select-issue`**](skills/gh-select-issue/SKILL.md) | Automates fetching open repo issues via `gh` and presenting them via `ask_question` to select an issue to work on. | `"select issue"`, `"pick an issue to work on"`, `"pull open issues"`, `"work on an issue"` | Selected GitHub Issue Details & Action Plan | `gh` (GitHub CLI) |

---

## Repository Structure

```text
agent-skills/
├── .agents/
│   └── skills/
│       └── add-skill-to-readme/
│           └── SKILL.md
├── .github/
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
├── skills/
│   ├── engineering-report/
│   │   └── SKILL.md
│   ├── gh-create-issue/
│   │   └── SKILL.md
│   ├── gh-create-pull-request/
│   │   └── SKILL.md
│   ├── gh-resolve-pull-request-feedback/
│   │   └── SKILL.md
│   └── gh-select-issue/
│       └── SKILL.md
├── .gitignore
├── LICENSE
├── README.md
├── package.json
└── sync.js
```
