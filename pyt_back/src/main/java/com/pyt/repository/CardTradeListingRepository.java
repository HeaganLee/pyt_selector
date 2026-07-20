package com.pyt.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.pyt.entities.CardTradeListing;
import com.pyt.enums.CardTradeStatus;

public interface CardTradeListingRepository extends JpaRepository<CardTradeListing, Long> {

    @EntityGraph(attributePaths = "sellerUser")
    List<CardTradeListing> findByTradeStatusInOrderByCreatedAtDescIdDesc(Collection<CardTradeStatus> tradeStatuses);

    @EntityGraph(attributePaths = "sellerUser")
    List<CardTradeListing> findByLeagueNameAndTradeStatusInOrderByCreatedAtDescIdDesc(
            String leagueName,
            Collection<CardTradeStatus> tradeStatuses);

    @EntityGraph(attributePaths = "sellerUser")
    Optional<CardTradeListing> findById(Long id);

    @EntityGraph(attributePaths = "sellerUser")
    List<CardTradeListing> findBySellerUserIdOrderByCreatedAtDescIdDesc(String sellerUserId);
}
