package com.pyt.dto.seller.resp;

import java.time.LocalDateTime;

import com.pyt.entities.SellerApplication;
import com.pyt.enums.SellerApplicationStatus;

import lombok.Getter;

@Getter
public class SellerApplicationRespDto {

    private Long id;
    private String userId;
    private String email;
    private SellerApplicationStatus status;
    private LocalDateTime createdAt;
    private String storeName;
    private String businessType;
    private String contactName;
    private String contactPhone;
    private String settlementBank;
    private String settlementAccountHolder;
    private String settlementAccountNumber;
    private String shippingPolicy;
    private String mainProductCategories;
    private String salesChannelUrl;
    private String experienceNote;
    private Boolean sellerPolicyAgreed;

    public SellerApplicationRespDto(SellerApplication sellerApplication) {
        this.id = sellerApplication.getId();
        this.userId = sellerApplication.getUser().getId();
        this.email = sellerApplication.getUser().getEmail();
        this.status = sellerApplication.getApplicationStatus();
        this.createdAt = sellerApplication.getCreatedAt();
        this.storeName = sellerApplication.getStoreName();
        this.businessType = sellerApplication.getBusinessType();
        this.contactName = sellerApplication.getContactName();
        this.contactPhone = sellerApplication.getContactPhone();
        this.settlementBank = sellerApplication.getSettlementBank();
        this.settlementAccountHolder = sellerApplication.getSettlementAccountHolder();
        this.settlementAccountNumber = sellerApplication.getSettlementAccountNumber();
        this.shippingPolicy = sellerApplication.getShippingPolicy();
        this.mainProductCategories = sellerApplication.getMainProductCategories();
        this.salesChannelUrl = sellerApplication.getSalesChannelUrl();
        this.experienceNote = sellerApplication.getExperienceNote();
        this.sellerPolicyAgreed = sellerApplication.getSellerPolicyAgreed();
    }
}
