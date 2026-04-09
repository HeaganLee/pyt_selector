package com.pyt.entities;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.LeagueLevelType;
import com.pyt.enums.SportType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "sports_teams", uniqueConstraints = {
        @UniqueConstraint(name = "uk_team_sport_name_level", columnNames = { "sport_type", "name",
                "league_level_type" })
})
public class SportsTeam extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false, length = 30)
    private SportType sportType;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "short_name", length = 50)
    private String shortName;

    @Column(name = "league_name", length = 100)
    private String leagueName;

    @Enumerated(EnumType.STRING)
    @Column(name = "league_level_type", nullable = false, length = 30)
    private LeagueLevelType leagueLevelType;

    @Column(name = "parent_team_name", length = 100)
    private String parentTeamName;

    @Enumerated(EnumType.STRING)
    @Column(name = "active_status", nullable = false, length = 20)
    private ActiveStatus activeStatus;

    public SportsTeam(
            SportType sportType,
            String name,
            String shortName,
            String leagueName,
            LeagueLevelType leagueLevelType,
            String parentTeamName,
            ActiveStatus activeStatus) {
        this.sportType = sportType;
        this.name = name;
        this.shortName = shortName;
        this.leagueName = leagueName;
        this.leagueLevelType = leagueLevelType;
        this.parentTeamName = parentTeamName;
        this.activeStatus = activeStatus;
    }
}
