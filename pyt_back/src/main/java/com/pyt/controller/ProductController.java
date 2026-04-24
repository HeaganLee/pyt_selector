package com.pyt.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            System.out.println("전송");
            return productService.getProductItems();
        } catch (Exception e) {
            System.out.println("error>> " + e.getMessage());
            return e.getMessage();
        }
    }
}
