package com.pyt.entities;

import com.pyt.entities.bases.BaseTimeEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "box_team_tier_key_players", uniqueConstraints = {
        @UniqueConstraint(name = "uk_box_team_tier_key_player", columnNames = { "box_team_tier_id", "display_order" })
})
public class BoxTeamTierKeyPlayer extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "box_team_tier_id", nullable = false)
    private BoxTeamTier boxTeamTier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "reason_text", length = 500)
    private String reasonText;

    public BoxTeamTierKeyPlayer(
            BoxTeamTier boxTeamTier,
            Player player,
            Integer displayOrder,
            String reasonText) {
        this.boxTeamTier = boxTeamTier;
        this.player = player;
        this.displayOrder = displayOrder;
        this.reasonText = reasonText;
    }
}
