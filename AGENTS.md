# AGENTS.md

## Project

This repository contains two apps:

- `pyt_back`: Spring Boot backend
- `pyt_front`: Next.js frontend

The main product domain is sports card PYT breaks. Treat `PytBreak` as the parent aggregate for PYT workflows.

## Backend conventions

- Use Java 19 and Spring Boot conventions already present in `pyt_back`.
- Keep backend API paths under `/api`.
- Prefer DTO responses over returning JPA entities directly.
- Put controller code in `com.pyt.controller`.
- Put business logic in `com.pyt.service`.
- Put persistence queries in `com.pyt.repository`.
- Use existing enums and entity fields before introducing new ones.
- Use `@Transactional(readOnly = true)` for read methods.
- Use `@Transactional` for write methods.
- Use `IllegalArgumentException` for simple domain validation errors.
- Do not add global exception handling unless explicitly requested.
- Do not change unrelated auth/security code unless the task explicitly asks for it.
- Do not rename existing DTOs, entities, packages, or enum values unless the task explicitly asks for it.

## Frontend conventions

- The frontend app lives in `pyt_front`.
- PYT pages live under `pyt_front/app/(routes)/pyt`.
- When connecting frontend APIs, keep response fields compatible with the existing mock data shape unless the task asks for a DTO redesign.
- Do not replace the whole page when a small API connection change is enough.

## PYT domain map

- `PytBreak`: parent PYT break.
- `PytTeamSlot`: one sellable team slot in a PYT break.
- `PytEntry`: direct team purchase record.
- `PytFiller`: filler event created from selected available team slots.
- `PytFillerTeam`: mapping between a filler and its target team slots.
- `PytFillerEntry`: later participant records for filler entries.
- `CardProductOption`: product option used when creating a PYT break.
- `SportsTeam`: team selectable in a PYT break.
- `User.id` is a `String` UUID, not `Long`.

## Target PYT MVP APIs

Use these backend paths for the first MVP:

- `GET /api/pyt`
- `GET /api/pyt/create-data`
- `POST /api/pyt`
- `GET /api/pyt/{pytId}`
- `POST /api/pyt/{pytId}/teams/{teamSlotId}/join`
- `POST /api/pyt/{pytId}/fillers`

Keep filler entry and filler assignment for a later task unless explicitly requested.

## Token-saving workflow

Before editing:

1. Read this file.
2. Read `docs/codex/PYT_CONTEXT.md` if the task is about PYT.
3. Read only the files listed by the current task or by the context map.
4. Do not scan the entire repository unless the task cannot be completed otherwise.

While editing:

- Make small, focused changes.
- Avoid unrelated refactors.
- Preserve existing DTO and entity structure where possible.
- Prefer adding repository methods over embedding complex persistence logic in services.

After editing:

- Summarize changed files.
- Run the smallest useful validation command.
- For backend-only changes, prefer `cd pyt_back && ./gradlew compileJava` first.
- For frontend-only changes, prefer `cd pyt_front && npm run lint` first.
