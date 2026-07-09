package com.pyt.service;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.pyt.config.JwtTokenProvider;
import com.pyt.enums.UserRoleType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerAuthorizationService {

    private final JwtTokenProvider jwtTokenProvider;

    public void validateSellerAuthorization(String authorizationHeader) {
        String token = resolveBearerToken(authorizationHeader);

        try {
            UserRoleType userRoleType = jwtTokenProvider.getUserRoleType(token);

            if (userRoleType != UserRoleType.SELLER) {
                throw new AccessDeniedException("셀러 권한이 필요합니다.");
            }
        } catch (AccessDeniedException e) {
            throw e;
        } catch (Exception e) {
            throw new AccessDeniedException("유효하지 않은 인증 정보입니다.");
        }
    }

    private String resolveBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new AccessDeniedException("셀러 권한이 필요합니다.");
        }

        String bearerPrefix = "Bearer ";
        if (!authorizationHeader.startsWith(bearerPrefix)) {
            throw new AccessDeniedException("유효하지 않은 인증 정보입니다.");
        }

        return authorizationHeader.substring(bearerPrefix.length()).trim();
    }
}
