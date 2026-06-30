package com.pyt.dto.product.resp;

import java.time.LocalDate;
import java.util.List;

import com.pyt.dto.TierCriteriaRespDto;
import com.pyt.entities.CardProduct;

import lombok.Getter;

@Getter
public class ProductTierBoardRespDto {

    private Long productId;

    private String brandName;

    private String productName;

    private String productLabel;

    private Integer releaseYear;

    private LocalDate releaseDate;

    private String sportType;

    private String imageUrl;

    private List<TierCriteriaRespDto> tierCriteria;

    public ProductTierBoardRespDto(CardProduct product) {
        this.productId = product.getId();
        this.brandName = product.getBrandName();
        this.productName = product.getProductName();
        this.productLabel = product.getBrandName() + " " + product.getProductName();
        this.releaseYear = product.getReleaseDate() == null ? null : product.getReleaseDate().getYear();
        this.releaseDate = product.getReleaseDate();
        this.sportType = product.getSportType().name();
        this.imageUrl = product.getImageUrl();
        this.tierCriteria = product.getTierCriteria()
                .stream()
                .map(TierCriteriaRespDto::new)
                .toList();
    }
}
