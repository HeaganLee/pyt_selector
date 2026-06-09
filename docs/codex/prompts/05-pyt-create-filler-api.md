# Task 05: Implement filler creation API

Follow `AGENTS.md` and `docs/codex/PYT_CONTEXT.md`.

Goal: implement only filler creation from selected available PYT team slots.

Modify only if necessary:

- `pyt_back/src/main/java/com/pyt/controller/PytController.java`
- `pyt_back/src/main/java/com/pyt/service/PytService.java`
- PYT repository files if a required method is missing

Reference DTO:

- `PytFillerCreateReqDto`

Implement:

- `POST /api/pyt/{pytId}/fillers`

Requirements:

1. Look up `PytBreak`.
2. Reject if `pytBreak.fillerEnabled` is false.
3. Reject empty `teamSlotIds`.
4. Reject `slotCount` if null or less than or equal to zero.
5. Look up all requested `PytTeamSlot` rows.
6. Validate all requested slots exist.
7. Validate all requested slots belong to the given PYT.
8. Validate all requested slots have status `AVAILABLE`.
9. Sum selected team slot prices as `totalTeamPrice`.
10. Compute `pricePerSlot` as `ceil(totalTeamPrice / slotCount)`.
11. Create `PytFiller`.
12. Change each selected team slot to `FILLER_TARGET` and set `fillerTarget` to true.
13. Create `PytFillerTeam` rows connecting the filler and target slots.
14. Change `PytBreak` status to `FILLER_OPEN`.
15. Return the created `fillerId`.
16. Use `@Transactional`.
17. Do not implement filler entries or random assignment in this task.
18. Run `cd pyt_back && ./gradlew compileJava`.
19. Summarize changed files and validation result.
