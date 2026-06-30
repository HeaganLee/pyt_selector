package com.pyt.dto.product.resp;

import com.pyt.entities.CardProductChecklistItem;

import lombok.Getter;

@Getter
public class CardProductChecklistItemRespDto {

    private Long id;

    private String sectionName;

    private Integer sourcePage;

    private String topCategory;

    private String cardType;

    private String cardNumber;

    private String playerName;

    private Long teamId;

    private String teamName;

    private String teamOriginal;

    private String matchedTeamName;

    private String matchNote;

    private String parallelName;

    private Boolean rookieCard;

    private Boolean autograph;

    private Boolean relic;

    private Boolean variation;

    private String notes;

    public CardProductChecklistItemRespDto(CardProductChecklistItem item) {
        this.id = item.getId();
        this.sectionName = item.getSectionName();
        this.sourcePage = item.getSourcePage();
        this.topCategory = item.getTopCategory();
        this.cardType = item.getCardType();
        this.cardNumber = item.getCardNumber();
        this.playerName = item.getPlayerName();
        this.teamId = item.getTeam() == null ? null : item.getTeam().getId();
        this.teamName = item.getTeamName();
        this.teamOriginal = item.getTeamOriginal();
        this.matchedTeamName = item.getMatchedTeamName();
        this.matchNote = item.getMatchNote();
        this.parallelName = item.getParallelName();
        this.rookieCard = item.getRookieCard();
        this.autograph = item.getAutograph();
        this.relic = item.getRelic();
        this.variation = item.getVariation();
        this.notes = item.getNotes();
    }
}
