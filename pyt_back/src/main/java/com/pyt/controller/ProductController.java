package com.pyt.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pyt.dto.ProductDetailRespDto;
import com.pyt.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Object getCardProducts() {
        try {
            return productService.getProductItems();
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @GetMapping("/{productId}")
    public ProductDetailRespDto getProductDetail(@PathVariable Long productId) {
        return productService.getProductDetail(productId);
    }
}
