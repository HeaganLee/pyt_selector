package com.pyt.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.SellerApplication;
import com.pyt.enums.SellerApplicationStatus;

public interface SellerApplicationRepository extends JpaRepository<SellerApplication, Long> {

    boolean existsByUserIdAndApplicationStatus(String userId, SellerApplicationStatus applicationStatus);

    Optional<SellerApplication> findTopByUserEmailOrderByCreatedAtDesc(String email);

    @EntityGraph(attributePaths = "user")
    List<SellerApplication> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = "user")
    List<SellerApplication> findByApplicationStatusOrderByCreatedAtDesc(SellerApplicationStatus applicationStatus);
}
