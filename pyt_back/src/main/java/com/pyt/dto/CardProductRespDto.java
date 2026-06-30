package com.pyt.dto;

import java.time.LocalDate;

import com.pyt.entities.CardProduct;

import lombok.Getter;

@Getter
public class CardProductRespDto {

    private Long id;
    private String brandName;
    private String productName;
    private Integer releaseYear;
    private LocalDate releaseDate;
    private String status;
    private String imageUrl;
    private String sportType;
    private String checklistUrl;

    public CardProductRespDto(CardProduct cardProduct) {
        this.id = cardProduct.getId();
        this.brandName = cardProduct.getBrandName();
        this.productName = cardProduct.getProductName();
        this.releaseYear = cardProduct.getReleaseDate() == null ? null : cardProduct.getReleaseDate().getYear();
        this.releaseDate = cardProduct.getReleaseDate();
        this.status = calculateStatus(cardProduct.getReleaseDate());
        this.imageUrl = cardProduct.getImageUrl();
        this.sportType = cardProduct.getSportType().name();
        this.checklistUrl = cardProduct.getChecklistUrl();
    }

    private String calculateStatus(LocalDate releaseDate) {
        if (releaseDate == null) {
            return "UNKNOWN";
        }

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
