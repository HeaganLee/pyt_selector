package com.pyt.dto.pyt.resp;

import com.pyt.entities.CardProductOption;

import lombok.Getter;

@Getter
public class PytProductOptionRespDto {
    private Long id;
    private Long productId;

    private String brandName;
    private String productName;
    private String productLabel;

    private String optionName;
    private String boxType;
    private String sportType;

    private Integer boxCountDefault;

    public PytProductOptionRespDto(CardProductOption option) {
        this.id = option.getId();
        this.productId = option.getCardProduct().getId();

        this.brandName = option.getCardProduct().getBrandName();
        this.productName = option.getCardProduct().getProductName();
        this.productLabel = option.getCardProduct().getBrandName()
                + " "
                + option.getCardProduct().getProductName();

        this.optionName = option.getOptionName();
        this.boxType = option.getBoxType().name();
        this.sportType = option.getCardProduct().getSportType().name();

        this.boxCountDefault = option.getBoxesPerCase();
    }
}
