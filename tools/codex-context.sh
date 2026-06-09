#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MODE="${1:-pyt}"

case "$MODE" in
  pyt)
    cat <<'LIST'
# Minimal PYT context files
AGENTS.md
docs/codex/PYT_CONTEXT.md
docs/codex/PYT_HARNESS.md
pyt_back/src/main/java/com/pyt/controller/PytController.java
pyt_back/src/main/java/com/pyt/service/PytService.java
pyt_back/src/main/java/com/pyt/entities/PytBreak.java
pyt_back/src/main/java/com/pyt/entities/PytTeamSlot.java
pyt_back/src/main/java/com/pyt/entities/PytEntry.java
pyt_back/src/main/java/com/pyt/entities/PytFiller.java
pyt_back/src/main/java/com/pyt/entities/PytFillerTeam.java
pyt_back/src/main/java/com/pyt/entities/PytFillerEntry.java
pyt_back/src/main/java/com/pyt/entities/CardProductOption.java
pyt_back/src/main/java/com/pyt/entities/SportsTeam.java
pyt_back/src/main/java/com/pyt/entities/User.java
pyt_back/src/main/java/com/pyt/dto/pyt/req/PytCreateReqDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/req/PytTeamPriceReqDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/req/PytFillerCreateReqDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytCreateDataRespDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytDetailRespDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytListItemRespDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytProductOptionRespDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytTeamRespDto.java
pyt_back/src/main/java/com/pyt/dto/pyt/resp/PytTeamSlotRespDto.java
pyt_front/app/(routes)/pyt/page.tsx
pyt_front/app/(routes)/pyt/create/page.tsx
pyt_front/app/(routes)/pyt/[pytId]/page.tsx
LIST
    ;;
  prompts)
    find "$ROOT/docs/codex/prompts" -type f | sort | sed "s#^$ROOT/##"
    ;;
  *)
    echo "Usage: tools/codex-context.sh [pyt|prompts]" >&2
    exit 1
    ;;
esac
