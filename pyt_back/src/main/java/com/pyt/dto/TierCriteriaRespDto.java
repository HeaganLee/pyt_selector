package com.pyt.dto;

import java.util.List;

import com.pyt.entities.CardProductTierCriteria;
import com.pyt.enums.TierCriteriaType;

import lombok.Getter;

@Getter
public class TierCriteriaRespDto {

    private Long id;
    private TierCriteriaType criteriaType;
    private String criteriaName;
    private String description;
    private List<TeamTierRespDto> teamTiers;

    public TierCriteriaRespDto(CardProductTierCriteria criteria) {
        this.id = criteria.getId();
        this.criteriaType = criteria.getCriteriaType();
        this.criteriaName = criteria.getCriteriaName();
        this.description = criteria.getDescription();

        this.teamTiers = criteria.getTeamTiers()
                .stream()
                .map(TeamTierRespDto::new)
                .toList();
    }
}
