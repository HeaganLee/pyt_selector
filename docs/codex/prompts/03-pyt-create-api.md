# Task 03: Implement PYT create API

Follow `AGENTS.md` and `docs/codex/PYT_CONTEXT.md`.

Goal: implement only PYT creation.

Modify only if necessary:

- `pyt_back/src/main/java/com/pyt/controller/PytController.java`
- `pyt_back/src/main/java/com/pyt/service/PytService.java`
- PYT repository files if a required method is missing

Reference DTOs:

- `PytCreateReqDto`
- `PytTeamPriceReqDto`

Implement:

- `POST /api/pyt`

Requirements:

1. The request contains `cardProductOptionId`, `title`, `breakUnitType`, `roundNo`, `boxCount`, `fillerEnabled`, and `teamPrices`.
2. Look up `CardProductOption`; throw `IllegalArgumentException` if missing.
3. Convert `breakUnitType` string to `BreakUnitType` enum.
4. Create `PytBreak` with `PytStatus.OPEN`.
5. For each `teamPrices` item, look up `SportsTeam` and create a `PytTeamSlot`.
6. New `PytTeamSlot` status must be `PytTeamSlotStatus.AVAILABLE`.
7. Reject empty team prices, missing team ids, missing prices, and prices less than or equal to zero.
8. Return the created `pytId`.
9. Use `@Transactional`.
10. Do not implement join or filler logic in this task.
11. Run `cd pyt_back && ./gradlew compileJava`.
12. Summarize changed files and validation result.
