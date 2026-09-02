---
name: gh-resolve-pull-request-feedback
description: Automates fetching unresolved pull request review comments and review threads using `gh` CLI, addressing requested changes directly in the codebase, verifying updates with tests, posting inline replies back to each PR review thread (resolved vs skipped), and generating a markdown summary report. Triggers whenever the user requests to resolve PR review comments, address PR review comments, handle code review feedback, reply to PR comments, resolve pull request feedback, or fix PR review items in a GitHub repository.
---

# Resolve Pull Request Feedback

This skill automates pulling unresolved code review comments and review threads from a GitHub Pull Request using the GitHub CLI (`gh`), inspecting target files, addressing requested changes in the codebase, running test suites for verification, and replying to each review thread via `gh api` detailing resolution status and rationale.

## Workflow

### 1. Inspect GitHub CLI and Repository Context
- Verify that `gh` CLI is installed and authenticated:
  ```bash
  gh auth status
  ```
- Verify git repository context and active PR / branch details:
  ```bash
  gh repo view --json nameWithOwner,defaultBranchRef,name,owner
  gh pr view --json number,title,headRefName,baseRefName,url,state
  ```
- If no active PR is associated with the current branch, ask the user for the target PR number or URL, or list open PRs:
  ```bash
  gh pr list --json number,title,headRefName,updatedAt --limit 10
  ```

### 2. Fetch Unresolved PR Review Threads via GitHub GraphQL API (`gh api graphql`)
- Query GitHub's GraphQL API to extract review threads for the active PR:
  ```bash
  gh api graphql -f query='
    query($owner: String!, $repo: String!, $prNumber: Int!) {
      repository(owner: $owner, name: $repo) {
        pullRequest(number: $prNumber) {
          id
          title
          url
          reviewThreads(first: 50) {
            nodes {
              id
              isResolved
              isOutdated
              path
              line
              originalLine
              comments(first: 10) {
                nodes {
                  id
                  databaseId
                  author { login }
                  body
                  createdAt
                }
              }
            }
          }
        }
      }
    }' -f owner="<owner>" -f repo="<repo>" -F prNumber=<pr_number>
  ```
- Filter the review threads to extract those where `isResolved == false`.
- **Empty State**: If no unresolved review threads exist:
  - Inform the user that all PR review comments are already resolved.
  - Output PR details and exit cleanly.

### 3. Present & Select Review Feedback (`ask_question` / Summary)
- Group unresolved review comments by file path and review thread.
- If multiple review threads exist, present them to the user via `ask_question` (or address all unresolved items as requested by the user):
  - **Question**: `"Select PR review feedback items to address:"`
  - **Options**: Formatted review thread choices e.g., `"Thread #<id> in <path>:<line> by @<author>: <truncated_body>"`
  - **IsMultiSelect**: `true`

### 4. Codebase Analysis & Code Edits
- For each selected unresolved review thread:
  - Inspect the relevant file path (`path`) and line numbers (`line` or `originalLine`) using `view_file` or `grep_search`.
  - Evaluate the reviewer's request (`comments[].body`) against existing implementation logic.
  - Determine whether the request should be:
    - **Addressed**: Code modification is required and valid. Make edits using `replace_file_content` or `write_to_file`.
    - **Skipped**: Request is out of scope, contains invalid assumptions, or represents a conscious design trade-off. Prepare a clear explanation.

### 5. Verification & Test Suite Execution
- Run appropriate project build and test commands (e.g., `npm test`, `pytest`, `go test`, `cargo test`, `sync.js` execution) to verify code edits:
  ```bash
  npm test
  ```
- Ensure no test regressions were introduced by the code changes.

### 6. Post Inline Replies to PR Review Threads (`gh api`)
- For each processed review thread, use `gh api` to post an inline reply to the thread's last comment or reply using GitHub's REST API endpoint:
  ```bash
  gh api \
    --method POST \
    -H "Accept: application/vnd.github+json" \
    /repos/<owner>/<repo>/pulls/<pr_number>/comments/<comment_databaseId>/replies \
    -f body="<Reply text>"
  ```
- **Reply Formatting Standard**:
  - **Resolved Status**:
    ```markdown
    ✅ **Addressed**: <Summary of code changes made>.
    - **Files Modified**: `<path>`
    - **Verification**: Verified with test suite (`<test_command>`).
    ```
  - **Skipped Status**:
    ```markdown
    ℹ️ **Skipped**: <Detailed, polite rationale for skipping the request>.
    ```

### 7. Optional Thread Resolution & Final Summary Report
- Optionally resolve thread on GitHub GraphQL API if authorized:
  ```bash
  gh api graphql -f query='
    mutation($threadId: ID!) {
      resolveReviewThread(input: {threadId: $threadId}) {
        thread { isResolved }
      }
    }' -f threadId="<thread_node_id>"
  ```
- Present a Markdown summary report to the user:
  - **PR Details**: Link to PR and total unresolved threads processed.
  - **Summary Table**:
    | File | Line | Reviewer | Status | Action Taken / Rationale |
    | :--- | :--- | :--- | :--- | :--- |
    | `<path>` | `<line>` | `@<author>` | `Resolved` / `Skipped` | `<summary>` |
  - **Verification Results**: Test outputs and status.

## Example CLI Usage & GraphQL API Query

### CLI Command to Fetch Unresolved Threads:
```bash
gh api graphql -f query='
  query($owner: String!, $repo: String!, $prNumber: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $prNumber) {
        reviewThreads(first: 50) {
          nodes {
            id
            isResolved
            path
            line
            comments(first: 5) {
              nodes { id databaseId author { login } body }
            }
          }
        }
      }
    }
  }' -f owner="Polyneue" -f repo="agent-skills" -F prNumber=10
```

### CLI Command to Reply to Review Comment:
```bash
gh api \
  --method POST \
  -H "Accept: application/vnd.github+json" \
  /repos/Polyneue/agent-skills/pulls/10/comments/123456789/replies \
  -f body="✅ **Addressed**: Added input validation and unit tests for edge cases."
```
