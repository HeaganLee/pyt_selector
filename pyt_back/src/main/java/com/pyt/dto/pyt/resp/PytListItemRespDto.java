package com.pyt.dto.pyt.resp;

import com.pyt.entities.PytBreak;

import lombok.Getter;

@Getter
public class PytListItemRespDto {

        private Long id;
        private Long cardProductOptionId;
        private Long cardProductId;
        private String title;

        private String brandName;
        private String productName;
        private String imageUrl;
        private String sportType;

        private String optionName;
        private String boxType;

        private String breakUnitType;
        private Integer roundNo;
        private Integer boxCount;
        private String pytStatus;

        private Integer totalTeamCount;
        private Integer remainingTeamCount;

        private Boolean fillerEnabled;

        public PytListItemRespDto(
                        PytBreak pytBreak,
                        Integer totalTeamCount,
                        Integer remainingTeamCount) {
                this.id = pytBreak.getId();
                this.cardProductOptionId = pytBreak.getCardProductOption().getId();
                this.cardProductId = pytBreak.getCardProductOption()
                                .getCardProduct()
                                .getId();
                this.title = pytBreak.getTitle();

                this.brandName = pytBreak.getCardProductOption()
                                .getCardProduct()
                                .getBrandName();

                this.productName = pytBreak.getCardProductOption()
                                .getCardProduct()
                                .getProductName();

                this.imageUrl = pytBreak.getCardProductOption()
                                .getCardProduct()
                                .getImageUrl();

                this.sportType = pytBreak.getCardProductOption()
                                .getCardProduct()
                                .getSportType()
                                .name();

                this.optionName = pytBreak.getCardProductOption().getOptionName();
                this.boxType = pytBreak.getCardProductOption().getBoxType().name();

                this.breakUnitType = pytBreak.getBreakUnitType().name();
                this.roundNo = pytBreak.getRoundNo();
                this.boxCount = pytBreak.getBoxCount();
                this.pytStatus = pytBreak.getPytStatus().name();

                this.totalTeamCount = totalTeamCount;
                this.remainingTeamCount = remainingTeamCount;

                this.fillerEnabled = true;
        }
}
