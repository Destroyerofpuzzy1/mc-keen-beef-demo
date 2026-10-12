<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mandatory workflow for AI sessions (project rule)

The Markdown documentation is this project's persistent memory. Every AI session must follow these rules for every task, however small. (The block above is managed by Next.js; `next dev` only rewrites the text between its markers, so this section is kept.)

## Before starting

1. Check Git: `git fetch origin`, `git branch --show-current`, `git status` (current branch, uncommitted changes, sync with `origin`).
2. Read `docs/STATUS.md` (current state) and the newest entries of `CHANGELOG_AI.md` (what was asked and done before), then the topic docs relevant to the task (table below).
3. Find the exact place that needs changing with targeted searches (file, component, function names). No full-repository scans; never read `node_modules`, `.next` or generated files.
4. Propose the smallest safe change.

## While working

5. Work only on a dedicated feature branch. Never change files on `main`, `master` or `dev`.
6. No reset, stash, commit, push, merge or deployment without the user's explicit consent in chat for that action.
7. Run the relevant checks: `npm run lint`, `npm test`, `npm run build`. `npm run test:forms` needs a local server (see `tests/forms-api.test.mjs`); never point it at production. Do not run `npm run assets` unless `../source-assets` exists: it rewrites `public/photos`, `public/assets` and `public/documents`.

## Finishing: a task is not done until all of this is true

8. Documentation is updated in the same task:
   - `CHANGELOG_AI.md`: a new entry at the top for every finished task (template in that file).
   - `docs/STATUS.md`: current state (verification table, in progress, known issues, next steps).
   - Topic docs only where their content changed (table below).
9. `git diff --check` and `git status` have been run (check new, untracked files for trailing whitespace as well).
10. A report has been given to the user, in Polish. Then stop and wait.

Documentation rules:

- Document actual changes, not plans. A test is "passed" only if it was run in this session; otherwise write "not run" and why.
- History that cannot be verified is labelled "reconstructed, unverified".
- No duplication: each fact lives in one file; other files link to it.
- Code changed but documentation stale means the task is not finished.
- Documentation is written in English; reports to the user are in Polish.

## Where things are documented

| File | Holds |
|---|---|
| `docs/STATUS.md` | Current state: verification, completed, in progress, known issues, next steps |
| `CHANGELOG_AI.md` | History: one entry per finished task |
| `README.md` | Setup, scripts, environment, tests, deployment pointers |
| `docs/architecture.md` | Routing, rendering, directory structure, data model, i18n, forms, SEO |
| `docs/security.md` | Threat model, form/upload protection, headers, CSP, deployment checklist |
| `docs/client-confirmations.md` | Open questions for the client (`C-xx` ids used in code comments) |
| `docs/content-source-map.md` | Source of every fact shown on the site |
| `docs/asset-map.md` | Source and use of every image and document |
| `docs/gap-audit-2026-10-10.md` | Dated record of the rebuild gap audit (findings GAP-xx with evidence); their live status is the tracker in `docs/STATUS.md` |
| `docs/ux-audit-2026-10-11.md` | Dated record of the site functionality and information architecture audit (findings UXA-xx with evidence, user tasks, assets to replace); their live status is the UX audit tracker in `docs/STATUS.md` |
