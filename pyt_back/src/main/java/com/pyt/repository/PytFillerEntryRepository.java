package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.PytFillerEntry;

public interface PytFillerEntryRepository extends JpaRepository<PytFillerEntry, Long> {

    List<PytFillerEntry> findByPytFillerIdOrderBySlotNoAsc(Long pytFillerId);

    long countByPytFillerId(Long pytFillerId);
}
