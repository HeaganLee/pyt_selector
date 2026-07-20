package com.pyt.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.config.JwtTokenProvider;
import com.pyt.dto.seller.req.SellerApplicationCreateReqDto;
import com.pyt.dto.seller.resp.SellerApplicationRespDto;
import com.pyt.entities.SellerApplication;
import com.pyt.entities.User;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.SellerApplicationStatus;
import com.pyt.enums.UserRoleType;
import com.pyt.repository.SellerApplicationRepository;
import com.pyt.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerApplicationService {

    private final SellerApplicationRepository sellerApplicationRepository;
    private final UserRepository userRepository;
    private final AdminAuthorizationService adminAuthorizationService;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public SellerApplicationRespDto apply(String authorizationHeader, SellerApplicationCreateReqDto reqDto) {
        User user = getCurrentActiveUser(authorizationHeader);

        if (user.getUserRoleType() != UserRoleType.USER) {
            throw new IllegalArgumentException("일반 회원만 셀러 신청을 할 수 있습니다.");
        }

        if (reqDto.getEmail() != null
                && !reqDto.getEmail().isBlank()
                && !user.getEmail().equals(reqDto.getEmail().trim())) {
            throw new IllegalArgumentException("로그인한 계정의 이메일로만 셀러 신청을 할 수 있습니다.");
        }

        boolean hasPendingApplication = sellerApplicationRepository.existsByUserIdAndApplicationStatus(
                user.getId(),
                SellerApplicationStatus.PENDING);

        if (hasPendingApplication) {
            throw new IllegalArgumentException("이미 처리 대기 중인 셀러 신청이 있습니다.");
        }

        String storeName = requireText(reqDto.getStoreName(), "스토어명을 입력해주세요.", 100);
        String businessType = requireText(reqDto.getBusinessType(), "판매자 유형을 선택해주세요.", 30);
        if (!businessType.equals("PERSONAL") && !businessType.equals("BUSINESS")) {
            throw new IllegalArgumentException("판매자 유형이 올바르지 않습니다.");
        }

        String contactName = requireText(reqDto.getContactName(), "담당자명을 입력해주세요.", 50);
        String contactPhone = requireText(reqDto.getContactPhone(), "연락처를 입력해주세요.", 30);
        String settlementBank = requireText(reqDto.getSettlementBank(), "정산 은행을 입력해주세요.", 50);
        String settlementAccountHolder = requireText(reqDto.getSettlementAccountHolder(), "예금주를 입력해주세요.", 50);
        String settlementAccountNumber = requireText(reqDto.getSettlementAccountNumber(), "정산 계좌번호를 입력해주세요.", 80);
        String shippingPolicy = requireText(reqDto.getShippingPolicy(), "배송 정책을 입력해주세요.", 500);
        String mainProductCategories = requireText(reqDto.getMainProductCategories(), "판매 예정 카테고리를 입력해주세요.", 300);
        String salesChannelUrl = optionalText(reqDto.getSalesChannelUrl(), 500, "외부 판매 채널 URL은 500자 이하로 입력해주세요.");
        String experienceNote = requireText(reqDto.getExperienceNote(), "카드 거래 경험이나 운영 계획을 입력해주세요.", 1000);

        if (!Boolean.TRUE.equals(reqDto.getSellerPolicyAgreed())) {
            throw new IllegalArgumentException("셀러 운영 기준에 동의해주세요.");
        }

        SellerApplication sellerApplication = sellerApplicationRepository.save(new SellerApplication(
                user,
                SellerApplicationStatus.PENDING,
                storeName,
                businessType,
                contactName,
                contactPhone,
                settlementBank,
                settlementAccountHolder,
                settlementAccountNumber,
                shippingPolicy,
                mainProductCategories,
                salesChannelUrl,
                experienceNote,
                true));

        return new SellerApplicationRespDto(sellerApplication);
    }

    @Transactional(readOnly = true)
    public SellerApplicationRespDto getLatestMine(String authorizationHeader) {
        User user = getCurrentActiveUser(authorizationHeader);

        return sellerApplicationRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .map(SellerApplicationRespDto::new)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public SellerApplicationRespDto getLatestByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일이 필요합니다.");
        }

        return sellerApplicationRepository.findTopByUserEmailOrderByCreatedAtDesc(email)
                .map(SellerApplicationRespDto::new)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<SellerApplicationRespDto> getAdminApplications(
            String authorizationHeader,
            SellerApplicationStatus applicationStatus) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        List<SellerApplication> sellerApplications = applicationStatus == null
                ? sellerApplicationRepository.findAllByOrderByCreatedAtDesc()
                : sellerApplicationRepository.findByApplicationStatusOrderByCreatedAtDesc(applicationStatus);

        return sellerApplications.stream()
                .map(SellerApplicationRespDto::new)
                .toList();
    }

    @Transactional
    public SellerApplicationRespDto approve(String authorizationHeader, Long sellerApplicationId) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        SellerApplication sellerApplication = getPendingSellerApplication(sellerApplicationId);
        User user = sellerApplication.getUser();

        if (user.getUserRoleType() != UserRoleType.USER) {
            throw new IllegalArgumentException("일반 회원의 셀러 신청만 승인할 수 있습니다.");
        }

        user.setUserRoleType(UserRoleType.SELLER);
        sellerApplication.setApplicationStatus(SellerApplicationStatus.APPROVED);

        return new SellerApplicationRespDto(sellerApplication);
    }

    @Transactional
    public SellerApplicationRespDto cancel(String authorizationHeader, Long sellerApplicationId) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        SellerApplication sellerApplication = getPendingSellerApplication(sellerApplicationId);
        sellerApplication.setApplicationStatus(SellerApplicationStatus.REJECTED);

        return new SellerApplicationRespDto(sellerApplication);
    }

    private SellerApplication getPendingSellerApplication(Long sellerApplicationId) {
        SellerApplication sellerApplication = sellerApplicationRepository.findById(sellerApplicationId)
                .orElseThrow(() -> new IllegalArgumentException("셀러 신청을 찾을 수 없습니다."));

        if (sellerApplication.getApplicationStatus() != SellerApplicationStatus.PENDING) {
            throw new IllegalArgumentException("검토 대기 중인 셀러 신청만 처리할 수 있습니다.");
        }

        return sellerApplication;
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

    private String requireText(String value, String message, int maxLength) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }

        String trimmedValue = value.trim();
        if (trimmedValue.length() > maxLength) {
            throw new IllegalArgumentException(message.replace("입력해주세요.", "짧게 입력해주세요."));
        }

        return trimmedValue;
    }

    private String optionalText(String value, int maxLength, String message) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String trimmedValue = value.trim();
        if (trimmedValue.length() > maxLength) {
            throw new IllegalArgumentException(message);
        }

        return trimmedValue;
    }
}
