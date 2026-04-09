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
@Table(name = "box_team_tiers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_box_team_tier_box_team", columnNames = { "card_box_id", "team_id" })
})
public class BoxTeamTier extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_box_id", nullable = false)
    private CardBox cardBox;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private SportsTeam team;

    @Column(name = "expected_pyt_price", precision = 12, scale = 2)
    private BigDecimal expectedPytPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "high_end_tier", nullable = false, length = 10)
    private TierGrade highEndTier;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_tier", nullable = false, length = 10)
    private TierGrade valueTier;

    @Column(name = "high_end_comment", length = 1000)
    private String highEndComment;

    @Column(name = "value_comment", length = 1000)
    private String valueComment;

    @Column(name = "ai_summary", length = 2000)
    private String aiSummary;

    public BoxTeamTier(
            CardBox cardBox,
            SportsTeam team,
            BigDecimal expectedPytPrice,
            TierGrade highEndTier,
            TierGrade valueTier,
            String highEndComment,
            String valueComment,
            String aiSummary) {
        this.cardBox = cardBox;
        this.team = team;
        this.expectedPytPrice = expectedPytPrice;
        this.highEndTier = highEndTier;
        this.valueTier = valueTier;
        this.highEndComment = highEndComment;
        this.valueComment = valueComment;
        this.aiSummary = aiSummary;
    }
}
