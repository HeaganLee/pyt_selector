package com.pyt.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.PytEntry;

public interface PytEntryRepository extends JpaRepository<PytEntry, Long> {

    List<PytEntry> findByPytBreakIdOrderByIdAsc(Long pytBreakId);

    List<PytEntry> findByPytTeamSlotIdOrderByIdAsc(Long pytTeamSlotId);

    long countByPytBreakId(Long pytBreakId);

    @Query("""
                select count(entry)
                from PytEntry entry
                where entry.pytBreak.createdByUser.id = :sellerUserId
                  and entry.entryStatus = com.pyt.enums.PytEntryStatus.PAID
            """)
    long countPaidSalesBySellerUserId(@Param("sellerUserId") String sellerUserId);

    @Query("""
                select coalesce(sum(entry.paidAmount), 0)
                from PytEntry entry
                where entry.pytBreak.createdByUser.id = :sellerUserId
                  and entry.entryStatus = com.pyt.enums.PytEntryStatus.PAID
            """)
    BigDecimal sumPaidSalesAmountBySellerUserId(@Param("sellerUserId") String sellerUserId);
}
