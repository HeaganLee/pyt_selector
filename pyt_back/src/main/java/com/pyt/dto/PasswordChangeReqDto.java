package com.pyt.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PasswordChangeReqDto {

    private String currentPassword;

    private String newPassword;
}
