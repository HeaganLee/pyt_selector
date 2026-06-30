package com.pyt.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.CardProductTierCriteria;
import com.pyt.enums.TierCriteriaType;

public interface CardProductTierCriteriaRepository extends JpaRepository<CardProductTierCriteria, Long> {

    boolean existsByCardProductIdAndCriteriaType(Long cardProductId, TierCriteriaType criteriaType);
}
