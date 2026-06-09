package com.pyt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.PytFillerTeam;

public interface PytFillerTeamRepository extends JpaRepository<PytFillerTeam, Long> {

    List<PytFillerTeam> findByPytFillerIdOrderByIdAsc(Long pytFillerId);

    Optional<PytFillerTeam> findByPytFillerIdAndPytTeamSlotId(Long pytFillerId, Long pytTeamSlotId);
}
