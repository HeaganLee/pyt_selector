# PYT Codex Harness

This harness breaks the PYT backend work into small Codex tasks. Run the prompts in order. Each prompt tells Codex which files to inspect and what not to change.

## How to run

From the repository root:

```bash
codex
```

Then paste one prompt from `docs/codex/prompts` at a time.

## Validation commands

Backend compile check:

```bash
cd pyt_back && ./gradlew compileJava
```

Backend full build:

```bash
cd pyt_back && ./gradlew clean build
```

Frontend lint check:

```bash
cd pyt_front && npm run lint
```

Frontend build check:

```bash
cd pyt_front && npm run build
```

## Recommended order

1. `01-pyt-repositories.md`
2. `02-pyt-read-apis.md`
3. `03-pyt-create-api.md`
4. `04-pyt-join-team-api.md`
5. `05-pyt-create-filler-api.md`
6. `06-pyt-frontend-api-connect.md`

## Operating rules

- One prompt per Codex session/task is preferred.
- If Codex proposes unrelated refactors, reject them.
- Keep entity changes out of the first pass.
- Run compile after backend changes.
- Connect frontend only after backend response shapes are stable.
