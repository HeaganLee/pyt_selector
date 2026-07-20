package com.pyt.repository;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pyt.entities.CardTradePurchase;

public interface CardTradePurchaseRepository extends JpaRepository<CardTradePurchase, Long> {

    boolean existsByCardTradeListingIdAndPurchaseStatus(
            Long cardTradeListingId,
            com.pyt.enums.CardTradePurchaseStatus purchaseStatus);

    @Query("""
                select count(purchase)
                from CardTradePurchase purchase
                where purchase.sellerUser.id = :sellerUserId
                  and purchase.purchaseStatus = com.pyt.enums.CardTradePurchaseStatus.PAID
            """)
    long countPaidSalesBySellerUserId(@Param("sellerUserId") String sellerUserId);

    @Query("""
                select coalesce(sum(purchase.paidAmount + purchase.shippingFee), 0)
                from CardTradePurchase purchase
                where purchase.sellerUser.id = :sellerUserId
                  and purchase.purchaseStatus = com.pyt.enums.CardTradePurchaseStatus.PAID
            """)
    BigDecimal sumPaidSalesAmountBySellerUserId(@Param("sellerUserId") String sellerUserId);
}
