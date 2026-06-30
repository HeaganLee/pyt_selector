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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "card_product_checklist_items")
public class CardProductChecklistItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_product_id", nullable = false)
    private CardProduct cardProduct;

    @Column(name = "section_name", nullable = false, length = 150)
    private String sectionName;

    @Column(name = "card_number", nullable = false, length = 50)
    private String cardNumber;

    @Column(name = "player_name", nullable = false, length = 150)
    private String playerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private SportsTeam team;

    @Column(name = "team_name", length = 100)
    private String teamName;

    @Column(name = "parallel_name", length = 150)
    private String parallelName;

    @Column(name = "is_rookie_card", nullable = false)
    private Boolean rookieCard;

    @Column(name = "is_autograph", nullable = false)
    private Boolean autograph;

    @Column(name = "is_relic", nullable = false)
    private Boolean relic;

    @Column(name = "notes", length = 1000)
    private String notes;

    public CardProductChecklistItem(
            CardProduct cardProduct,
            String sectionName,
            String cardNumber,
            String playerName,
            SportsTeam team,
            String teamName,
            String parallelName,
            Boolean rookieCard,
            Boolean autograph,
            Boolean relic,
            String notes) {
        this.cardProduct = cardProduct;
        this.sectionName = sectionName;
        this.cardNumber = cardNumber;
        this.playerName = playerName;
        this.team = team;
        this.teamName = teamName;
        this.parallelName = parallelName;
        this.rookieCard = rookieCard;
        this.autograph = autograph;
        this.relic = relic;
        this.notes = notes;
    }
}
