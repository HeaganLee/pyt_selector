package com.pyt.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.CardProduct;

public interface CardProductRepository extends JpaRepository<CardProduct, Long> {

    @EntityGraph(attributePaths = "cardCompany")
    List<CardProduct> findByReleaseDateBetweenOrderByReleaseDateAsc(
            LocalDate startDate,
            LocalDate endDate);
}
