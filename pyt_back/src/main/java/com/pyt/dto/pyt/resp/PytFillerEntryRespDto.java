package com.pyt.dto.pyt.resp;

import java.math.BigDecimal;

import com.pyt.entities.PytFillerEntry;

import lombok.Getter;

@Getter
public class PytFillerEntryRespDto {

    private Long id;
    private Integer slotNo;
    private BigDecimal paidAmount;
    private String entryStatus;
    private String userId;
    private String userNickname;

    public PytFillerEntryRespDto(PytFillerEntry entry) {
        this.id = entry.getId();
        this.slotNo = entry.getSlotNo();
        this.paidAmount = entry.getPaidAmount();
        this.entryStatus = entry.getEntryStatus().name();
        this.userId = entry.getUser().getId();
        this.userNickname = entry.getUser().getNickname();
    }
}
