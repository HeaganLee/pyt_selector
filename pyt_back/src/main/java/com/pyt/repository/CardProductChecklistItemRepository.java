package com.pyt.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.pyt.entities.CardProductChecklistItem;

public interface CardProductChecklistItemRepository extends JpaRepository<CardProductChecklistItem, Long> {

    @Query("""
                select ci
                from CardProductChecklistItem ci
                join fetch ci.cardProduct cp
                join fetch cp.cardCompany
                left join fetch ci.team
                order by cp.releaseDate desc, cp.id desc, ci.sectionName asc, ci.cardNumber asc, ci.id asc
            """)
    List<CardProductChecklistItem> findAllForPublicChecklist();
}
