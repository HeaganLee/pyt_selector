package com.pyt.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.config.JwtTokenProvider;
import com.pyt.dto.LoginReqDto;
import com.pyt.dto.LoginRespDto;
import com.pyt.dto.PasswordChangeReqDto;
import com.pyt.dto.ProfileImageUpdateReqDto;
import com.pyt.dto.SellerSummaryRespDto;
import com.pyt.dto.SignupReqDto;
import com.pyt.dto.UserProfileRespDto;
import com.pyt.entities.User;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.UserRoleType;
import com.pyt.repository.PytBreakRepository;
import com.pyt.repository.PytEntryRepository;
import com.pyt.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PytBreakRepository pytBreakRepository;
    private final PytEntryRepository pytEntryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void signup(SignupReqDto reqDto) {
        if (userRepository.existsByEmail(reqDto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = new User(
                reqDto.getEmail(),
                passwordEncoder.encode(reqDto.getPassword()),
                reqDto.getName(),
                reqDto.getNickname(),
                reqDto.getPhoneNumber(),
                reqDto.getProfileImageUrl(),
                UserRoleType.USER,
                ActiveStatus.ACTIVE);

        userRepository.save(user);
    }

    public LoginRespDto login(LoginReqDto reqDto) {
        User user = userRepository.findByEmail(reqDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(reqDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (user.getActiveStatus() != ActiveStatus.ACTIVE) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user);

        return new LoginRespDto(
                accessToken,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getUserRoleType(),
                user.getProfileImageUrl());
    }

    public UserProfileRespDto getMyProfile(String authorizationHeader) {
        return new UserProfileRespDto(getCurrentActiveUser(authorizationHeader));
    }

    @Transactional
    public UserProfileRespDto updateProfileImage(
            String authorizationHeader,
            ProfileImageUpdateReqDto reqDto) {
        User user = getCurrentActiveUser(authorizationHeader);

        String profileImageUrl = reqDto.getProfileImageUrl();
        user.setProfileImageUrl(profileImageUrl == null || profileImageUrl.isBlank()
                ? null
                : profileImageUrl.trim());

        return new UserProfileRespDto(user);
    }

    @Transactional
    public void changePassword(
            String authorizationHeader,
            PasswordChangeReqDto reqDto) {
        User user = getCurrentActiveUser(authorizationHeader);

        if (reqDto.getCurrentPassword() == null || reqDto.getCurrentPassword().isBlank()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
        }

        if (reqDto.getNewPassword() == null || reqDto.getNewPassword().isBlank()) {
            throw new IllegalArgumentException("변경할 비밀번호를 입력해주세요.");
        }

        if (!passwordEncoder.matches(reqDto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        user.setPassword(passwordEncoder.encode(reqDto.getNewPassword()));
    }

    public SellerSummaryRespDto getMySellerSummary(String authorizationHeader) {
        User user = getCurrentActiveUser(authorizationHeader);

        if (user.getUserRoleType() != UserRoleType.SELLER) {
            throw new AccessDeniedException("셀러 권한이 필요합니다.");
        }

        String sellerUserId = user.getId();
        long pytBreakCount = pytBreakRepository.countByCreatedByUserId(sellerUserId);
        long pytSaleCount = pytEntryRepository.countPaidSalesBySellerUserId(sellerUserId);
        BigDecimal totalSalesAmount = pytEntryRepository.sumPaidSalesAmountBySellerUserId(sellerUserId);

        return new SellerSummaryRespDto(
                pytBreakCount,
                pytSaleCount,
                0,
                totalSalesAmount == null ? BigDecimal.ZERO : totalSalesAmount);
    }

    private User getCurrentActiveUser(String authorizationHeader) {
        String token = resolveBearerToken(authorizationHeader);

        String userId;
        try {
            userId = jwtTokenProvider.getUserId(token);
        } catch (Exception e) {
            throw new AccessDeniedException("유효하지 않은 인증 정보입니다.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AccessDeniedException("사용자를 찾을 수 없습니다."));

        if (user.getActiveStatus() != ActiveStatus.ACTIVE) {
            throw new AccessDeniedException("비활성화된 계정입니다.");
        }

        return user;
    }

    private String resolveBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new AccessDeniedException("로그인이 필요합니다.");
        }

        String bearerPrefix = "Bearer ";

        if (!authorizationHeader.startsWith(bearerPrefix)) {
            throw new AccessDeniedException("유효하지 않은 인증 정보입니다.");
        }

        return authorizationHeader.substring(bearerPrefix.length()).trim();
    }
}
