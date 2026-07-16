package com.pyt.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pyt.dto.pyt.req.PytCreateReqDto;
import com.pyt.dto.pyt.req.PytFillerCreateReqDto;
import com.pyt.dto.pyt.req.PytUpdateReqDto;
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

    @GetMapping("/manage")
    public ResponseEntity<?> getSellerPytList(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {
        try {
            return ResponseEntity.ok(pytService.getSellerPytList(authorizationHeader));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/manage/{pytId}")
    public ResponseEntity<?> getSellerPytDetail(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "pytId") Long pytId) {
        try {
            return ResponseEntity.ok(pytService.getSellerPytDetail(authorizationHeader, pytId));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
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

    @PutMapping("/{pytId}")
    public ResponseEntity<?> updatePyt(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "pytId") Long pytId,
            @RequestBody PytUpdateReqDto reqDto) {
        try {
            return ResponseEntity.ok(pytService.updatePyt(authorizationHeader, pytId, reqDto));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{pytId}")
    public ResponseEntity<?> deletePyt(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "pytId") Long pytId) {
        try {
            pytService.deletePyt(authorizationHeader, pytId);
            return ResponseEntity.ok().body("삭제 완료");
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPytFromExcel(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @RequestParam(value = "cardProductOptionId") Long cardProductOptionId,
            @RequestParam(value = "file") MultipartFile file) {
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
            @RequestParam(value = "cardProductOptionId") Long cardProductOptionId,
            @RequestParam(value = "file") MultipartFile file) {
        try {
            return ResponseEntity.ok(pytService.previewPytExcel(authorizationHeader, cardProductOptionId, file));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{pytId}")
    public ResponseEntity<?> getPytDetail(@PathVariable(value = "pytId") Long pytId) {
        try {
            return ResponseEntity.ok(pytService.getPytDetail(pytId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{pytId}/teams/{teamSlotId}/join")
    public ResponseEntity<?> joinTeam(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "pytId") Long pytId,
            @PathVariable(value = "teamSlotId") Long teamSlotId) {
        try {
            pytService.joinTeam(authorizationHeader, pytId, teamSlotId);
            return ResponseEntity.ok().body("참가 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{pytId}/fillers")
    public ResponseEntity<?> createFiller(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "pytId") Long pytId,
            @RequestBody PytFillerCreateReqDto reqDto) {
        try {
            Long fillerId = pytService.createFiller(authorizationHeader, pytId, reqDto);
            return ResponseEntity.ok(fillerId);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{pytId}/fillers/{fillerId}/join")
    public ResponseEntity<?> joinFiller(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "pytId") Long pytId,
            @PathVariable(value = "fillerId") Long fillerId) {
        try {
            Long entryId = pytService.joinFiller(authorizationHeader, pytId, fillerId);
            return ResponseEntity.ok(entryId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{pytId}/fillers/{fillerId}")
    public ResponseEntity<?> cancelFiller(
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            @PathVariable(value = "pytId") Long pytId,
            @PathVariable(value = "fillerId") Long fillerId) {
        try {
            pytService.cancelFiller(authorizationHeader, pytId, fillerId);
            return ResponseEntity.ok().body("필러 취소 완료");
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
