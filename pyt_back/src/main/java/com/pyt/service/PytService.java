package com.pyt.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.dto.pyt.req.PytCreateReqDto;
import com.pyt.dto.pyt.req.PytFillerCreateReqDto;
import com.pyt.dto.pyt.req.PytTeamPriceReqDto;
import com.pyt.dto.pyt.resp.PytCreateDataRespDto;
import com.pyt.dto.pyt.resp.PytDetailRespDto;
import com.pyt.dto.pyt.resp.PytListItemRespDto;
import com.pyt.dto.pyt.resp.PytProductOptionRespDto;
import com.pyt.dto.pyt.resp.PytTeamRespDto;
import com.pyt.dto.pyt.resp.PytTeamSlotRespDto;
import com.pyt.entities.CardProductOption;
import com.pyt.entities.PytBreak;
import com.pyt.entities.PytEntry;
import com.pyt.entities.PytFiller;
import com.pyt.entities.PytFillerTeam;
import com.pyt.entities.PytTeamSlot;
import com.pyt.entities.SportsTeam;
import com.pyt.entities.User;
import com.pyt.enums.BreakUnitType;
import com.pyt.enums.FillerStatus;
import com.pyt.enums.PytEntryStatus;
import com.pyt.enums.PytStatus;
import com.pyt.enums.PytTeamSlotStatus;
import com.pyt.repository.CardProductOptionRepository;
import com.pyt.repository.PytBreakRepository;
import com.pyt.repository.PytEntryRepository;
import com.pyt.repository.PytFillerRepository;
import com.pyt.repository.PytFillerTeamRepository;
import com.pyt.repository.PytTeamSlotRepository;
import com.pyt.repository.SportsTeamRepository;
import com.pyt.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PytService {

    private final PytBreakRepository pytBreakRepository;
    private final PytTeamSlotRepository pytTeamSlotRepository;
    private final PytEntryRepository pytEntryRepository;
    private final PytFillerRepository pytFillerRepository;
    private final PytFillerTeamRepository pytFillerTeamRepository;
    private final CardProductOptionRepository cardProductOptionRepository;
    private final SportsTeamRepository sportsTeamRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PytListItemRespDto> getPytList() {
        return pytBreakRepository.findAllWithProductOrderByCreatedAtDesc()
                .stream()
                .map(pytBreak -> new PytListItemRespDto(
                        pytBreak,
                        Math.toIntExact(pytTeamSlotRepository.countByPytBreakId(pytBreak.getId())),
                        Math.toIntExact(pytTeamSlotRepository.countAvailableByPytBreakId(pytBreak.getId()))))
                .toList();
    }

    @Transactional(readOnly = true)
    public PytCreateDataRespDto getCreateData() {
        List<PytProductOptionRespDto> productOptions = cardProductOptionRepository.findAllByOrderByIdAsc()
                .stream()
                .map(PytProductOptionRespDto::new)
                .toList();

        List<PytTeamRespDto> teams = sportsTeamRepository.findAllByOrderBySportTypeAscLeagueLevelTypeAscNameAsc()
                .stream()
                .map(PytTeamRespDto::new)
                .toList();

        return new PytCreateDataRespDto(productOptions, teams);
    }

    @Transactional(readOnly = true)
    public PytDetailRespDto getPytDetail(Long pytId) {
        PytBreak pytBreak = pytBreakRepository.findDetailById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        List<PytTeamSlotRespDto> teamSlots = pytTeamSlotRepository.findWithTeamAndBuyerUserByPytBreakId(pytId)
                .stream()
                .map(PytTeamSlotRespDto::new)
                .toList();

        return new PytDetailRespDto(pytBreak, teamSlots);
    }

    @Transactional
    public Long createPyt(PytCreateReqDto reqDto) {
        validateCreateRequest(reqDto);

        CardProductOption cardProductOption = cardProductOptionRepository
                .findById(reqDto.getCardProductOptionId())
                .orElseThrow(() -> new IllegalArgumentException("상품 옵션을 찾을 수 없습니다."));

        BreakUnitType breakUnitType = parseBreakUnitType(reqDto.getBreakUnitType());

        PytBreak pytBreak = pytBreakRepository.save(new PytBreak(
                cardProductOption,
                reqDto.getTitle(),
                breakUnitType,
                reqDto.getRoundNo(),
                reqDto.getBoxCount(),
                Boolean.TRUE.equals(reqDto.getFillerEnabled()),
                PytStatus.OPEN));

        List<PytTeamSlot> teamSlots = new ArrayList<>();
        for (PytTeamPriceReqDto teamPrice : reqDto.getTeamPrices()) {
            validateTeamPrice(teamPrice);

            SportsTeam team = sportsTeamRepository.findById(teamPrice.getTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

            teamSlots.add(new PytTeamSlot(
                    pytBreak,
                    team,
                    teamPrice.getPrice(),
                    PytTeamSlotStatus.AVAILABLE));
        }

        pytTeamSlotRepository.saveAll(teamSlots);

        return pytBreak.getId();
    }

    @Transactional
    public void joinTeam(Long pytId, Long teamSlotId, String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("사용자 ID가 필요합니다.");
        }

        PytBreak pytBreak = pytBreakRepository.findById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        PytTeamSlot teamSlot = pytTeamSlotRepository.findById(teamSlotId)
                .orElseThrow(() -> new IllegalArgumentException("팀 슬롯을 찾을 수 없습니다."));

        if (!pytBreak.getId().equals(teamSlot.getPytBreak().getId())) {
            throw new IllegalArgumentException("해당 PYT의 팀 슬롯이 아닙니다.");
        }
        if (teamSlot.getSlotStatus() != PytTeamSlotStatus.AVAILABLE) {
            throw new IllegalArgumentException("구매 가능한 팀 슬롯이 아닙니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        teamSlot.setSlotStatus(PytTeamSlotStatus.SOLD);
        teamSlot.setBuyerUser(user);

        pytEntryRepository.save(new PytEntry(
                pytBreak,
                teamSlot,
                user,
                teamSlot.getPrice(),
                PytEntryStatus.PAID));

        // TODO: 전체 팀 판매 완료 후 PYT 상태를 SOLD_OUT/READY로 전환한다.
    }

    @Transactional
    public Long createFiller(Long pytId, PytFillerCreateReqDto reqDto) {
        validateFillerCreateRequest(reqDto);

        PytBreak pytBreak = pytBreakRepository.findById(pytId)
                .orElseThrow(() -> new IllegalArgumentException("PYT를 찾을 수 없습니다."));

        if (!Boolean.TRUE.equals(pytBreak.getFillerEnabled())) {
            throw new IllegalArgumentException("필러 생성이 비활성화된 PYT입니다.");
        }

        Set<Long> requestedTeamSlotIds = new HashSet<>(reqDto.getTeamSlotIds());
        if (requestedTeamSlotIds.size() != reqDto.getTeamSlotIds().size()) {
            throw new IllegalArgumentException("중복된 팀 슬롯이 있습니다.");
        }

        List<PytTeamSlot> teamSlots = pytTeamSlotRepository.findAllById(requestedTeamSlotIds);
        if (teamSlots.size() != requestedTeamSlotIds.size()) {
            throw new IllegalArgumentException("선택한 팀 슬롯을 찾을 수 없습니다.");
        }

        BigDecimal totalTeamPrice = BigDecimal.ZERO;
        for (PytTeamSlot teamSlot : teamSlots) {
            if (!pytBreak.getId().equals(teamSlot.getPytBreak().getId())) {
                throw new IllegalArgumentException("해당 PYT의 팀 슬롯만 필러로 전환할 수 있습니다.");
            }
            if (teamSlot.getSlotStatus() != PytTeamSlotStatus.AVAILABLE) {
                throw new IllegalArgumentException("구매 가능한 팀 슬롯만 필러로 전환할 수 있습니다.");
            }

            totalTeamPrice = totalTeamPrice.add(teamSlot.getPrice());
        }

        BigDecimal pricePerSlot = totalTeamPrice
                .divide(BigDecimal.valueOf(reqDto.getSlotCount()), 0, RoundingMode.CEILING)
                .setScale(2);

        PytFiller filler = pytFillerRepository.save(new PytFiller(
                pytBreak,
                pytBreak.getTitle() + " Filler",
                reqDto.getSlotCount(),
                pricePerSlot,
                totalTeamPrice,
                FillerStatus.OPEN));

        List<PytFillerTeam> fillerTeams = new ArrayList<>();
        for (PytTeamSlot teamSlot : teamSlots) {
            teamSlot.setSlotStatus(PytTeamSlotStatus.FILLER_TARGET);
            teamSlot.setFillerTarget(true);
            fillerTeams.add(new PytFillerTeam(filler, teamSlot));
        }

        pytFillerTeamRepository.saveAll(fillerTeams);
        pytBreak.setPytStatus(PytStatus.FILLER_OPEN);

        return filler.getId();
    }

    private void validateCreateRequest(PytCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("PYT 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardProductOptionId() == null) {
            throw new IllegalArgumentException("상품 옵션 ID가 필요합니다.");
        }
        if (reqDto.getTitle() == null || reqDto.getTitle().isBlank()) {
            throw new IllegalArgumentException("PYT 제목이 필요합니다.");
        }
        if (reqDto.getBreakUnitType() == null || reqDto.getBreakUnitType().isBlank()) {
            throw new IllegalArgumentException("브레이크 단위가 필요합니다.");
        }
        if (reqDto.getRoundNo() == null) {
            throw new IllegalArgumentException("차수 정보가 필요합니다.");
        }
        if (reqDto.getTeamPrices() == null || reqDto.getTeamPrices().isEmpty()) {
            throw new IllegalArgumentException("팀 가격 정보가 필요합니다.");
        }
    }

    private void validateFillerCreateRequest(PytFillerCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("필러 생성 요청이 필요합니다.");
        }
        if (reqDto.getTeamSlotIds() == null || reqDto.getTeamSlotIds().isEmpty()) {
            throw new IllegalArgumentException("필러 대상 팀 슬롯이 필요합니다.");
        }
        for (Long teamSlotId : reqDto.getTeamSlotIds()) {
            if (teamSlotId == null) {
                throw new IllegalArgumentException("팀 슬롯 ID가 필요합니다.");
            }
        }
        if (reqDto.getSlotCount() == null || reqDto.getSlotCount() <= 0) {
            throw new IllegalArgumentException("필러 슬롯 수는 0보다 커야 합니다.");
        }
    }

    private void validateTeamPrice(PytTeamPriceReqDto teamPrice) {
        if (teamPrice == null || teamPrice.getTeamId() == null) {
            throw new IllegalArgumentException("팀 ID가 필요합니다.");
        }
        if (teamPrice.getPrice() == null) {
            throw new IllegalArgumentException("팀 가격이 필요합니다.");
        }
        if (teamPrice.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("팀 가격은 0보다 커야 합니다.");
        }
    }

    private BreakUnitType parseBreakUnitType(String breakUnitType) {
        try {
            return BreakUnitType.valueOf(breakUnitType.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 브레이크 단위입니다.");
        }
    }
}
