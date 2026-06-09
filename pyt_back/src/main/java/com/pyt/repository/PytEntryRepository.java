package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.PytEntry;

public interface PytEntryRepository extends JpaRepository<PytEntry, Long> {

    List<PytEntry> findByPytBreakIdOrderByIdAsc(Long pytBreakId);

    List<PytEntry> findByPytTeamSlotIdOrderByIdAsc(Long pytTeamSlotId);
}
