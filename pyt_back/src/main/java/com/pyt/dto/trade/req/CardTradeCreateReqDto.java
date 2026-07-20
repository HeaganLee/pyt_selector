package com.pyt.dto.trade.req;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CardTradeCreateReqDto {

    private String title;
    private String leagueName;
    private String playerName;
    private String teamName;
    private String cardYear;
    private String brandName;
    private String cardNumber;
    private String gradeCompany;
    private String grade;
    private String conditionLabel;
    private BigDecimal price;
    private BigDecimal shippingFee;
    private String imageUrl;
    private String description;
}
