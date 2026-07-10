package com.pyt.dto.pyt.resp;

import java.math.BigDecimal;

import com.pyt.entities.PytTeamSlot;

import lombok.Getter;

@Getter
public class PytTeamSlotRespDto {

    private Long id;

    private Long teamId;
    private String teamName;
    private String shortName;

    private BigDecimal price;
    private String slotStatus;

    private String buyerNickname;
    private Boolean fillerTarget;
    private Boolean fillerOnly;

    public PytTeamSlotRespDto(PytTeamSlot slot) {
        this.id = slot.getId();

        this.teamId = slot.getTeam().getId();
        this.teamName = slot.getTeam().getName();
        this.shortName = slot.getTeam().getShortName();

        this.price = slot.getPrice();
        this.slotStatus = slot.getSlotStatus().name();

        this.buyerNickname = slot.getBuyerUser() == null
                ? null
                : slot.getBuyerUser().getNickname();

        this.fillerTarget = slot.getFillerTarget();
        this.fillerOnly = Boolean.TRUE.equals(slot.getFillerOnly());
    }
}
