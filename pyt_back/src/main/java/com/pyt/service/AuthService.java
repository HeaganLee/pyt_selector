package com.pyt.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pyt.config.JwtTokenProvider;
import com.pyt.dto.LoginReqDto;
import com.pyt.dto.LoginRespDto;
import com.pyt.dto.SignupReqDto;
import com.pyt.entities.User;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.UserRoleType;
import com.pyt.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void signup(SignupReqDto reqDto) {
        if (userRepository.existsByEmail(reqDto.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        User user = new User(
                reqDto.getEmail(),
                passwordEncoder.encode(reqDto.getPassword()),
                reqDto.getName(),
                reqDto.getNickname(),
                reqDto.getPhoneNumber(),
                reqDto.getProfileImageUrl(),
                UserRoleType.USER,
                ActiveStatus.ACTIVE);

        userRepository.save(user);
    }

    public LoginRespDto login(LoginReqDto reqDto) {
        User user = userRepository.findByEmail(reqDto.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다."));

        if (!passwordEncoder.matches(reqDto.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        if (user.getActiveStatus() != ActiveStatus.ACTIVE) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        String accessToken = jwtTokenProvider.createAccessToken(user);

        return new LoginRespDto(
                accessToken,
                user.getEmail(),
                user.getNickname(),
                user.getUserRoleType(),
                user.getProfileImageUrl());
    }
}
