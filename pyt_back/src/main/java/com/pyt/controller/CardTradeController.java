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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pyt.dto.trade.req.CardTradeCreateReqDto;
import com.pyt.service.CardTradeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/trades")
public class CardTradeController {

    private final CardTradeService cardTradeService;

    @GetMapping
    public ResponseEntity<?> getTradeList(
            @RequestParam(value = "category", required = false) String category) {
        try {
            return ResponseEntity.ok(cardTradeService.getTradeList(category));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/manage")
    public ResponseEntity<?> getSellerTradeList(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            return ResponseEntity.ok(cardTradeService.getSellerTradeList(authorizationHeader));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createTrade(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody CardTradeCreateReqDto reqDto) {
        try {
            return ResponseEntity.ok(cardTradeService.createTrade(authorizationHeader, reqDto));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{tradeId}")
    public ResponseEntity<?> getTradeDetail(@PathVariable(value = "tradeId") Long tradeId) {
        try {
            return ResponseEntity.ok(cardTradeService.getTradeDetail(tradeId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{tradeId}/purchase")
    public ResponseEntity<?> purchaseTrade(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "tradeId") Long tradeId) {
        try {
            return ResponseEntity.ok(cardTradeService.purchaseTrade(authorizationHeader, tradeId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
