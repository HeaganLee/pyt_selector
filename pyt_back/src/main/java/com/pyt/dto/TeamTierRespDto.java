package com.pyt.dto;

import java.math.BigDecimal;

import com.pyt.entities.CardProductTeamTier;
import com.pyt.enums.TierGrade;

import lombok.Getter;

@Getter
public class TeamTierRespDto {

    private Long id;
    private String teamName;
    private BigDecimal expectedPytPrice;
    private TierGrade tierGrade;
    private String keyPlayers;
    private String commentText;
    private String aiSummary;

    public TeamTierRespDto(CardProductTeamTier teamTier) {
        this.id = teamTier.getId();
        this.teamName = teamTier.getTeam().getName();
        this.expectedPytPrice = teamTier.getExpectedPytPrice();
        this.tierGrade = teamTier.getTierGrade();
        this.keyPlayers = teamTier.getKeyPlayers();
        this.commentText = teamTier.getCommentText();
        this.aiSummary = teamTier.getAiSummary();
    }
}
