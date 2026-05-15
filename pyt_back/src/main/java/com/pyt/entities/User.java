package com.pyt.entities;

import java.time.LocalDateTime;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.ActiveStatus;
import com.pyt.enums.UserRoleType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_email", columnNames = { "email" })
})
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 로그인 아이디 또는 이메일
     */
    @Column(name = "email", nullable = false, length = 100)
    private String email;

    /**
     * 비밀번호
     */
    @Column(name = "password", nullable = false, length = 255)
    private String password;

    /**
     * 사용자 이름
     */
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    /**
     * 닉네임
     */
    @Column(name = "nickname", length = 50)
    private String nickname;

    /**
     * 전화번호
     */
    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    /**
     * 프로필 이미지 URL
     */
    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_role_type", nullable = false, length = 30)
    private UserRoleType userRoleType;

    /**
     * 활성 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "active_status", nullable = false, length = 20)
    private ActiveStatus activeStatus;

    public User(
            String email,
            String password,
            String name,
            String nickname,
            String phoneNumber,
            String profileImageUrl,
            ActiveStatus activeStatus) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.nickname = nickname;
        this.phoneNumber = phoneNumber;
        this.profileImageUrl = profileImageUrl;
        this.activeStatus = activeStatus;
    }
}