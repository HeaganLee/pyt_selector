package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.PytFillerEntry;

public interface PytFillerEntryRepository extends JpaRepository<PytFillerEntry, Long> {

    List<PytFillerEntry> findByPytFillerIdOrderBySlotNoAsc(Long pytFillerId);

    long countByPytFillerId(Long pytFillerId);

    boolean existsByPytFillerIdAndUserId(Long pytFillerId, String userId);

    @Query("""
                select entry
                from PytFillerEntry entry
                join fetch entry.user
                where entry.pytFiller.id = :fillerId
                order by entry.slotNo asc
            """)
    List<PytFillerEntry> findWithUserByPytFillerIdOrderBySlotNoAsc(@Param("fillerId") Long fillerId);
}
