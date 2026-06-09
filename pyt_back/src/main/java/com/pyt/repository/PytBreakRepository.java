package com.pyt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.PytBreak;

public interface PytBreakRepository extends JpaRepository<PytBreak, Long> {

    @Query("""
                select distinct pb
                from PytBreak pb
                join fetch pb.cardProductOption cpo
                join fetch cpo.cardProduct
                order by pb.createdAt desc
            """)
    List<PytBreak> findAllWithProductOrderByCreatedAtDesc();

    @Query("""
                select pb
                from PytBreak pb
                join fetch pb.cardProductOption cpo
                join fetch cpo.cardProduct
                where pb.id = :pytId
            """)
    Optional<PytBreak> findDetailById(@Param("pytId") Long pytId);
}
