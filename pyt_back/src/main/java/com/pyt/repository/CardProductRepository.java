package com.pyt.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.CardProduct;

public interface CardProductRepository extends JpaRepository<CardProduct, Long> {

    @EntityGraph(attributePaths = "cardCompany")
    List<CardProduct> findByReleaseDateBetweenOrderByReleaseDateAsc(
            LocalDate startDate,
            LocalDate endDate);

    @Query("""
                select distinct cp
                from CardProduct cp
                join fetch cp.cardCompany
                left join fetch cp.tierCriteria tc
                where cp.id = :productId
            """)
    Optional<CardProduct> findDetailById(@Param("productId") Long productId);
}
