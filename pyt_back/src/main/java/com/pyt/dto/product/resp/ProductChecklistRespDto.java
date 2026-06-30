package com.pyt.dto.product.resp;

import java.time.LocalDate;
import java.util.List;

import com.pyt.entities.CardProduct;
import com.pyt.entities.CardProductChecklistItem;

import lombok.Getter;

@Getter
public class ProductChecklistRespDto {

    private Long productId;

    private String brandName;

    private String productName;

    private String productLabel;

    private Integer releaseYear;

    private LocalDate releaseDate;

    private String sportType;

    private String imageUrl;

    private String sourceUrl;

    private List<CardProductChecklistItemRespDto> items;

    public ProductChecklistRespDto(CardProduct product, List<CardProductChecklistItem> items) {
        this.productId = product.getId();
        this.brandName = product.getBrandName();
        this.productName = product.getProductName();
        this.productLabel = product.getBrandName() + " " + product.getProductName();
        this.releaseYear = product.getReleaseDate() == null ? null : product.getReleaseDate().getYear();
        this.releaseDate = product.getReleaseDate();
        this.sportType = product.getSportType().name();
        this.imageUrl = product.getImageUrl();
        this.sourceUrl = product.getChecklistUrl();
        this.items = items.stream()
                .map(CardProductChecklistItemRespDto::new)
                .toList();
    }
}
