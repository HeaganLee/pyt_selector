package com.pyt.dto.product.resp;

import com.pyt.entities.CardProductChecklistItem;

import lombok.Getter;

@Getter
public class CardProductChecklistItemRespDto {

    private Long id;

    private String sectionName;

    private String cardNumber;

    private String playerName;

    private Long teamId;

    private String teamName;

    private String parallelName;

    private Boolean rookieCard;

    private Boolean autograph;

    private Boolean relic;

    private String notes;

    public CardProductChecklistItemRespDto(CardProductChecklistItem item) {
        this.id = item.getId();
        this.sectionName = item.getSectionName();
        this.cardNumber = item.getCardNumber();
        this.playerName = item.getPlayerName();
        this.teamId = item.getTeam() == null ? null : item.getTeam().getId();
        this.teamName = item.getTeamName();
        this.parallelName = item.getParallelName();
        this.rookieCard = item.getRookieCard();
        this.autograph = item.getAutograph();
        this.relic = item.getRelic();
        this.notes = item.getNotes();
    }
}
