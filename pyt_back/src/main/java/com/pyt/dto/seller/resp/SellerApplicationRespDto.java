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

    public SellerApplicationRespDto(SellerApplication sellerApplication) {
        this.id = sellerApplication.getId();
        this.userId = sellerApplication.getUser().getId();
        this.email = sellerApplication.getUser().getEmail();
        this.status = sellerApplication.getApplicationStatus();
        this.createdAt = sellerApplication.getCreatedAt();
    }
}
