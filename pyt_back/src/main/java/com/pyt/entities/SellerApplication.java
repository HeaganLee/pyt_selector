package com.pyt.entities;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.SellerApplicationStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "seller_applications")
@Getter
@Setter
@NoArgsConstructor
public class SellerApplication extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "application_status", nullable = false, length = 30)
    private SellerApplicationStatus applicationStatus;

    @Column(name = "store_name", length = 100)
    private String storeName;

    @Column(name = "business_type", length = 30)
    private String businessType;

    @Column(name = "contact_name", length = 50)
    private String contactName;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "settlement_bank", length = 50)
    private String settlementBank;

    @Column(name = "settlement_account_holder", length = 50)
    private String settlementAccountHolder;

    @Column(name = "settlement_account_number", length = 80)
    private String settlementAccountNumber;

    @Column(name = "shipping_policy", length = 500)
    private String shippingPolicy;

    @Column(name = "main_product_categories", length = 300)
    private String mainProductCategories;

    @Column(name = "sales_channel_url", length = 500)
    private String salesChannelUrl;

    @Column(name = "experience_note", length = 1000)
    private String experienceNote;

    @Column(name = "seller_policy_agreed")
    private Boolean sellerPolicyAgreed;

    public SellerApplication(
            User user,
            SellerApplicationStatus applicationStatus,
            String storeName,
            String businessType,
            String contactName,
            String contactPhone,
            String settlementBank,
            String settlementAccountHolder,
            String settlementAccountNumber,
            String shippingPolicy,
            String mainProductCategories,
            String salesChannelUrl,
            String experienceNote,
            Boolean sellerPolicyAgreed) {
        this.user = user;
        this.applicationStatus = applicationStatus;
        this.storeName = storeName;
        this.businessType = businessType;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
        this.settlementBank = settlementBank;
        this.settlementAccountHolder = settlementAccountHolder;
        this.settlementAccountNumber = settlementAccountNumber;
        this.shippingPolicy = shippingPolicy;
        this.mainProductCategories = mainProductCategories;
        this.salesChannelUrl = salesChannelUrl;
        this.experienceNote = experienceNote;
        this.sellerPolicyAgreed = sellerPolicyAgreed;
    }
}
