package com.pyt.dto.pyt.resp;

import java.util.List;

import com.pyt.entities.PytBreak;

import lombok.Getter;

@Getter
public class PytDetailRespDto {
        private Long id;
        private String title;

        private String brandName;
        private String productName;
        private String imageUrl;
        private String checklistUrl;
        private String sportType;

        private String optionName;
        private String boxType;

        private String breakUnitType;
        private Integer roundNo;
        private Integer boxCount;
        private String pytStatus;
        private Boolean fillerEnabled;

        private List<PytTeamSlotRespDto> teamSlots;

        public PytDetailRespDto(
                        PytBreak pytBreak,
                        List<PytTeamSlotRespDto> teamSlots) {
                this.id = pytBreak.getId();
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

                this.checklistUrl = pytBreak.getCardProductOption()
                                .getCardProduct()
                                .getChecklistUrl();

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
                this.fillerEnabled = pytBreak.getFillerEnabled();

                this.teamSlots = teamSlots;
        }
}
