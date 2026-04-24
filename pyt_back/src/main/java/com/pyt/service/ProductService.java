package com.pyt.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.pyt.dto.CardProductRespDto;
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
}
