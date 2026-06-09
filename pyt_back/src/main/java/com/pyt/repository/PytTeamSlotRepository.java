package com.pyt.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.PytTeamSlot;
import com.pyt.enums.PytTeamSlotStatus;

public interface PytTeamSlotRepository extends JpaRepository<PytTeamSlot, Long> {

    List<PytTeamSlot> findByPytBreakIdOrderByIdAsc(Long pytBreakId);

    Optional<PytTeamSlot> findByIdAndPytBreakId(Long id, Long pytBreakId);

    List<PytTeamSlot> findByPytBreakIdAndIdIn(Long pytBreakId, Collection<Long> teamSlotIds);

    long countByPytBreakId(Long pytBreakId);

    long countByPytBreakIdAndSlotStatus(Long pytBreakId, PytTeamSlotStatus slotStatus);

    @Query("""
                select count(slot)
                from PytTeamSlot slot
                where slot.pytBreak.id = :pytId
                  and slot.slotStatus = com.pyt.enums.PytTeamSlotStatus.AVAILABLE
            """)
    long countAvailableByPytBreakId(@Param("pytId") Long pytId);

    @Query("""
                select slot
                from PytTeamSlot slot
                join fetch slot.team
                left join fetch slot.buyerUser
                where slot.pytBreak.id = :pytId
                order by slot.id asc
            """)
    List<PytTeamSlot> findWithTeamAndBuyerUserByPytBreakId(@Param("pytId") Long pytId);
}
