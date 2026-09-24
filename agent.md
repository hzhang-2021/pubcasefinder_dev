# AGENTS.md

## Project
 PanelSearch nanbyo
Flask + MySQL application.

## mysql schema
 table defined at files below sql

## Development rules
- Use Python 3.
- Keep changes minimal.
- Do not modify unrelated files.
- Do not change database schema unless explicitly requested.
- Preserve existing coding style.
- Do not introduce new dependencies without approval.

## Testing
E2E tests are under:
tests/e2e/

Run E2E tests with:
uv run pytest --browser=chromium

## Important
- Do not modify production configuration.
- Do not commit secrets or authentication state.
- When fixing a bug, first identify the root cause.
- Only modify files necessary for the requested change.