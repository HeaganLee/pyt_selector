package com.pyt.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SignupReqDto {

    private String email;

    private String password;

    private String name;

    private String nickname;

    private String phoneNumber;

    private String profileImageUrl;
}