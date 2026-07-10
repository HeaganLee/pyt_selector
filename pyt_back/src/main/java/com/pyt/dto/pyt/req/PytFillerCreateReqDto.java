package com.pyt.dto.pyt.req;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PytFillerCreateReqDto {

    private List<Long> teamSlotIds;
    private Integer fillerRoundNo;
    private Integer boxCount;
    private Integer teamsPerSlot;
    private Integer slotCount;
}
