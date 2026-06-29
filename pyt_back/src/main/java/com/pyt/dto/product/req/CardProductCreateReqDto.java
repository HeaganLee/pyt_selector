package com.pyt.dto.product.req;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.pyt.enums.BoxType;
import com.pyt.enums.SportType;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CardProductCreateReqDto {

    private Long cardCompanyId;

    private SportType sportType;

    private String brandName;

    private String productName;

    private LocalDate releaseDate;

    private String checklistUrl;

    private String imageUrl;

    private List<CardProductOptionCreateReqDto> options = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CardProductOptionCreateReqDto {

        private BoxType boxType;

        private String optionName;

        private Integer cardsPerPack;

        private Integer packsPerBox;

        private Integer boxesPerCase;

        private BigDecimal estimatedPrice;

        private String currency;

        private String configurationText;
    }
}
