package com.pyt.entities;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.BoxType;
import com.pyt.enums.SportType;

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

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "card_boxes")
public class CardBox extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_company_id", nullable = false)
    private CardCompany cardCompany;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false, length = 30)
    private SportType sportType;

    @Column(name = "brand_name", nullable = false, length = 100)
    private String brandName;

    @Column(name = "product_name", nullable = false, length = 150)
    private String productName;

    @Column(name = "release_year", nullable = false)
    private Integer releaseYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "box_type", nullable = false, length = 30)
    private BoxType boxType;

    @Column(name = "cards_per_pack")
    private Integer cardsPerPack;

    @Column(name = "packs_per_box")
    private Integer packsPerBox;

    @Column(name = "boxes_per_case")
    private Integer boxesPerCase;

    @Column(name = "checklist_url", length = 500)
    private String checklistUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    public CardBox(
            CardCompany cardCompany,
            SportType sportType,
            String brandName,
            String productName,
            Integer releaseYear,
            BoxType boxType,
            Integer cardsPerPack,
            Integer packsPerBox,
            Integer boxesPerCase,
            String checklistUrl,
            String imageUrl) {
        this.cardCompany = cardCompany;
        this.sportType = sportType;
        this.brandName = brandName;
        this.productName = productName;
        this.releaseYear = releaseYear;
        this.boxType = boxType;
        this.cardsPerPack = cardsPerPack;
        this.packsPerBox = packsPerBox;
        this.boxesPerCase = boxesPerCase;
        this.checklistUrl = checklistUrl;
        this.imageUrl = imageUrl;
    }
}
