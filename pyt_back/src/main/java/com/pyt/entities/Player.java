package com.pyt.entities;

import java.time.LocalDate;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.LeagueLevelType;
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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "players", uniqueConstraints = {
        @UniqueConstraint(name = "uk_player_sport_name_birth", columnNames = { "sport_type", "name", "birth_date" })
})
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false, length = 30)
    private SportType sportType;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "english_name", length = 100)
    private String englishName;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "position", length = 50)
    private String position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_team_id")
    private SportsTeam currentTeam;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_level", nullable = false, length = 30)
    private LeagueLevelType currentLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "active_status", nullable = false, length = 20)
    private ActiveStatus activeStatus;

    public Player(
            SportType sportType,
            String name,
            String englishName,
            LocalDate birthDate,
            String position,
            SportsTeam currentTeam,
            ActiveStatus activeStatus) {
        this.sportType = sportType;
        this.name = name;
        this.englishName = englishName;
        this.birthDate = birthDate;
        this.position = position;
        this.currentTeam = currentTeam;
        this.activeStatus = activeStatus;
    }
}
