package com.pyt.dto.product.resp;

import java.util.List;

import com.pyt.entities.CardProductTeamTier;
import com.pyt.entities.CardProductTierCriteria;
import com.pyt.enums.TierCriteriaType;

import lombok.Getter;

@Getter
public class CardProductTierCriteriaCreateRespDto {

    private Long criteriaId;

    private Long productId;

    private TierCriteriaType criteriaType;

    private String criteriaName;

    private List<Long> teamTierIds;

    public CardProductTierCriteriaCreateRespDto(
            CardProductTierCriteria criteria,
            List<CardProductTeamTier> teamTiers) {
        this.criteriaId = criteria.getId();
        this.productId = criteria.getCardProduct().getId();
        this.criteriaType = criteria.getCriteriaType();
        this.criteriaName = criteria.getCriteriaName();
        this.teamTierIds = teamTiers.stream()
                .map(CardProductTeamTier::getId)
                .toList();
    }
}
