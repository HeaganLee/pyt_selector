package com.pyt.dto;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SellerSummaryRespDto {

    private long pytBreakCount;

    private long pytSaleCount;

    private long cardTradeSaleCount;

    private BigDecimal totalSalesAmount;
}
