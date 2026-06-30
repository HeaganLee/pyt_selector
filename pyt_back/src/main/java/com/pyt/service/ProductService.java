package com.pyt.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.dto.CardProductRespDto;
import com.pyt.dto.ProductDetailRespDto;
import com.pyt.dto.product.req.CardProductChecklistCreateReqDto;
import com.pyt.dto.product.req.CardProductChecklistCreateReqDto.CardProductChecklistItemCreateReqDto;
import com.pyt.dto.product.req.CardProductCreateReqDto;
import com.pyt.dto.product.req.CardProductCreateReqDto.CardProductOptionCreateReqDto;
import com.pyt.dto.product.req.CardProductTierCriteriaCreateReqDto;
import com.pyt.dto.product.req.CardProductTierCriteriaCreateReqDto.CardProductTeamTierCreateReqDto;
import com.pyt.dto.product.resp.CardProductAdminRespDto;
import com.pyt.dto.product.resp.CardProductChecklistCreateRespDto;
import com.pyt.dto.product.resp.CardProductCreateRespDto;
import com.pyt.dto.product.resp.CardProductTierCriteriaCreateRespDto;
import com.pyt.dto.product.resp.CardCompanyRespDto;
import com.pyt.dto.product.resp.ProductChecklistRespDto;
import com.pyt.dto.product.resp.ProductTierBoardRespDto;
import com.pyt.dto.product.resp.SportsTeamAdminRespDto;
import com.pyt.entities.CardCompany;
import com.pyt.entities.CardProduct;
import com.pyt.entities.CardProductChecklistItem;
import com.pyt.entities.CardProductOption;
import com.pyt.entities.CardProductTeamTier;
import com.pyt.entities.CardProductTierCriteria;
import com.pyt.entities.SportsTeam;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.BoxType;
import com.pyt.enums.SportType;
import com.pyt.repository.CardCompanyRepository;
import com.pyt.repository.CardProductChecklistItemRepository;
import com.pyt.repository.CardProductOptionRepository;
import com.pyt.repository.CardProductRepository;
import com.pyt.repository.CardProductTeamTierRepository;
import com.pyt.repository.CardProductTierCriteriaRepository;
import com.pyt.repository.SportsTeamRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final CardProductRepository cardProductRepository;
    private final CardProductOptionRepository cardProductOptionRepository;
    private final CardCompanyRepository cardCompanyRepository;
    private final CardProductTierCriteriaRepository cardProductTierCriteriaRepository;
    private final CardProductTeamTierRepository cardProductTeamTierRepository;
    private final CardProductChecklistItemRepository cardProductChecklistItemRepository;
    private final SportsTeamRepository sportsTeamRepository;
    private final AdminAuthorizationService adminAuthorizationService;

    @Transactional(readOnly = true)
    public List<CardProductRespDto> getProductItems() {
        LocalDate today = LocalDate.now();

        LocalDate onSaleStartDate = today.minusDays(14);
        LocalDate upcomingEndDate = today.plusMonths(1);

        return cardProductRepository
                .findByReleaseDateBetweenOrderByReleaseDateAsc(
                        onSaleStartDate,
                        upcomingEndDate)
                .stream()
                .map(CardProductRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CardProductRespDto> getCatalogItems(SportType sportType) {
        List<CardProduct> products = sportType == null
                ? cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                : cardProductRepository.findBySportTypeOrderByReleaseDateDescIdDesc(sportType);

        return products.stream()
                .map(CardProductRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CardProductRespDto> getReleaseCalendarItems() {
        return cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                .stream()
                .map(CardProductRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductTierBoardRespDto> getTierBoardItems() {
        return cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                .stream()
                .filter(cardProduct -> !cardProduct.getTierCriteria().isEmpty())
                .map(ProductTierBoardRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductChecklistRespDto> getChecklistItems() {
        Map<Long, List<CardProductChecklistItem>> itemsByProductId = new LinkedHashMap<>();

        for (CardProductChecklistItem item : cardProductChecklistItemRepository.findAllForPublicChecklist()) {
            itemsByProductId.computeIfAbsent(item.getCardProduct().getId(), key -> new ArrayList<>())
                    .add(item);
        }

        return itemsByProductId.values()
                .stream()
                .map(items -> new ProductChecklistRespDto(items.get(0).getCardProduct(), items))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductDetailRespDto getProductDetail(Long productId) {
        CardProduct product = cardProductRepository.findDetailById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        return new ProductDetailRespDto(product);
    }

    @Transactional(readOnly = true)
    public List<CardCompanyRespDto> getAdminCardCompanies(String authorizationHeader) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        return cardCompanyRepository.findAllByOrderByNameAsc()
                .stream()
                .map(CardCompanyRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CardProductAdminRespDto> getAdminCardProducts(String authorizationHeader) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        return cardProductRepository.findAllByOrderByReleaseDateDescIdDesc()
                .stream()
                .map(CardProductAdminRespDto::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SportsTeamAdminRespDto> getAdminSportsTeams(String authorizationHeader) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);

        return sportsTeamRepository.findByActiveStatusOrderBySportTypeAscLeagueLevelTypeAscNameAsc(ActiveStatus.ACTIVE)
                .stream()
                .map(SportsTeamAdminRespDto::new)
                .toList();
    }

    @Transactional
    public CardProductCreateRespDto createAdminProduct(
            String authorizationHeader,
            CardProductCreateReqDto reqDto) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);
        validateCreateRequest(reqDto);

        CardCompany cardCompany = cardCompanyRepository.findById(reqDto.getCardCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("카드 회사를 찾을 수 없습니다."));

        CardProduct cardProduct = cardProductRepository.save(new CardProduct(
                cardCompany,
                reqDto.getSportType(),
                normalizeRequired(reqDto.getBrandName(), "브랜드명이 필요합니다."),
                normalizeRequired(reqDto.getProductName(), "상품명이 필요합니다."),
                reqDto.getReleaseDate(),
                normalize(reqDto.getChecklistUrl(), null),
                normalize(reqDto.getImageUrl(), null)));

        List<CardProductOption> options = new ArrayList<>();
        for (CardProductOptionCreateReqDto optionReqDto : reqDto.getOptions()) {
            options.add(new CardProductOption(
                    cardProduct,
                    optionReqDto.getBoxType(),
                    normalize(optionReqDto.getOptionName(), null),
                    optionReqDto.getCardsPerPack(),
                    optionReqDto.getPacksPerBox(),
                    optionReqDto.getBoxesPerCase(),
                    optionReqDto.getEstimatedPrice(),
                    normalize(optionReqDto.getCurrency(), "USD"),
                    normalize(optionReqDto.getConfigurationText(), null)));
        }

        List<CardProductOption> savedOptions = cardProductOptionRepository.saveAll(options);

        return new CardProductCreateRespDto(cardProduct, savedOptions);
    }

    @Transactional
    public CardProductTierCriteriaCreateRespDto createAdminTierCriteria(
            String authorizationHeader,
            CardProductTierCriteriaCreateReqDto reqDto) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);
        validateTierCriteriaRequest(reqDto);

        CardProduct cardProduct = cardProductRepository.findById(reqDto.getCardProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        if (cardProductTierCriteriaRepository.existsByCardProductIdAndCriteriaType(
                cardProduct.getId(),
                reqDto.getCriteriaType())) {
            throw new IllegalArgumentException("해당 상품에 같은 티어 기준이 이미 등록되어 있습니다.");
        }

        CardProductTierCriteria tierCriteria = cardProductTierCriteriaRepository.save(new CardProductTierCriteria(
                cardProduct,
                reqDto.getCriteriaType(),
                normalizeRequired(reqDto.getCriteriaName(), "티어 기준명이 필요합니다."),
                normalize(reqDto.getDescription(), null)));

        List<CardProductTeamTier> teamTiers = new ArrayList<>();
        for (CardProductTeamTierCreateReqDto teamTierReqDto : reqDto.getTeamTiers()) {
            SportsTeam team = sportsTeamRepository.findById(teamTierReqDto.getTeamId())
                    .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

            if (!team.getSportType().equals(cardProduct.getSportType())) {
                throw new IllegalArgumentException("상품 종목과 팀 종목이 일치해야 합니다.");
            }

            teamTiers.add(new CardProductTeamTier(
                    tierCriteria,
                    team,
                    teamTierReqDto.getExpectedPytPrice(),
                    teamTierReqDto.getTierGrade(),
                    normalize(teamTierReqDto.getKeyPlayers(), null),
                    normalize(teamTierReqDto.getCommentText(), null),
                    normalize(teamTierReqDto.getAiSummary(), null)));
        }

        List<CardProductTeamTier> savedTeamTiers = cardProductTeamTierRepository.saveAll(teamTiers);

        return new CardProductTierCriteriaCreateRespDto(tierCriteria, savedTeamTiers);
    }

    @Transactional
    public CardProductChecklistCreateRespDto createAdminChecklist(
            String authorizationHeader,
            CardProductChecklistCreateReqDto reqDto) {
        adminAuthorizationService.validateAdminAuthorization(authorizationHeader);
        validateChecklistRequest(reqDto);

        CardProduct cardProduct = cardProductRepository.findById(reqDto.getCardProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        String sourceUrl = normalize(reqDto.getSourceUrl(), null);
        if (sourceUrl != null) {
            cardProduct.setChecklistUrl(sourceUrl);
        }

        List<CardProductChecklistItem> checklistItems = new ArrayList<>();
        for (CardProductChecklistItemCreateReqDto itemReqDto : reqDto.getItems()) {
            SportsTeam team = null;
            if (itemReqDto.getTeamId() != null) {
                team = sportsTeamRepository.findById(itemReqDto.getTeamId())
                        .orElseThrow(() -> new IllegalArgumentException("팀을 찾을 수 없습니다."));

                if (!team.getSportType().equals(cardProduct.getSportType())) {
                    throw new IllegalArgumentException("상품 종목과 팀 종목이 일치해야 합니다.");
                }
            }

            checklistItems.add(new CardProductChecklistItem(
                    cardProduct,
                    normalizeRequired(itemReqDto.getSectionName(), "체크리스트 섹션명이 필요합니다."),
                    normalizeRequired(itemReqDto.getCardNumber(), "카드 번호가 필요합니다."),
                    normalizeRequired(itemReqDto.getPlayerName(), "선수명이 필요합니다."),
                    team,
                    normalize(itemReqDto.getTeamName(), team == null ? null : team.getName()),
                    normalize(itemReqDto.getParallelName(), null),
                    itemReqDto.getRookieCard() != null && itemReqDto.getRookieCard(),
                    itemReqDto.getAutograph() != null && itemReqDto.getAutograph(),
                    itemReqDto.getRelic() != null && itemReqDto.getRelic(),
                    normalize(itemReqDto.getNotes(), null)));
        }

        List<CardProductChecklistItem> savedItems = cardProductChecklistItemRepository.saveAll(checklistItems);

        return new CardProductChecklistCreateRespDto(cardProduct.getId(), sourceUrl, savedItems);
    }

    private void validateCreateRequest(CardProductCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("상품 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardCompanyId() == null) {
            throw new IllegalArgumentException("카드 회사를 선택해주세요.");
        }
        if (reqDto.getSportType() == null) {
            throw new IllegalArgumentException("스포츠 종목이 필요합니다.");
        }
        if (reqDto.getBrandName() == null || reqDto.getBrandName().isBlank()) {
            throw new IllegalArgumentException("브랜드명이 필요합니다.");
        }
        if (reqDto.getProductName() == null || reqDto.getProductName().isBlank()) {
            throw new IllegalArgumentException("상품명이 필요합니다.");
        }
        if (reqDto.getReleaseDate() == null) {
            throw new IllegalArgumentException("발매일이 필요합니다.");
        }
        if (reqDto.getOptions() == null || reqDto.getOptions().isEmpty()) {
            throw new IllegalArgumentException("상품 옵션을 하나 이상 입력해주세요.");
        }

        Set<BoxType> boxTypes = new HashSet<>();
        for (CardProductOptionCreateReqDto optionReqDto : reqDto.getOptions()) {
            validateOptionRequest(optionReqDto, boxTypes);
        }
    }

    private void validateOptionRequest(
            CardProductOptionCreateReqDto optionReqDto,
            Set<BoxType> boxTypes) {
        if (optionReqDto == null) {
            throw new IllegalArgumentException("상품 옵션 정보가 필요합니다.");
        }
        if (optionReqDto.getBoxType() == null) {
            throw new IllegalArgumentException("박스 타입이 필요합니다.");
        }
        if (!boxTypes.add(optionReqDto.getBoxType())) {
            throw new IllegalArgumentException("같은 박스 타입은 한 상품에 중복 등록할 수 없습니다.");
        }

        validatePositive(optionReqDto.getCardsPerPack(), "팩당 카드 수");
        validatePositive(optionReqDto.getPacksPerBox(), "박스당 팩 수");
        validatePositive(optionReqDto.getBoxesPerCase(), "케이스당 박스 수");
        validatePositive(optionReqDto.getEstimatedPrice(), "예상 가격");
    }

    private void validateTierCriteriaRequest(CardProductTierCriteriaCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("티어표 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardProductId() == null) {
            throw new IllegalArgumentException("상품을 선택해주세요.");
        }
        if (reqDto.getCriteriaType() == null) {
            throw new IllegalArgumentException("티어 기준 타입이 필요합니다.");
        }
        if (reqDto.getCriteriaName() == null || reqDto.getCriteriaName().isBlank()) {
            throw new IllegalArgumentException("티어 기준명이 필요합니다.");
        }
        if (reqDto.getTeamTiers() == null || reqDto.getTeamTiers().isEmpty()) {
            throw new IllegalArgumentException("팀 티어를 하나 이상 입력해주세요.");
        }

        Set<Long> teamIds = new HashSet<>();
        for (CardProductTeamTierCreateReqDto teamTierReqDto : reqDto.getTeamTiers()) {
            validateTeamTierRequest(teamTierReqDto, teamIds);
        }
    }

    private void validateTeamTierRequest(
            CardProductTeamTierCreateReqDto teamTierReqDto,
            Set<Long> teamIds) {
        if (teamTierReqDto == null) {
            throw new IllegalArgumentException("팀 티어 정보가 필요합니다.");
        }
        if (teamTierReqDto.getTeamId() == null) {
            throw new IllegalArgumentException("팀을 선택해주세요.");
        }
        if (!teamIds.add(teamTierReqDto.getTeamId())) {
            throw new IllegalArgumentException("같은 팀은 한 티어표에 중복 등록할 수 없습니다.");
        }
        if (teamTierReqDto.getTierGrade() == null) {
            throw new IllegalArgumentException("티어 등급이 필요합니다.");
        }

        validatePositive(teamTierReqDto.getExpectedPytPrice(), "예상 PYT 가격");
    }

    private void validateChecklistRequest(CardProductChecklistCreateReqDto reqDto) {
        if (reqDto == null) {
            throw new IllegalArgumentException("체크리스트 등록 요청이 필요합니다.");
        }
        if (reqDto.getCardProductId() == null) {
            throw new IllegalArgumentException("상품을 선택해주세요.");
        }
        if (reqDto.getItems() == null || reqDto.getItems().isEmpty()) {
            throw new IllegalArgumentException("체크리스트 항목을 하나 이상 입력해주세요.");
        }

        for (CardProductChecklistItemCreateReqDto itemReqDto : reqDto.getItems()) {
            validateChecklistItemRequest(itemReqDto);
        }
    }

    private void validateChecklistItemRequest(CardProductChecklistItemCreateReqDto itemReqDto) {
        if (itemReqDto == null) {
            throw new IllegalArgumentException("체크리스트 항목 정보가 필요합니다.");
        }
        if (itemReqDto.getSectionName() == null || itemReqDto.getSectionName().isBlank()) {
            throw new IllegalArgumentException("체크리스트 섹션명이 필요합니다.");
        }
        if (itemReqDto.getCardNumber() == null || itemReqDto.getCardNumber().isBlank()) {
            throw new IllegalArgumentException("카드 번호가 필요합니다.");
        }
        if (itemReqDto.getPlayerName() == null || itemReqDto.getPlayerName().isBlank()) {
            throw new IllegalArgumentException("선수명이 필요합니다.");
        }
    }

    private void validatePositive(Integer value, String label) {
        if (value != null && value <= 0) {
            throw new IllegalArgumentException(label + "는 1 이상이어야 합니다.");
        }
    }

    private void validatePositive(BigDecimal value, String label) {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException(label + "은 0 이상이어야 합니다.");
        }
    }

    private String normalizeRequired(String value, String errorMessage) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(errorMessage);
        }

        return value.trim();
    }

    private String normalize(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }

        return value.trim();
    }
}
