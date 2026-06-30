package com.pyt.dto.product.req;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.pyt.enums.TierCriteriaType;
import com.pyt.enums.TierGrade;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CardProductTierCriteriaCreateReqDto {

    private Long cardProductId;

    private TierCriteriaType criteriaType;

    private String criteriaName;

    private String description;

    private List<CardProductTeamTierCreateReqDto> teamTiers = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    public static class CardProductTeamTierCreateReqDto {

        private Long teamId;

        private BigDecimal expectedPytPrice;

        private TierGrade tierGrade;

        private String keyPlayers;

        private String commentText;

        private String aiSummary;
    }
}
