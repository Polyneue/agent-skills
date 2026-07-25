# Agent Skills

Collection of custom agent skills and automation tools.

## 🔄 Syncing Skills

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

## 📚 Skill Directory

| Skill | Purpose | Key Triggers | Primary Output | Dependencies |
| :--- | :--- | :--- | :--- | :--- |
| [**`create-pull-request`**](skills/create-pull-request/SKILL.md) | Automates git diff inspection, test verification, PR template population, and PR creation via `gh`. | `"create pull request"`, `"open a PR"`, `"submit PR"`, `"create PR"` | GitHub Pull Request via `gh` | `git`, `gh` (GitHub CLI) |
| [**`engineering-report`**](skills/engineering-report/SKILL.md) | Generates interactive HTML status dashboards sourcing live data from Slack, Jira, and GitHub. | `"engineering report"`, `"status report"`, `"eng report"`, `"how is <team> doing"` | Interactive HTML Dashboard (`.html`) | `gh` (GitHub CLI), Slack API, Jira API |

---

## 📂 Repository Structure

```text
agent-skills/
├── .agents/
│   └── skills/
│       └── add-skill-to-readme/
│           └── SKILL.md
├── skills/
│   ├── create-pull-request/
│   │   └── SKILL.md
│   └── engineering-report/
│       └── SKILL.md
├── .gitignore
├── LICENSE
├── README.md
├── package.json
└── sync.js
```
