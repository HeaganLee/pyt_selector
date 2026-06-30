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

    @Column(name = "source_page")
    private Integer sourcePage;

    @Column(name = "top_category", length = 100)
    private String topCategory;

    @Column(name = "card_type", length = 200)
    private String cardType;

    @Column(name = "card_number", nullable = false, length = 50)
    private String cardNumber;

    @Column(name = "player_name", nullable = false, length = 150)
    private String playerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private SportsTeam team;

    @Column(name = "team_name", length = 100)
    private String teamName;

    @Column(name = "team_original", length = 120)
    private String teamOriginal;

    @Column(name = "matched_team_name", length = 120)
    private String matchedTeamName;

    @Column(name = "match_note", length = 255)
    private String matchNote;

    @Column(name = "parallel_name", length = 150)
    private String parallelName;

    @Column(name = "is_rookie_card", nullable = false)
    private Boolean rookieCard;

    @Column(name = "is_autograph", nullable = false)
    private Boolean autograph;

    @Column(name = "is_relic", nullable = false)
    private Boolean relic;

    @Column(name = "is_variation")
    private Boolean variation;

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
        this(cardProduct, sectionName, null, null, null, cardNumber, playerName, team, teamName,
                null, null, null, parallelName, rookieCard, autograph, relic, false, notes);
    }

    public CardProductChecklistItem(
            CardProduct cardProduct,
            String sectionName,
            Integer sourcePage,
            String topCategory,
            String cardType,
            String cardNumber,
            String playerName,
            SportsTeam team,
            String teamName,
            String teamOriginal,
            String matchedTeamName,
            String matchNote,
            String parallelName,
            Boolean rookieCard,
            Boolean autograph,
            Boolean relic,
            Boolean variation,
            String notes) {
        this.cardProduct = cardProduct;
        this.sectionName = sectionName;
        this.sourcePage = sourcePage;
        this.topCategory = topCategory;
        this.cardType = cardType;
        this.cardNumber = cardNumber;
        this.playerName = playerName;
        this.team = team;
        this.teamName = teamName;
        this.teamOriginal = teamOriginal;
        this.matchedTeamName = matchedTeamName;
        this.matchNote = matchNote;
        this.parallelName = parallelName;
        this.rookieCard = rookieCard;
        this.autograph = autograph;
        this.relic = relic;
        this.variation = variation;
        this.notes = notes;
    }
}
