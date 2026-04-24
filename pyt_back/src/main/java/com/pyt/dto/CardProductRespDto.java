package com.pyt.dto;

import java.time.LocalDate;

import com.pyt.entities.CardProduct;

import lombok.Getter;

@Getter
public class CardProductRespDto {

    private Long id;
    private String brandName;
    private String productName;
    private LocalDate releaseDate;
    private String status;
    private String imageUrl;

    public CardProductRespDto(CardProduct cardProduct) {
        this.id = cardProduct.getId();
        this.brandName = cardProduct.getBrandName();
        this.productName = cardProduct.getProductName();
        this.releaseDate = cardProduct.getReleaseDate();
        this.status = calculateStatus(cardProduct.getReleaseDate());
        this.imageUrl = cardProduct.getImageUrl();
    }

    private String calculateStatus(LocalDate releaseDate) {
        LocalDate today = LocalDate.now();

        if (today.isBefore(releaseDate)) {
            return "UPCOMING";
        }

        if (!today.isBefore(releaseDate)
                && !today.isAfter(releaseDate.plusDays(14))) {
            return "ON_SALE";
        }

        return "ENDED";
    }
}
