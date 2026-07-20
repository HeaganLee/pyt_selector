package com.pyt.dto.trade.resp;

import java.math.BigDecimal;

import com.pyt.entities.CardTradePurchase;
import com.pyt.enums.CardTradePurchaseStatus;

import lombok.Getter;

@Getter
public class CardTradePurchaseRespDto {

    private Long id;
    private Long tradeId;
    private String buyerUserId;
    private String sellerUserId;
    private BigDecimal paidAmount;
    private BigDecimal shippingFee;
    private CardTradePurchaseStatus purchaseStatus;

    public CardTradePurchaseRespDto(CardTradePurchase purchase) {
        this.id = purchase.getId();
        this.tradeId = purchase.getCardTradeListing().getId();
        this.buyerUserId = purchase.getBuyerUser().getId();
        this.sellerUserId = purchase.getSellerUser().getId();
        this.paidAmount = purchase.getPaidAmount();
        this.shippingFee = purchase.getShippingFee();
        this.purchaseStatus = purchase.getPurchaseStatus();
    }
}
