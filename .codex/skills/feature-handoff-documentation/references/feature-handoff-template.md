# [Feature name]

## Scope

State the user-visible capability, the implementation boundary, and explicit exclusions.

## Entry points

List the routes, screens, hooks, commands, or public APIs a developer should inspect first.

## User flow

Describe the normal path as numbered steps, followed by interrupted and recovery paths.

## Architecture and data flow

Explain each important module and how data moves between UI, state, persistence, and API boundaries.

| Responsibility | Source path | Notes |
| --- | --- | --- |
| UI entry point | `src/...` | User interaction and visible state |
| State/hook | `src/...` | Transitions and guards |
| Persistence | `src/...` | Keys, hydration, expiry |
| API boundary | `src/...` | Current or future request contract |

## Persistence and lifecycle

Document stored fields and keys, when they are created, updated, restored, expired, cleared, or intentionally retained. Include app restart and back-navigation behavior.

## API/backend integration

Separate current frontend behavior from future backend requirements. Include request/response examples, server-authoritative fields, error handling, rate limits, and security constraints.

## Failure and edge cases

Cover validation errors, failed requests, duplicate actions, stale state, missing state, expired state, and interrupted navigation.

## Testing

List focused test files and the behavior each one protects. Include exact verification commands when known.

## Limitations and follow-up

Record confirmed gaps only. Mark placeholders and future integration work explicitly; do not present planned behavior as implemented.
