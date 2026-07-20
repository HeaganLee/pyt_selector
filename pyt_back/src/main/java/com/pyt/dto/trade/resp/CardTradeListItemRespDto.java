package com.pyt.dto.trade.resp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.pyt.entities.CardTradeListing;
import com.pyt.enums.CardTradeStatus;

import lombok.Getter;

@Getter
public class CardTradeListItemRespDto {

    private Long id;
    private String title;
    private String leagueName;
    private String playerName;
    private String teamName;
    private String cardYear;
    private String brandName;
    private String gradeCompany;
    private String grade;
    private String conditionLabel;
    private BigDecimal price;
    private BigDecimal shippingFee;
    private String imageUrl;
    private CardTradeStatus tradeStatus;
    private String sellerUserId;
    private String sellerNickname;
    private LocalDateTime createdAt;

    public CardTradeListItemRespDto(CardTradeListing listing) {
        this.id = listing.getId();
        this.title = listing.getTitle();
        this.leagueName = listing.getLeagueName();
        this.playerName = listing.getPlayerName();
        this.teamName = listing.getTeamName();
        this.cardYear = listing.getCardYear();
        this.brandName = listing.getBrandName();
        this.gradeCompany = listing.getGradeCompany();
        this.grade = listing.getGrade();
        this.conditionLabel = listing.getConditionLabel();
        this.price = listing.getPrice();
        this.shippingFee = listing.getShippingFee();
        this.imageUrl = listing.getImageUrl();
        this.tradeStatus = listing.getTradeStatus();
        this.sellerUserId = listing.getSellerUser().getId();
        this.sellerNickname = listing.getSellerUser().getNickname() != null
                ? listing.getSellerUser().getNickname()
                : listing.getSellerUser().getName();
        this.createdAt = listing.getCreatedAt();
    }
}
