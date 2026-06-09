package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.PytFiller;

public interface PytFillerRepository extends JpaRepository<PytFiller, Long> {

    List<PytFiller> findByPytBreakIdOrderByIdAsc(Long pytBreakId);
}
