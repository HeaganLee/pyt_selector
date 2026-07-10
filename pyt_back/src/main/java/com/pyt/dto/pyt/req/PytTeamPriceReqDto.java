package com.pyt.dto.pyt.req;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PytTeamPriceReqDto {

    private Long teamId;
    private BigDecimal price;
    private Boolean fillerOnly;
}
