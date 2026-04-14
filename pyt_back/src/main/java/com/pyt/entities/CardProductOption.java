package com.pyt.entities;

import java.math.BigDecimal;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.BoxType;

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
@Table(name = "card_product_options", uniqueConstraints = {
        @UniqueConstraint(name = "uk_card_product_option_product_type", columnNames = { "card_product_id", "box_type" })
})
public class CardProductOption extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_product_id", nullable = false)
    private CardProduct cardProduct;

    @Enumerated(EnumType.STRING)
    @Column(name = "box_type", nullable = false, length = 30)
    private BoxType boxType;

    @Column(name = "option_name", length = 100)
    private String optionName;

    @Column(name = "cards_per_pack")
    private Integer cardsPerPack;

    @Column(name = "packs_per_box")
    private Integer packsPerBox;

    @Column(name = "boxes_per_case")
    private Integer boxesPerCase;

    @Column(name = "estimated_price", precision = 12, scale = 2)
    private BigDecimal estimatedPrice;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "configuration_text", length = 1000)
    private String configurationText;

    public CardProductOption(
            CardProduct cardProduct,
            BoxType boxType,
            String optionName,
            Integer cardsPerPack,
            Integer packsPerBox,
            Integer boxesPerCase,
            BigDecimal estimatedPrice,
            String currency,
            String configurationText) {
        this.cardProduct = cardProduct;
        this.boxType = boxType;
        this.optionName = optionName;
        this.cardsPerPack = cardsPerPack;
        this.packsPerBox = packsPerBox;
        this.boxesPerCase = boxesPerCase;
        this.estimatedPrice = estimatedPrice;
        this.currency = currency;
        this.configurationText = configurationText;
    }
}
