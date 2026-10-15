# Repository Guidelines

## Project Structure & Module Organization

CarlChinese is a Traditional Chinese reading project for Taiwanese readers. The repository contains an Astro static reading site, content, specifications, and Node/Playwright tests.

- `content/tang300/`: a 313-work catalogue and three readable sample works with YAML frontmatter and Markdown bodies.
- `src/`: the content loader, reading components, and static pages; `tests/`: Node and browser tests, including a private group-poem fixture.
- `docs/content-map.md`: content scope and series organization.
- `docs/content-guide.md` and `docs/content-schema.md`: editorial and data contracts.
- `docs/reading-page-handoff.md`: implementation scope, acceptance criteria, and outstanding checks.
- `CONTEXT.md`: authoritative domain vocabulary; `docs/adr/`: accepted architectural decisions.
- `docs/toolchain.md`: local commands and build-output boundaries.
- `.scratch/`: ignored historical planning tickets and verification logs; preserve existing records.

## Build, Test, and Development Commands

Install and run the current toolchain using [docs/toolchain.md](docs/toolchain.md). `pnpm run verify` runs Astro checks, content validation, Node tests, a production build, the isolated group-poem fixture build/test, and production browser tests. The fixture output is not deployable content.

- `git status --short`: inspect existing work before editing.
- `git diff --check`: detect whitespace errors in tracked changes; inspect new files separately.
- `git diff`: review the final change for unintended edits.

## Content Style & Naming Conventions

Write reader-facing content in Traditional Chinese using `CONTEXT.md` terminology. Follow existing YAML indentation and the schema's section ordering and Chinese directives.

Name works with a three-digit base-edition number and common title, such as `098-春望.md`; grouped poems add `-其一`. Preserve stable series-plus-number identities. Register sources once per work and reference their IDs. Keep factual claims, literary interpretation, and teaching imagination visibly distinct.

## Testing Guidelines

For documentation changes, check relative links, schema consistency, and the final diff. No coverage threshold is set.

Automated checks cover content validation, complete rendering, navigation, and mobile/desktop behavior using the three real samples and separate, nonpublic group-poem fixtures. Report checks actually performed; structural validation does not establish source accuracy or successful parent-child reading.

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
