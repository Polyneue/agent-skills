---
name: gh-select-issue
description: Automates fetching open GitHub issues for the current repository using the `gh` CLI and presenting them via `ask_question` for interactive selection. Triggers whenever the user requests to select an issue, pick an issue to work on, pull open issues, view open repo issues, start working on an issue, or work on an issue in a GitHub repository. Verifies `gh` CLI auth and repository context, fetches open issues, prompts the user to choose an issue via `ask_question`, retrieves full issue details via `gh issue view`, and presents the issue details along with an implementation action plan.
---

# Select Issue to Work On

This skill automates pulling open GitHub issues for the current repository using the GitHub CLI (`gh`), presenting them interactively using `ask_question`, and retrieving comprehensive issue details to prepare an action plan for execution.

## Workflow

### 1. Inspect GitHub CLI and Repository Context
- Verify that `gh` CLI is installed and authenticated:
  ```bash
  gh auth status
  ```
- Verify git repository context and remote details:
  ```bash
  gh repo view --json nameWithOwner,defaultBranchRef,name,owner
  ```
- If not inside a GitHub repository or unauthenticated, inform the user with actionable instructions to log in (`gh auth login`) or navigate to a valid repo workspace.

### 2. Fetch Open Issues via GitHub CLI (`gh`)
- Fetch open issues for the repository in JSON format:
  ```bash
  gh issue list --json number,title,labels,state,author,updatedAt --limit 30
  ```
- **Empty State**: If no open issues are returned:
  - Inform the user that there are currently no open issues in the repository.
  - Suggest creating a new issue using the `gh-create-issue` skill or entering an issue number manually.

### 3. Present Issues via Interactive UI (`ask_question`)
- Parse the JSON output from `gh issue list`.
- Format each issue into a concise, readable option string for `ask_question`:
  ```text
  "#<number>: <title> [<label1>, <label2>]"
  ```
  *(Omit labels bracket if no labels are present).*
- Invoke `ask_question` with a question structure like:
  - **Question**: `"Select an open GitHub issue to start working on:"`
  - **Options**: List of formatted issue option strings.
  - **IsMultiSelect**: `false`

### 4. Fetch Full Issue Details
- Parse the selected option from `ask_question` (or user write-in response) to extract the issue number `<number>`.
- Fetch complete issue information using `gh issue view`:
  ```bash
  gh issue view <number>
  ```
  *(Or optionally `--json number,title,body,labels,state,author,url,comments` for detailed parsing).*

### 5. Present Issue Summary and Formulate Action Plan
- Render a clean Markdown summary of the selected issue:
  - **Issue Number & Title**: `#<number>: <title>`
  - **URL**: Direct markdown link to the GitHub issue.
  - **Labels & Author**: Author handle and assigned labels.
  - **Description**: Full body text of the issue.
- Formulate and present immediate next steps to begin working on the task:
  1. **Branch Creation**: Suggest a Git branch name following standard conventions (e.g. `feat/issue-<number>-<short-description>` or `fix/issue-<number>-<short-description>`).
  2. **Task Breakdown**: Outline key requirements, affected files, and implementation steps derived from the issue description.
  3. **Execution Plan**: Confirm with the user to create the feature branch and begin implementation.

## Example Output & Interaction

### CLI Commands Executed:
```bash
gh auth status
gh repo view --json nameWithOwner,defaultBranchRef
gh issue list --json number,title,labels,state,author,updatedAt --limit 30
```

### `ask_question` Tool Call:
```json
{
  "questions": [
    {
      "question": "Select an open GitHub issue to start working on:",
      "options": [
        "#3: [FEAT] Add issue selection skill using GitHub CLI and ask_question [enhancement]",
        "#7: [BUG] Fix memory leak in background worker [bug, high-priority]"
      ],
      "is_multi_select": false
    }
  ]
}
```

### Final Issue Details View:
```bash
gh issue view 3
```
