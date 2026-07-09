package com.pyt.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;

import com.pyt.dto.pyt.req.PytCreateReqDto;
import com.pyt.dto.pyt.req.PytFillerCreateReqDto;
import com.pyt.service.PytService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pyt")
public class PytController {
    private final PytService pytService;

    @GetMapping
    public ResponseEntity<?> getPytList() {
        try {
            return ResponseEntity.ok(pytService.getPytList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/create-data")
    public ResponseEntity<?> getCreateData() {
        try {
            return ResponseEntity.ok(pytService.getCreateData());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createPyt(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestBody PytCreateReqDto reqDto) {
        try {
            Long pytId = pytService.createPyt(authorizationHeader, reqDto);
            return ResponseEntity.ok(pytId);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPytFromExcel(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam("cardProductOptionId") Long cardProductOptionId,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(pytService.createPytFromExcel(authorizationHeader, cardProductOptionId, file));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/upload-preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> previewPytExcel(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam("cardProductOptionId") Long cardProductOptionId,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(pytService.previewPytExcel(authorizationHeader, cardProductOptionId, file));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{pytId}")
    public ResponseEntity<?> getPytDetail(@PathVariable Long pytId) {
        try {
            return ResponseEntity.ok(pytService.getPytDetail(pytId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{pytId}/teams/{teamSlotId}/join")
    public ResponseEntity<?> joinTeam(
            @PathVariable Long pytId,
            @PathVariable Long teamSlotId,
            @RequestParam String userId) {
        try {
            pytService.joinTeam(pytId, teamSlotId, userId);
            return ResponseEntity.ok().body("참가 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{pytId}/fillers")
    public ResponseEntity<?> createFiller(
            @PathVariable Long pytId,
            @RequestBody PytFillerCreateReqDto reqDto) {
        try {
            Long fillerId = pytService.createFiller(pytId, reqDto);
            return ResponseEntity.ok(fillerId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
