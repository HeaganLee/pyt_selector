package com.pyt.entities;

import java.math.BigDecimal;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.TierGrade;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "card_product_team_tiers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_card_product_team_tier_criteria_team", columnNames = { "tier_criteria_id",
                "team_id" })
})
public class CardProductTeamTier extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tier_criteria_id", nullable = false)
    private CardProductTierCriteria tierCriteria;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private SportsTeam team;

    @Column(name = "expected_pyt_price", precision = 12, scale = 2)
    private BigDecimal expectedPytPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "tier_grade", nullable = false, length = 10)
    private TierGrade tierGrade;

    @Column(name = "key_players", length = 1000)
    private String keyPlayers;

    @Column(name = "comment_text", length = 1000)
    private String commentText;

    @Column(name = "ai_summary", length = 2000)
    private String aiSummary;

    public CardProductTeamTier(
            CardProductTierCriteria tierCriteria,
            SportsTeam team,
            BigDecimal expectedPytPrice,
            TierGrade tierGrade,
            String keyPlayers,
            String commentText,
            String aiSummary) {
        this.tierCriteria = tierCriteria;
        this.team = team;
        this.expectedPytPrice = expectedPytPrice;
        this.tierGrade = tierGrade;
        this.keyPlayers = keyPlayers;
        this.commentText = commentText;
        this.aiSummary = aiSummary;
    }
}
