---
name: add-skill-to-readme
description: Automates registering and documenting a new or updated agent skill in the README.md skills directory. Triggers whenever the user requests to add a skill to README.md, document a skill in README.md, register a new skill, or update the skills directory. Inspects the target skill's SKILL.md, parses its YAML frontmatter, triggers, and workflows, updates the Skill Directory index table, and updates the repository structure tree in README.md.
---

# Add Skill to README

This skill automates inspecting a new or modified agent skill in `skills/<skill-name>/` and registering it cleanly into `README.md`. It keeps the **Skill Directory** index table and **Repository Structure** tree in `README.md` synchronized and properly formatted.

## Workflow

### 1. Identify Target Skill
- Determine the target skill name or directory from the user's prompt (e.g., `skills/<skill-name>`).
- If not specified, list subdirectories in `skills/` using `list_dir` to identify un-documented or modified skills.
- Verify that `skills/<skill-name>/SKILL.md` exists.

### 2. Inspect & Parse Skill Metadata
- Read `skills/<skill-name>/SKILL.md` using `view_file`.
- Extract key metadata:
  - **YAML Frontmatter**: `name` and `description`.
  - **Purpose**: Short 1-sentence summary of what the skill accomplishes.
  - **Triggers**: Specific keyword phrases and user prompt patterns mentioned in the description or trigger section.
  - **Primary Output**: Main output produced (e.g. Pull Request URL, HTML Dashboard, local config file, markdown document).
- Check for subdirectories and supporting files:
  - Check if `references/`, `assets/`, or `scripts/` exist using `list_dir`.

### 3. Inspect Current README.md
- Read `README.md` using `view_file`.
- Identify the insertion points for:
  1. `## 📚 Skill Directory` index table.
  2. `## 📂 Repository Structure` tree.

### 4. Format New Skill Documentation
- **Table Row Format**:
  ```markdown
  | [**`<skill-name>`**](skills/<skill-name>/SKILL.md) | <Purpose> | `<trigger-1>`, `<trigger-2>` | <Primary Output> |
  ```

### 5. Update and Verify README.md
- Update `README.md` using `replace_file_content` or `write_to_file`.
- Ensure proper table column alignment and relative link correctness (`skills/<skill-name>/SKILL.md`).
- Output a concise summary of the updated sections in `README.md` to the user.
