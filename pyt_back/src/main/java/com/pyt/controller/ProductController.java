package com.pyt.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pyt.dto.ProductDetailRespDto;
import com.pyt.dto.product.req.CardProductCreateReqDto;
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

    @GetMapping("/admin/card-companies")
    public ResponseEntity<?> getAdminCardCompanies(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            return ResponseEntity.ok(productService.getAdminCardCompanies(authorizationHeader));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/admin")
    public ResponseEntity<?> createAdminProduct(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody CardProductCreateReqDto reqDto) {
        try {
            return ResponseEntity.ok(productService.createAdminProduct(authorizationHeader, reqDto));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
