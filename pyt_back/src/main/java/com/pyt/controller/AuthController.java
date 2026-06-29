package com.pyt.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pyt.dto.LoginReqDto;
import com.pyt.dto.LoginRespDto;
import com.pyt.dto.SignupReqDto;
import com.pyt.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupReqDto reqDto) {
        try {

            authService.signup(reqDto);
            return ResponseEntity.ok().body(null);
        } catch (Exception e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginReqDto reqDto) {
        try {
            LoginRespDto loginRespDto = authService.login(reqDto);
            return ResponseEntity.ok().body(loginRespDto);
        } catch (Exception e) {

            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
