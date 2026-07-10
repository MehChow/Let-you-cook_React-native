---
name: feature-handoff-documentation
description: Create concise, source-backed handoff documentation for completed software features. Use when wrapping up feature implementation, documenting behavior for future developers, recording architecture and data flow, explaining frontend/backend contracts, or creating a feature guide under a repository's docs/ directory.
---

# Feature Handoff Documentation

Create a durable Markdown handoff for a completed feature so another developer can understand how it works, where it lives, how it is tested, and what remains for integration or follow-up.

## Workflow

1. Inspect the repository before writing:
   - Read project guidance such as `AGENTS.md`.
   - Check `git status --short` and recent relevant commits.
   - Locate feature entry points, state/storage modules, API clients, routes, tests, and existing docs with `rg`/`rg --files`.
   - Read the relevant implementation files rather than inferring behavior from filenames.

2. Define the handoff scope:
   - Name the user-visible capability and its boundaries.
   - Separate implemented behavior from planned backend, native, or provider integration.
   - Preserve existing repository terminology and folder conventions.

3. Write the handoff in the repository's `docs/` area:
   - Prefer `docs/<domain>/<feature>-flow.md` for a feature guide.
   - Use `docs/<domain>/<feature>-setup.md` for integration/setup guidance.
   - Keep the document standalone; link to source files with repository-relative paths.
   - Do not modify README screenshots, changelogs, or unrelated docs unless requested.

4. Verify the handoff:
   - Check every claim against current source and tests.
   - Identify persistence keys, lifecycle transitions, navigation states, API inputs/outputs, failure behavior, and security boundaries when applicable.
   - State what is mocked, placeholder, client-only, or not yet implemented.
   - Run `git diff --check` and inspect `git status --short`.
   - Run the feature's focused tests when the documentation is based on a just-completed implementation.

## Required Content

Include only sections that apply, but cover these topics when relevant:

- **Purpose and scope:** what the feature does and what it does not do.
- **Entry points:** screens, routes, commands, or public functions.
- **User flow:** numbered steps from entry through success, cancellation, retry, and failure.
- **Architecture:** modules and their responsibilities, with exact source paths.
- **State and persistence:** stored fields, keys, hydration, expiry, reset, and lifecycle behavior.
- **Data flow:** how user input moves through hooks, stores, API clients, and screens.
- **API contract:** endpoint, request/response shape, error/rate-limit behavior, and future integration seams.
- **Security boundaries:** what the client must not trust or store, especially tokens, OTPs, secrets, and server authority.
- **Testing expectations:** existing test files, important scenarios, and verification commands.
- **Known limitations and follow-up:** distinguish confirmed limitations from speculative ideas.

## Documentation Rules

- Prefer concrete behavior over process commentary.
- Use exact names for files, functions, storage keys, route params, and API fields.
- Explain why non-obvious state exists, especially temporary navigation modes and persisted flow state.
- Document both normal and interrupted flows: back navigation, app restart, expired state, duplicate actions, and failed requests.
- For frontend/backend features, describe the handoff in both directions: what the frontend currently assumes and what the backend must guarantee.
- Never claim a backend integration exists when the current code still uses a placeholder.
- Do not store secrets or real user data in the documentation.

## Output Shape

Use a compact structure such as:

```markdown
# Feature name

## Scope
## Entry points
## User flow
## Architecture and data flow
## Persistence and lifecycle
## API/backend integration
## Failure and edge cases
## Testing
## Limitations and follow-up
```

Use repository-relative links or code spans for source paths. Keep examples minimal and representative.

## Reference Template

For a fuller starting structure, read [feature-handoff-template.md](references/feature-handoff-template.md).
