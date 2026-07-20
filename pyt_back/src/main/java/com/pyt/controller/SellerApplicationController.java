package com.pyt.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pyt.dto.seller.req.SellerApplicationCreateReqDto;
import com.pyt.dto.seller.resp.SellerApplicationRespDto;
import com.pyt.enums.SellerApplicationStatus;
import com.pyt.service.SellerApplicationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/seller-applications")
public class SellerApplicationController {

    private final SellerApplicationService sellerApplicationService;

    @PostMapping
    public ResponseEntity<?> apply(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody SellerApplicationCreateReqDto reqDto) {
        try {
            return ResponseEntity.ok(sellerApplicationService.apply(authorizationHeader, reqDto));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/latest/me")
    public ResponseEntity<?> getMyLatest(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            SellerApplicationRespDto sellerApplication = sellerApplicationService.getLatestMine(authorizationHeader);

            if (sellerApplication == null) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(sellerApplication);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<?> getLatest(@RequestParam(value = "email") String email) {
        try {
            SellerApplicationRespDto sellerApplication = sellerApplicationService.getLatestByEmail(email);

            if (sellerApplication == null) {
                return ResponseEntity.noContent().build();
            }

            return ResponseEntity.ok(sellerApplication);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/admin")
    public ResponseEntity<?> getAdminApplications(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(value = "status", required = false) SellerApplicationStatus status) {
        try {
            return ResponseEntity.ok(sellerApplicationService.getAdminApplications(authorizationHeader, status));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{sellerApplicationId}/approve")
    public ResponseEntity<?> approve(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "sellerApplicationId") Long sellerApplicationId) {
        try {
            return ResponseEntity.ok(sellerApplicationService.approve(authorizationHeader, sellerApplicationId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{sellerApplicationId}/cancel")
    public ResponseEntity<?> cancel(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "sellerApplicationId") Long sellerApplicationId) {
        try {
            return ResponseEntity.ok(sellerApplicationService.cancel(authorizationHeader, sellerApplicationId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
