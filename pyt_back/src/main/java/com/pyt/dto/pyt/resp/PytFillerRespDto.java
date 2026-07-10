package com.pyt.dto.pyt.resp;

import java.math.BigDecimal;
import java.util.List;

import com.pyt.entities.PytFiller;

import lombok.Getter;

@Getter
public class PytFillerRespDto {

    private Long id;
    private String title;
    private Integer fillerRoundNo;
    private Integer boxCount;
    private Integer teamsPerSlot;
    private Integer targetTeamCount;
    private Integer slotCount;
    private Integer entryCount;
    private Integer remainingSlotCount;
    private BigDecimal pricePerSlot;
    private BigDecimal totalTeamPrice;
    private String fillerStatus;
    private List<PytTeamSlotRespDto> targetTeamSlots;
    private List<PytFillerEntryRespDto> entries;

    public PytFillerRespDto(
            PytFiller filler,
            List<PytTeamSlotRespDto> targetTeamSlots,
            List<PytFillerEntryRespDto> entries) {
        this.id = filler.getId();
        this.title = filler.getTitle();
        this.fillerRoundNo = filler.getFillerRoundNo();
        this.boxCount = filler.getBoxCount();
        this.teamsPerSlot = filler.getTeamsPerSlot();
        this.targetTeamCount = targetTeamSlots.size();
        this.slotCount = filler.getSlotCount();
        this.entryCount = entries.size();
        this.remainingSlotCount = Math.max(0, filler.getSlotCount() - entries.size());
        this.pricePerSlot = filler.getPricePerSlot();
        this.totalTeamPrice = filler.getTotalTeamPrice();
        this.fillerStatus = filler.getFillerStatus().name();
        this.targetTeamSlots = targetTeamSlots;
        this.entries = entries;
    }
}
