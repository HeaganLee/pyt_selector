package com.pyt.dto.product.resp;

import java.util.List;

import com.pyt.entities.CardProductChecklistItem;

import lombok.Getter;

@Getter
public class CardProductChecklistCreateRespDto {

    private Long productId;

    private String sourceUrl;

    private List<Long> itemIds;

    public CardProductChecklistCreateRespDto(
            Long productId,
            String sourceUrl,
            List<CardProductChecklistItem> items) {
        this.productId = productId;
        this.sourceUrl = sourceUrl;
        this.itemIds = items.stream()
                .map(CardProductChecklistItem::getId)
                .toList();
    }
}
