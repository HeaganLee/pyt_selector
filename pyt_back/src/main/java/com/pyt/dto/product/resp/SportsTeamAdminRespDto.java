package com.pyt.dto.product.resp;

import com.pyt.entities.SportsTeam;
import com.pyt.enums.LeagueLevelType;
import com.pyt.enums.SportType;

import lombok.Getter;

@Getter
public class SportsTeamAdminRespDto {

    private Long id;

    private SportType sportType;

    private String name;

    private String shortName;

    private String leagueName;

    private LeagueLevelType leagueLevelType;

    public SportsTeamAdminRespDto(SportsTeam team) {
        this.id = team.getId();
        this.sportType = team.getSportType();
        this.name = team.getName();
        this.shortName = team.getShortName();
        this.leagueName = team.getLeagueName();
        this.leagueLevelType = team.getLeagueLevelType();
    }
}
