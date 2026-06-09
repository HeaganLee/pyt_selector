# PYT Context Pack

Use this file as the minimal context pack for Codex tasks related to PYT. It exists to avoid repeatedly reading the whole repository.

## Relevant backend files

Controller/service:

- `pyt_back/src/main/java/com/pyt/controller/PytController.java`
- `pyt_back/src/main/java/com/pyt/service/PytService.java`

PYT DTOs:

- `pyt_back/src/main/java/com/pyt/dto/pyt/req/PytCreateReqDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/req/PytTeamPriceReqDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/req/PytFillerCreateReqDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytCreateDataRespDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytDetailRespDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytListItemRespDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytProductOptionRespDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytTeamRespDto.java`
- `pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytTeamSlotRespDto.java`

Entities:

- `pyt_back/src/main/java/com/pyt/entities/PytBreak.java`
- `pyt_back/src/main/java/com/pyt/entities/PytTeamSlot.java`
- `pyt_back/src/main/java/com/pyt/entities/PytEntry.java`
- `pyt_back/src/main/java/com/pyt/entities/PytFiller.java`
- `pyt_back/src/main/java/com/pyt/entities/PytFillerTeam.java`
- `pyt_back/src/main/java/com/pyt/entities/PytFillerEntry.java`
- `pyt_back/src/main/java/com/pyt/entities/CardProductOption.java`
- `pyt_back/src/main/java/com/pyt/entities/SportsTeam.java`
- `pyt_back/src/main/java/com/pyt/entities/User.java`

Enums:

- `pyt_back/src/main/java/com/pyt/enums/BreakUnitType.java`
- `pyt_back/src/main/java/com/pyt/enums/PytStatus.java`
- `pyt_back/src/main/java/com/pyt/enums/PytTeamSlotStatus.java`
- `pyt_back/src/main/java/com/pyt/enums/PytEntryStatus.java`
- `pyt_back/src/main/java/com/pyt/enums/FillerStatus.java`

Existing repositories to mirror:

- `pyt_back/src/main/java/com/pyt/repository/CardProductRepository.java`
- `pyt_back/src/main/java/com/pyt/repository/UserRepository.java`

Relevant frontend files:

- `pyt_front/app/(routes)/pyt/page.tsx`
- `pyt_front/app/(routes)/pyt/create/page.tsx`
- `pyt_front/app/(routes)/pyt/[pytId]/page.tsx`

## Backend route rule

`PytController` should use `/api/pyt`, not `/pyt`, to match the existing `/api/product` and `/api/auth` style.

## Authentication rule for MVP

Current security is not yet wired to a JWT principal. For the first team purchase MVP, implement service signatures with `String userId`, because `User.id` is a String UUID.

Temporary controller option:

```java
POST /api/pyt/{pytId}/teams/{teamSlotId}/join?userId={userId}
```

Later, replace the request param with JWT principal extraction.

## MVP boundaries

Implement first:

1. Repository layer
2. PYT list/create-data/detail read APIs
3. PYT create API
4. Direct team purchase API
5. Filler creation API

Defer until later:

- Filler entry purchase
- Filler random assignment
- Payment gateway integration
- JWT filter/principal refactor
- Admin dashboard flows
