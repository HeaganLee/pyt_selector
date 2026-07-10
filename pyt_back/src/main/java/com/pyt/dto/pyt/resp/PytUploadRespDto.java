package com.pyt.dto.pyt.resp;

import java.util.List;

import lombok.Getter;

@Getter
public class PytUploadRespDto {

    private final List<Long> pytIds;
    private final List<String> sheetNames;
    private final List<PytUploadItemRespDto> items;
    private final int createdCount;

    public PytUploadRespDto(
            List<Long> pytIds,
            List<String> sheetNames,
            List<PytUploadItemRespDto> items) {
        this.pytIds = pytIds;
        this.sheetNames = sheetNames;
        this.items = items;
        this.createdCount = pytIds.size();
    }

    @Getter
    public static class PytUploadItemRespDto {

        private final Long pytId;
        private final String sheetName;
        private final String title;
        private final String breakUnitType;
        private final Integer roundNo;
        private final Integer boxCount;
        private final int teamCount;
        private final String totalPrice;
        private final List<PytUploadTeamPriceRespDto> teamPrices;

        public PytUploadItemRespDto(
                Long pytId,
                String sheetName,
                String title,
                String breakUnitType,
                Integer roundNo,
                Integer boxCount,
                int teamCount,
                String totalPrice,
                List<PytUploadTeamPriceRespDto> teamPrices) {
            this.pytId = pytId;
            this.sheetName = sheetName;
            this.title = title;
            this.breakUnitType = breakUnitType;
            this.roundNo = roundNo;
            this.boxCount = boxCount;
            this.teamCount = teamCount;
            this.totalPrice = totalPrice;
            this.teamPrices = teamPrices;
        }
    }

    @Getter
    public static class PytUploadTeamPriceRespDto {

        private final Long teamId;
        private final String teamName;
        private final String shortName;
        private final String price;
        private final Boolean fillerOnly;

        public PytUploadTeamPriceRespDto(
                Long teamId,
                String teamName,
                String shortName,
                String price,
                Boolean fillerOnly) {
            this.teamId = teamId;
            this.teamName = teamName;
            this.shortName = shortName;
            this.price = price;
            this.fillerOnly = Boolean.TRUE.equals(fillerOnly);
        }
    }
}
