package com.pyt.entities;

import com.pyt.entities.bases.BaseTimeEntity;

import jakarta.persistence.Entity;
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

@Entity
@Table(name = "pyt_filler_teams")
@Getter
@Setter
@NoArgsConstructor
public class PytFillerTeam extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pyt_filler_id", nullable = false)
    private PytFiller pytFiller;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pyt_team_slot_id", nullable = false)
    private PytTeamSlot pytTeamSlot;

    public PytFillerTeam(PytFiller pytFiller, PytTeamSlot pytTeamSlot) {
        this.pytFiller = pytFiller;
        this.pytTeamSlot = pytTeamSlot;
    }
}