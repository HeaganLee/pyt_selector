package com.pyt.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.config.JwtTokenProvider;
import com.pyt.dto.trade.req.CardTradeCreateReqDto;
import com.pyt.dto.trade.resp.CardTradeDetailRespDto;
import com.pyt.dto.trade.resp.CardTradeListItemRespDto;
import com.pyt.dto.trade.resp.CardTradePurchaseRespDto;
import com.pyt.entities.CardTradeListing;
import com.pyt.entities.CardTradePurchase;
import com.pyt.entities.User;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.CardTradePurchaseStatus;
import com.pyt.enums.CardTradeStatus;
import com.pyt.repository.CardTradeListingRepository;
import com.pyt.repository.CardTradePurchaseRepository;
import com.pyt.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CardTradeService {

    private static final List<CardTradeStatus> PUBLIC_STATUSES = List.of(
            CardTradeStatus.ON_SALE,
            CardTradeStatus.SOLD_OUT);

    private final CardTradeListingRepository cardTradeListingRepository;
    private final CardTradePurchaseRepository cardTradePurchaseRepository;
    private final UserRepository userRepository;
    private final SellerAuthorizationService sellerAuthorizationService;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional(readOnly = true)
    public List<CardTradeListItemRespDto> getTradeList(String category) {
        String leagueName = normalizeOptionalText(category);

        List<CardTradeListing> listings = leagueName == null || leagueName.equals("ALL")
                ? cardTradeListingRepository.findByTradeStatusInOrderByCreatedAtDescIdDesc(PUBLIC_STATUSES)
                : cardTradeListingRepository.findByLeagueNameAndTradeStatusInOrderByCreatedAtDescIdDesc(
                        leagueName,
                        PUBLIC_STATUSES);

        return listings.stream()
                .map(CardTradeListItemRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public CardTradeDetailRespDto getTradeDetail(Long tradeId) {
        CardTradeListing listing = getListing(tradeId);
        if (listing.getTradeStatus() == CardTradeStatus.HIDDEN) {
            throw new IllegalArgumentException("거래 상품을 찾을 수 없습니다.");
        }

        return new CardTradeDetailRespDto(listing);
    }

    @Transactional(readOnly = true)
    public List<CardTradeListItemRespDto> getSellerTradeList(String authorizationHeader) {
        String sellerUserId = sellerAuthorizationService.validateSellerAuthorizationAndGetUserId(authorizationHeader);

        return cardTradeListingRepository.findBySellerUserIdOrderByCreatedAtDescIdDesc(sellerUserId)
                .stream()
                .map(CardTradeListItemRespDto::new)
                .toList();
    }

    @Transactional
    public Long createTrade(String authorizationHeader, CardTradeCreateReqDto reqDto) {
        String sellerUserId = sellerAuthorizationService.validateSellerAuthorizationAndGetUserId(authorizationHeader);
        User sellerUser = userRepository.findById(sellerUserId)
                .orElseThrow(() -> new AccessDeniedException("셀러 사용자를 찾을 수 없습니다."));

        CardTradeListing listing = cardTradeListingRepository.save(new CardTradeListing(
                sellerUser,
                requireText(reqDto.getTitle(), "상품명을 입력해주세요.", 200),
                requireLeagueName(reqDto.getLeagueName()),
                requireText(reqDto.getPlayerName(), "선수명을 입력해주세요.", 100),
                optionalText(reqDto.getTeamName(), 100, "팀명은 100자 이하로 입력해주세요."),
                optionalText(reqDto.getCardYear(), 20, "연도는 20자 이하로 입력해주세요."),
                optionalText(reqDto.getBrandName(), 100, "브랜드명은 100자 이하로 입력해주세요."),
                optionalText(reqDto.getCardNumber(), 50, "카드 번호는 50자 이하로 입력해주세요."),
                optionalText(reqDto.getGradeCompany(), 50, "그레이딩 회사는 50자 이하로 입력해주세요."),
                optionalText(reqDto.getGrade(), 30, "등급은 30자 이하로 입력해주세요."),
                requireText(reqDto.getConditionLabel(), "카드 상태를 입력해주세요.", 80),
                requirePositivePrice(reqDto.getPrice(), "판매가를 입력해주세요."),
                requireZeroOrPositivePrice(reqDto.getShippingFee()),
                optionalText(reqDto.getImageUrl(), 500, "이미지 URL은 500자 이하로 입력해주세요."),
                optionalText(reqDto.getDescription(), 2000, "설명은 2000자 이하로 입력해주세요."),
                CardTradeStatus.ON_SALE));

        return listing.getId();
    }

    @Transactional
    public CardTradePurchaseRespDto purchaseTrade(String authorizationHeader, Long tradeId) {
        User buyerUser = getCurrentActiveUser(authorizationHeader);
        CardTradeListing listing = getListing(tradeId);

        if (listing.getTradeStatus() != CardTradeStatus.ON_SALE) {
            throw new IllegalArgumentException("구매 가능한 거래 상품이 아닙니다.");
        }

        if (listing.getSellerUser().getId().equals(buyerUser.getId())) {
            throw new IllegalArgumentException("본인이 등록한 상품은 구매할 수 없습니다.");
        }

        if (cardTradePurchaseRepository.existsByCardTradeListingIdAndPurchaseStatus(
                listing.getId(),
                CardTradePurchaseStatus.PAID)) {
            throw new IllegalArgumentException("이미 구매 완료된 상품입니다.");
        }

        listing.setTradeStatus(CardTradeStatus.SOLD_OUT);

        CardTradePurchase purchase = cardTradePurchaseRepository.save(new CardTradePurchase(
                listing,
                buyerUser,
                listing.getSellerUser(),
                listing.getPrice(),
                listing.getShippingFee(),
                CardTradePurchaseStatus.PAID));

        return new CardTradePurchaseRespDto(purchase);
    }

    private CardTradeListing getListing(Long tradeId) {
        if (tradeId == null) {
            throw new IllegalArgumentException("거래 상품 ID가 필요합니다.");
        }

        return cardTradeListingRepository.findById(tradeId)
                .orElseThrow(() -> new IllegalArgumentException("거래 상품을 찾을 수 없습니다."));
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
            throw new AccessDeniedException("로그인 후 구매할 수 있습니다.");
        }

        String bearerPrefix = "Bearer ";
        if (!authorizationHeader.startsWith(bearerPrefix)) {
            throw new AccessDeniedException("유효하지 않은 인증 정보입니다.");
        }

        return authorizationHeader.substring(bearerPrefix.length()).trim();
    }

    private String requireLeagueName(String value) {
        String leagueName = requireText(value, "리그를 선택해주세요.", 30).toUpperCase();

        if (!List.of("MLB", "NBA", "NFL", "NHL", "MLS").contains(leagueName)) {
            throw new IllegalArgumentException("지원하지 않는 리그입니다.");
        }

        return leagueName;
    }

    private BigDecimal requirePositivePrice(BigDecimal value, String message) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(message);
        }

        return value;
    }

    private BigDecimal requireZeroOrPositivePrice(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }

        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("배송비는 0원 이상으로 입력해주세요.");
        }

        return value;
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

    private String normalizeOptionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase();
    }
}
