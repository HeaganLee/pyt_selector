package com.pyt.dto.seller.req;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SellerApplicationCreateReqDto {

    private String email;
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
}
