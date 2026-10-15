# Repository Guidelines

## Project Structure & Module Organization

CarlChinese is a Traditional Chinese reading project for Taiwanese readers. The repository currently contains content and specifications; application source, tests, and website assets are not yet implemented.

- `content/tang300/`: three sample works with YAML frontmatter and Markdown bodies.
- `docs/content-map.md`: content scope and series organization.
- `docs/content-guide.md` and `docs/content-schema.md`: editorial and data contracts.
- `docs/reading-page-handoff.md`: implementation scope, acceptance criteria, and outstanding checks.
- `CONTEXT.md`: authoritative domain vocabulary; `docs/adr/`: accepted architectural decisions.
- `.scratch/`: ignored historical planning tickets; preserve existing records.

## Build, Test, and Development Commands

No `package.json`, build scripts, formatter, or test runner is configured yet.

- `git status --short`: inspect existing work before editing.
- `git diff --check`: detect whitespace errors in tracked changes; inspect new files separately.
- `git diff`: review the final change for unintended edits.

Astro, pnpm, `node --test`, Playwright, and `pnpm run verify` are planned. Verify dependency compatibility and establish scripts before documenting these as runnable commands.

## Content Style & Naming Conventions

Write reader-facing content in Traditional Chinese using `CONTEXT.md` terminology. Follow existing YAML indentation and the schema's section ordering and Chinese directives.

Name works with a three-digit base-edition number and common title, such as `099-春望.md`; grouped poems add `-其一`. Preserve stable series-plus-number identities. Register sources once per work and reference their IDs. Keep factual claims, literary interpretation, and teaching imagination visibly distinct.

## Testing Guidelines

For current documentation changes, check relative links, schema consistency, and the final diff. No coverage threshold or test filename convention exists yet.

Future automated checks must cover content validation, complete rendering, navigation, and mobile/desktop behavior. Use the three real samples and separate, nonpublic group-poem fixtures. Report checks actually performed; structural validation does not establish source accuracy or successful parent-child reading.

## Commit & Pull Request Guidelines

Recent history uses `docs: <concise Traditional Chinese summary>`. Keep changes focused and preserve unrelated work. PR descriptions should explain scope, link the relevant issue, and report validation; include screenshots for future visual changes. Obtain authorization before committing, pushing, or publishing.

## Agent skills

### Issue tracker

Use GitHub Issues for this repository. Read `docs/agents/issue-tracker.md`
before tracker operations.

### Triage labels

Use the five canonical triage roles. Read `docs/agents/triage-labels.md`
before applying labels.

### Domain docs

This is a single-context repository. Read `docs/agents/domain.md`
before domain exploration or design changes.
