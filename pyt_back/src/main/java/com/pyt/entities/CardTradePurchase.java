package com.pyt.entities;

import java.math.BigDecimal;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.CardTradePurchaseStatus;

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
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "card_trade_purchases")
@Getter
@Setter
@NoArgsConstructor
public class CardTradePurchase extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_trade_listing_id", nullable = false)
    private CardTradeListing cardTradeListing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_user_id", nullable = false)
    private User buyerUser;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_user_id", nullable = false)
    private User sellerUser;

    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @Enumerated(EnumType.STRING)
    @Column(name = "purchase_status", nullable = false, length = 30)
    private CardTradePurchaseStatus purchaseStatus;

    public CardTradePurchase(
            CardTradeListing cardTradeListing,
            User buyerUser,
            User sellerUser,
            BigDecimal paidAmount,
            BigDecimal shippingFee,
            CardTradePurchaseStatus purchaseStatus) {
        this.cardTradeListing = cardTradeListing;
        this.buyerUser = buyerUser;
        this.sellerUser = sellerUser;
        this.paidAmount = paidAmount;
        this.shippingFee = shippingFee;
        this.purchaseStatus = purchaseStatus;
    }
}
