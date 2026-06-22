---
name: commit-workflow
description: Commits staged changes following the YAML convention (English only)
compatible: [opencode, antigravity]
---

# Commit Assistant

Generates and executes commits following the conventions in `AGENTS.md`.

## Workflow

### 1. Inspect

Run:
```bash
git status
git diff --cached --stat
```

If nothing is staged, show unstaged changes with `git diff --stat` and ask the user which files to stage (`git add <file>`). Do **not** add files without permission.

### 2. Classify

Map the change to exactly one `type`:

| Type       | When to use                                                     |
|------------|-----------------------------------------------------------------|
| `feat`     | New feature for the user                                        |
| `fix`      | Bug fix for the user                                            |
| `refactor` | Code change that neither fixes nor adds a feature               |
| `test`     | Adding or correcting tests                                      |
| `docs`     | Documentation only                                              |
| `style`    | Formatting, missing semicolons, etc. — no production code change|
| `chore`    | Build, CI, or tooling changes                                   |
| `perf`     | Performance improvement                                         |
| `ci`       | CI/CD configuration changes                                     |
| `build`    | Build system or dependency changes                              |

### 3. Describe

Analyze every staged file and write a description in **English** for each logical change. If multiple files belong to the same change, group them under one description.

### 4. Generate YAML

Strictly follow the convention from `AGENTS.md`:

```yaml
type: <one type>
file: <single-file> | files: [<multiple-files>]
description: <string> | [<multiple-descriptions>]
```

Rules:
- `type` is always required (one of the 10 types above)
- Use `file` (singular) for one file, `files` (plural list) for multiple
- `description` can be a string or a list of strings
- **English only** — all descriptions must be in English
- No quotes around YAML values

### 5. Present and Confirm

Show the generated YAML to the user. Use the `question` tool to ask for approval before committing.

### 6. Execute

Only after explicit user approval, run:

```bash
git commit -m "<formatted YAML>"
```

Important: the YAML must be inlined as a single argument to `-m`. Use `\n` for line breaks inside the message string.

### Guardrails

- Do **not** run `git push`
- Do **not** switch branches
- Do **not** stage files without asking
- Do **not** amend commits
- If `git commit` fails (e.g. hooks reject), report the error and offer to fix
