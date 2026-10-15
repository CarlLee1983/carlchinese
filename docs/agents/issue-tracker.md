# Issue Tracker: GitHub

Issues and specs live in CarlLee1983/carlchinese on GitHub.
Use authenticated `gh` with an explicit `--repo CarlLee1983/carlchinese`.

## Operations

- Publish a spec: create an issue using `gh issue create`.
- For multiline bodies, write a temporary file and use `--body-file`.
- Read a ticket: `gh issue view <number> --json number,title,body,labels,comments`.
- Find work: `gh issue list` with appropriate state and label filters.
- Change labels: `gh issue edit <number> --add-label <label>`.
- Verify each authorized write by reading the resulting remote state.

Use native sub-issues and dependencies when supported. Otherwise,
record parent and blocker issue links explicitly in the issue body.

## Historical Records

Existing `.scratch/carlchinese/` tickets remain local historical records.
Track new work on GitHub; do not migrate or delete historical tickets
without a separate request.

## Pull Requests as a Triage Surface

PRs as a request surface: no.
