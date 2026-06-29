package com.pyt.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.dto.seller.req.SellerApplicationCreateReqDto;
import com.pyt.dto.seller.resp.SellerApplicationRespDto;
import com.pyt.entities.SellerApplication;
import com.pyt.entities.User;
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

    @Transactional
    public SellerApplicationRespDto apply(SellerApplicationCreateReqDto reqDto) {
        if (reqDto.getEmail() == null || reqDto.getEmail().isBlank()) {
            throw new IllegalArgumentException("이메일이 필요합니다.");
        }

        User user = userRepository.findByEmail(reqDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (user.getUserRoleType() != UserRoleType.USER) {
            throw new IllegalArgumentException("일반 회원만 셀러 신청을 할 수 있습니다.");
        }

        boolean hasPendingApplication = sellerApplicationRepository.existsByUserIdAndApplicationStatus(
                user.getId(),
                SellerApplicationStatus.PENDING);

        if (hasPendingApplication) {
            throw new IllegalArgumentException("이미 처리 대기 중인 셀러 신청이 있습니다.");
        }

        SellerApplication sellerApplication = sellerApplicationRepository.save(new SellerApplication(
                user,
                SellerApplicationStatus.PENDING));

        return new SellerApplicationRespDto(sellerApplication);
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
}
