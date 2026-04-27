package com.pyt.dto;

import java.time.LocalDate;
import java.util.List;

import com.pyt.entities.CardProduct;

import lombok.Getter;

@Getter
public class ProductDetailRespDto {

    private Long id;
    private String brandName;
    private String productName;
    private Integer releaseYear;
    private LocalDate releaseDate;
    private String status;
    private String imageUrl;
    private List<TierCriteriaRespDto> tierCriteria;

    public ProductDetailRespDto(CardProduct cardProduct) {
        this.id = cardProduct.getId();
        this.brandName = cardProduct.getCardCompany().getName();
        this.productName = cardProduct.getProductName();
        this.releaseDate = cardProduct.getReleaseDate();
        this.releaseYear = cardProduct.getReleaseDate().getYear();
        this.status = calculateStatus(cardProduct.getReleaseDate());
        this.imageUrl = cardProduct.getImageUrl();

        this.tierCriteria = cardProduct.getTierCriteria()
                .stream()
                .map(TierCriteriaRespDto::new)
                .toList();
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
