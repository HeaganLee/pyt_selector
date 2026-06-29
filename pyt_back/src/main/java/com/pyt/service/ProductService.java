package com.pyt.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.dto.CardProductRespDto;
import com.pyt.dto.ProductDetailRespDto;
import com.pyt.dto.product.req.CardProductCreateReqDto;
import com.pyt.dto.product.req.CardProductCreateReqDto.CardProductOptionCreateReqDto;
import com.pyt.dto.product.resp.CardProductCreateRespDto;
import com.pyt.dto.product.resp.CardCompanyRespDto;
import com.pyt.entities.CardCompany;
import com.pyt.entities.CardProduct;
import com.pyt.entities.CardProductOption;
import com.pyt.enums.BoxType;
import com.pyt.repository.CardCompanyRepository;
import com.pyt.repository.CardProductOptionRepository;
import com.pyt.repository.CardProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final CardProductRepository cardProductRepository;
    private final CardProductOptionRepository cardProductOptionRepository;
    private final CardCompanyRepository cardCompanyRepository;
    private final AdminAuthorizationService adminAuthorizationService;

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
