# Task 04: Implement direct team purchase API

Follow `AGENTS.md` and `docs/codex/PYT_CONTEXT.md`.

Goal: implement only direct team purchase for an existing PYT team slot.

Modify only if necessary:

- `pyt_back/src/main/java/com/pyt/controller/PytController.java`
- `pyt_back/src/main/java/com/pyt/service/PytService.java`
- PYT repository files if a required method is missing

Implement:

- `POST /api/pyt/{pytId}/teams/{teamSlotId}/join?userId={userId}`

Temporary auth rule:

- Use request param `String userId` for now.
- Keep service signature as `joinTeam(Long pytId, Long teamSlotId, String userId)`.
- Do not implement JWT filter or security changes in this task.

Requirements:

1. Look up `PytBreak`, `PytTeamSlot`, and `User`.
2. Validate the slot belongs to the given PYT.
3. Validate the slot status is `AVAILABLE`.
4. Change slot status to `SOLD`.
5. Set `buyerUser` on the slot.
6. Create `PytEntry`.
7. Store `paidAmount` from the team slot price.
8. Store entry status as `PytEntryStatus.PAID`.
9. Leave a TODO comment for future sold-out/ready status transition.
10. Use `@Transactional`.
11. Do not implement filler logic in this task.
12. Run `cd pyt_back && ./gradlew compileJava`.
13. Summarize changed files and validation result.
