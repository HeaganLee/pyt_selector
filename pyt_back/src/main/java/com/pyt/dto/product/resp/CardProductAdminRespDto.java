package com.pyt.dto.product.resp;

import java.time.LocalDate;

import com.pyt.entities.CardProduct;
import com.pyt.enums.SportType;

import lombok.Getter;

@Getter
public class CardProductAdminRespDto {

    private Long id;

    private SportType sportType;

    private String brandName;

    private String productName;

    private String productLabel;

    private LocalDate releaseDate;

    public CardProductAdminRespDto(CardProduct cardProduct) {
        this.id = cardProduct.getId();
        this.sportType = cardProduct.getSportType();
        this.brandName = cardProduct.getBrandName();
        this.productName = cardProduct.getProductName();
        this.productLabel = cardProduct.getBrandName() + " " + cardProduct.getProductName();
        this.releaseDate = cardProduct.getReleaseDate();
    }
}
