package com.pyt.entities;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.TierCriteriaType;

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
@Table(name = "card_product_tier_criteria", uniqueConstraints = {
        @UniqueConstraint(name = "uk_card_product_tier_criteria_product_type", columnNames = { "card_product_id",
                "criteria_type" })
})
public class CardProductTierCriteria extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_product_id", nullable = false)
    private CardProduct cardProduct;

    @Enumerated(EnumType.STRING)
    @Column(name = "criteria_type", nullable = false, length = 50)
    private TierCriteriaType criteriaType;

    @Column(name = "criteria_name", nullable = false, length = 100)
    private String criteriaName;

    @Column(name = "description", length = 1000)
    private String description;

    public CardProductTierCriteria(
            CardProduct cardProduct,
            TierCriteriaType criteriaType,
            String criteriaName,
            String description) {
        this.cardProduct = cardProduct;
        this.criteriaType = criteriaType;
        this.criteriaName = criteriaName;
        this.description = description;
    }
}
