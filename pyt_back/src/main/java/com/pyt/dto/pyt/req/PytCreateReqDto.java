package com.pyt.dto.pyt.req;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PytCreateReqDto {

    private Long cardProductOptionId;
    private String title;
    private String breakUnitType;
    private Integer roundNo;
    private Integer boxCount;
    private Boolean fillerEnabled;

    private List<PytTeamPriceReqDto> teamPrices;
}
