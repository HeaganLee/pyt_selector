package com.pyt.entities;

import java.math.BigDecimal;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.CardTradeStatus;

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
@Table(name = "card_trade_listings")
@Getter
@Setter
@NoArgsConstructor
public class CardTradeListing extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_user_id", nullable = false)
    private User sellerUser;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "league_name", nullable = false, length = 30)
    private String leagueName;

    @Column(name = "player_name", nullable = false, length = 100)
    private String playerName;

    @Column(name = "team_name", length = 100)
    private String teamName;

    @Column(name = "card_year", length = 20)
    private String cardYear;

    @Column(name = "brand_name", length = 100)
    private String brandName;

    @Column(name = "card_number", length = 50)
    private String cardNumber;

    @Column(name = "grade_company", length = 50)
    private String gradeCompany;

    @Column(name = "grade", length = 30)
    private String grade;

    @Column(name = "condition_label", nullable = false, length = 80)
    private String conditionLabel;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal shippingFee;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "description", length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "trade_status", nullable = false, length = 30)
    private CardTradeStatus tradeStatus;

    public CardTradeListing(
            User sellerUser,
            String title,
            String leagueName,
            String playerName,
            String teamName,
            String cardYear,
            String brandName,
            String cardNumber,
            String gradeCompany,
            String grade,
            String conditionLabel,
            BigDecimal price,
            BigDecimal shippingFee,
            String imageUrl,
            String description,
            CardTradeStatus tradeStatus) {
        this.sellerUser = sellerUser;
        this.title = title;
        this.leagueName = leagueName;
        this.playerName = playerName;
        this.teamName = teamName;
        this.cardYear = cardYear;
        this.brandName = brandName;
        this.cardNumber = cardNumber;
        this.gradeCompany = gradeCompany;
        this.grade = grade;
        this.conditionLabel = conditionLabel;
        this.price = price;
        this.shippingFee = shippingFee;
        this.imageUrl = imageUrl;
        this.description = description;
        this.tradeStatus = tradeStatus;
    }
}
