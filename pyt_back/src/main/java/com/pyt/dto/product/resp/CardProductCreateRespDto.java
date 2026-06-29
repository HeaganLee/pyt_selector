package com.pyt.dto.product.resp;

import java.util.List;

import com.pyt.entities.CardProduct;
import com.pyt.entities.CardProductOption;

import lombok.Getter;

@Getter
public class CardProductCreateRespDto {

    private Long productId;

    private String brandName;

    private String productName;

    private List<Long> optionIds;

    public CardProductCreateRespDto(CardProduct cardProduct, List<CardProductOption> options) {
        this.productId = cardProduct.getId();
        this.brandName = cardProduct.getBrandName();
        this.productName = cardProduct.getProductName();
        this.optionIds = options.stream()
                .map(CardProductOption::getId)
                .toList();
    }
}
