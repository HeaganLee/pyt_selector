# Task 01: Add PYT repositories

Follow `AGENTS.md` and `docs/codex/PYT_CONTEXT.md`.

Goal: add only the repository layer needed for PYT MVP.

Inspect only these files first:

- `pyt_back/src/main/java/com/pyt/entities/PytBreak.java`
- `pyt_back/src/main/java/com/pyt/entities/PytTeamSlot.java`
- `pyt_back/src/main/java/com/pyt/entities/PytEntry.java`
- `pyt_back/src/main/java/com/pyt/entities/PytFiller.java`
- `pyt_back/src/main/java/com/pyt/entities/PytFillerEntry.java`
- `pyt_back/src/main/java/com/pyt/entities/PytFillerTeam.java`
- `pyt_back/src/main/java/com/pyt/entities/CardProductOption.java`
- `pyt_back/src/main/java/com/pyt/entities/SportsTeam.java`
- `pyt_back/src/main/java/com/pyt/entities/User.java`
- `pyt_back/src/main/java/com/pyt/repository/UserRepository.java`
- Existing repository files in `pyt_back/src/main/java/com/pyt/repository`

Create these files if missing:

- `PytBreakRepository.java`
- `PytTeamSlotRepository.java`
- `PytEntryRepository.java`
- `PytFillerRepository.java`
- `PytFillerEntryRepository.java`
- `PytFillerTeamRepository.java`
- `CardProductOptionRepository.java`
- `SportsTeamRepository.java`

Requirements:

1. Add Spring Data JPA repository interfaces only.
2. Do not edit controller, service, DTO, enum, or entity files.
3. Use the existing package `com.pyt.repository`.
4. `PytBreakRepository` should include a fetch-join method for detail reads with `cardProductOption` and `cardProduct`.
5. `PytTeamSlotRepository` should include methods to find slots by `pytBreak.id`, including one fetch-joining `team` and `buyerUser`.
6. Add methods useful for counting total team slots and available team slots by `pytBreak.id`.
7. Run `cd pyt_back && ./gradlew compileJava`.
8. Summarize changed files and validation result.
