package com.pyt.dto.product.resp;

import com.pyt.entities.CardCompany;

import lombok.Getter;

@Getter
public class CardCompanyRespDto {

    private Long id;

    private String name;

    private String displayName;

    private String country;

    public CardCompanyRespDto(CardCompany cardCompany) {
        this.id = cardCompany.getId();
        this.name = cardCompany.getName();
        this.displayName = cardCompany.getDisplayName();
        this.country = cardCompany.getCountry();
    }
}
