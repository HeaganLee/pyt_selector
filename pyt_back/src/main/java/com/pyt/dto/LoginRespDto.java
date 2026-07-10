package com.pyt.dto;

import com.pyt.enums.UserRoleType;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginRespDto {

    private String accessToken;

    private String userId;

    private String email;

    private String name;

    private String nickname;

    private UserRoleType userRoleType;

    private String profileImageUrl;
}
