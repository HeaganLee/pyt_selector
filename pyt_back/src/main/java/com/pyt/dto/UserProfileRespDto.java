package com.pyt.dto;

import java.time.LocalDateTime;

import com.pyt.entities.User;
import com.pyt.enums.UserRoleType;

import lombok.Getter;

@Getter
public class UserProfileRespDto {

    private String userId;

    private String email;

    private String name;

    private String nickname;

    private String phoneNumber;

    private UserRoleType userRoleType;

    private String profileImageUrl;

    private LocalDateTime registeredAt;

    public UserProfileRespDto(User user) {
        this.userId = user.getId();
        this.email = user.getEmail();
        this.name = user.getName();
        this.nickname = user.getNickname();
        this.phoneNumber = user.getPhoneNumber();
        this.userRoleType = user.getUserRoleType();
        this.profileImageUrl = user.getProfileImageUrl();
        this.registeredAt = user.getRegisteredAt();
    }
}
