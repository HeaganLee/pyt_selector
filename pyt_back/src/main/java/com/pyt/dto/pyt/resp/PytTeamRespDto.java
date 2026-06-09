package com.pyt.dto.pyt.resp;

import com.pyt.entities.SportsTeam;

import lombok.Getter;

@Getter
public class PytTeamRespDto {

    private Long id;
    private String name;
    private String shortName;
    private String sportType;

    public PytTeamRespDto(SportsTeam team) {
        this.id = team.getId();
        this.name = team.getName();
        this.shortName = team.getShortName();
        this.sportType = team.getSportType().name();
    }
}
