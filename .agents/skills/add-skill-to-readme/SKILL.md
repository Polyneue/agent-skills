---
name: add-skill-to-readme
description: Automates registering a new skill or updating an existing skill's details in the README.md skills directory. Triggers whenever the user requests to add a skill to README.md, document a skill in README.md, register a new skill, update an existing skill's details in README.md, or update the skills directory. Inspects the target skill's SKILL.md, parses its YAML frontmatter, triggers, workflows, and dependencies, updates the Skill Directory index table, and updates the repository structure tree in README.md.
---

# Add or Update Skill in README

This skill automates inspecting a new or modified agent skill in `skills/<skill-name>/` and registering or updating its documentation cleanly in `README.md`. It keeps the **Skill Directory** index table (including Purpose, Triggers, Primary Output, and Dependencies) and **Repository Structure** tree in `README.md` synchronized and properly formatted.

## Workflow

### 1. Identify Target Skill & Action
- Determine the target skill name and operation (Add New vs. Update Existing) from the user's prompt or workspace changes.
- If not specified, list subdirectories in `skills/` using `list_dir` to identify undocumented or modified skills.
- Verify that `skills/<skill-name>/SKILL.md` exists.

### 2. Inspect & Parse Skill Metadata & Dependencies
- Read `skills/<skill-name>/SKILL.md` using `view_file`.
- Inspect any supporting scripts in `scripts/`, `references/`, or `assets/` if present.
- Extract key metadata:
  - **YAML Frontmatter**: `name` and `description`.
  - **Purpose**: Short 1-sentence summary of what the skill accomplishes.
  - **Triggers**: Specific keyword phrases and user prompt patterns mentioned in the description or workflow section.
  - **Primary Output**: Main output produced (e.g. Pull Request URL, HTML Dashboard, local config file, markdown document).
  - **Dependencies**: Identify required CLI tools, runtimes, or APIs referenced in the skill's instructions or scripts (e.g., `git`, `gh` (GitHub CLI), `Node.js`, `jq`, `yq`, `python`, `docker`, Slack API, Jira API). If no external CLI or API dependencies are required, specify `None`.

### 3. Inspect Current README.md
- Read `README.md` using `view_file`.
- Identify the insertion/update points for:
  1. `## 📚 Skill Directory` index table.
  2. `## 📂 Repository Structure` tree.

### 4. Format Skill Documentation
- **Table Row Format**:
  ```markdown
  | [**`<skill-name>`**](skills/<skill-name>/SKILL.md) | <Purpose> | `<trigger-1>`, `<trigger-2>` | <Primary Output> | `<dependency-1>`, `<dependency-2>` |
  ```

### 5. Handle Action Cases

#### Case A: Registering a New Skill
- Format a new table row using the Table Row Format above.
- Insert the new row alphabetically into the `## 📚 Skill Directory` table.
- Add the new skill folder and its key files/subdirectories to the `## 📂 Repository Structure` tree.

#### Case B: Updating an Existing Skill
- Search for the row corresponding to `[**`<skill-name>`**]` in the `## 📚 Skill Directory` table.
- Replace the existing row with updated values for Purpose, Triggers, Primary Output, and Dependencies.
- Verify and update the `## 📂 Repository Structure` tree if files or folders within `skills/<skill-name>/` have changed.

### 6. Save and Verify README.md
- Update `README.md` using `replace_file_content` or `write_to_file`.
- Ensure proper table header formatting (`| Skill | Purpose | Key Triggers | Primary Output | Dependencies |`), column alignment, and relative link correctness (`skills/<skill-name>/SKILL.md`).
- Output a concise summary of the added or updated skill details in `README.md` to the user.
