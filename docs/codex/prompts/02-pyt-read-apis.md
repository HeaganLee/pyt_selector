# Task 02: Implement PYT read APIs

Follow `AGENTS.md` and `docs/codex/PYT_CONTEXT.md`.

Goal: implement only PYT read APIs.

Modify only if necessary:

- `pyt_back/src/main/java/com/pyt/controller/PytController.java`
- `pyt_back/src/main/java/com/pyt/service/PytService.java`
- PYT repository files created in Task 01

Reference DTOs:

- `PytListItemRespDto`
- `PytDetailRespDto`
- `PytCreateDataRespDto`
- `PytProductOptionRespDto`
- `PytTeamRespDto`
- `PytTeamSlotRespDto`

Implement:

- `GET /api/pyt`
- `GET /api/pyt/create-data`
- `GET /api/pyt/{pytId}`

Requirements:

1. Change `PytController` base mapping to `/api/pyt`.
2. Implement controller methods with simple try/catch like existing controllers.
3. `getPytList` returns `List<PytListItemRespDto>`.
4. `totalTeamCount` is the number of team slots for the PYT.
5. `remainingTeamCount` is the number of team slots whose status is `AVAILABLE`.
6. `getCreateData` returns all product options and all sports teams using existing DTOs.
7. `getPytDetail` returns one PYT and its team slots.
8. Service read methods use `@Transactional(readOnly = true)`.
9. Do not implement create, join, or filler logic in this task.
10. Run `cd pyt_back && ./gradlew compileJava`.
11. Summarize changed files and validation result.
