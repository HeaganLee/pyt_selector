package com.pyt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.CardProductOption;

public interface CardProductOptionRepository extends JpaRepository<CardProductOption, Long> {

    @EntityGraph(attributePaths = "cardProduct")
    List<CardProductOption> findAllByOrderByIdAsc();

    @Query("""
                select cpo
                from CardProductOption cpo
                join fetch cpo.cardProduct
                where cpo.id = :optionId
            """)
    Optional<CardProductOption> findWithCardProductById(@Param("optionId") Long optionId);
}
