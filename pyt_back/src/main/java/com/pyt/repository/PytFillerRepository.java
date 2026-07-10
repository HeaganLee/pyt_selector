package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.PytFiller;
import com.pyt.enums.FillerStatus;

public interface PytFillerRepository extends JpaRepository<PytFiller, Long> {

    List<PytFiller> findByPytBreakIdOrderByIdAsc(Long pytBreakId);

    long countByPytBreakId(Long pytBreakId);

    boolean existsByPytBreakIdAndIdNotAndFillerStatus(Long pytBreakId, Long fillerId, FillerStatus fillerStatus);

    boolean existsByPytBreakIdAndFillerRoundNo(Long pytBreakId, Integer fillerRoundNo);

    @Query("""
                select coalesce(max(filler.fillerRoundNo), 0)
                from PytFiller filler
                where filler.pytBreak.id = :pytId
            """)
    Integer findMaxFillerRoundNoByPytBreakId(@Param("pytId") Long pytId);

    @Query("""
                select coalesce(sum(filler.boxCount), 0)
                from PytFiller filler
                where filler.pytBreak.id = :pytId
            """)
    Long sumBoxCountByPytBreakId(@Param("pytId") Long pytId);
}
