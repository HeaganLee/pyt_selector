package com.pyt.dto.pyt.resp;

import java.util.List;

import lombok.Getter;

@Getter
public class PytCreateDataRespDto {

    private List<PytProductOptionRespDto> productOptions;
    private List<PytTeamRespDto> teams;

    public PytCreateDataRespDto(
            List<PytProductOptionRespDto> productOptions,
            List<PytTeamRespDto> teams) {
        this.productOptions = productOptions;
        this.teams = teams;
    }
}
