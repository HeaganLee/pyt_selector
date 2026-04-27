package com.pyt.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.dto.CardProductRespDto;
import com.pyt.dto.ProductDetailRespDto;
import com.pyt.entities.CardProduct;
import com.pyt.repository.CardProductRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final CardProductRepository cardProductRepository;

    public List<CardProductRespDto> getProductItems() {
        LocalDate today = LocalDate.now();
        LocalDate oneMonthLater = today.plusMonths(1);

        List<CardProductRespDto> resultList = cardProductRepository
                .findByReleaseDateBetweenOrderByReleaseDateAsc(today, oneMonthLater)
                .stream()
                .map(CardProductRespDto::new)
                .toList();

        return resultList;
    }

    @Transactional(readOnly = true)
    public ProductDetailRespDto getProductDetail(Long productId) {
        CardProduct product = cardProductRepository.findDetailById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품을 찾을 수 없습니다."));

        return new ProductDetailRespDto(product);
    }
}
