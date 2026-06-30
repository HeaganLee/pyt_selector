package com.pyt.dto.product.req;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CardProductChecklistCreateReqDto {

    private Long cardProductId;

    private String sourceUrl;

    private List<CardProductChecklistItemCreateReqDto> items = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CardProductChecklistItemCreateReqDto {

        private String sectionName;

        private String cardNumber;

        private String playerName;

        private Long teamId;

        private String teamName;

        private String parallelName;

        private Boolean rookieCard;

        private Boolean autograph;

        private Boolean relic;

        private String notes;
    }
}
