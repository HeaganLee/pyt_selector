package com.pyt.entities;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.BreakUnitType;
import com.pyt.enums.PytStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pyt_breaks")
@Getter
@Setter
@NoArgsConstructor
public class PytBreak extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 어떤 상품 옵션으로 진행하는지
     * 예: Hobby, Jumbo, Value
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "card_product_option_id", nullable = false)
    private CardProductOption cardProductOption;

    /**
     * PYT를 등록한 셀러
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    /**
     * PYT 제목
     * 예: 2024 Topps Chrome Baseball Hobby 1 Case PYT #1
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * 한 케이스 / 반 케이스 / 몇 박스 등
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "break_unit_type", nullable = false, length = 30)
    private BreakUnitType breakUnitType;

    /**
     * 몇 차수인지
     * 예: 1차, 2차, 3차
     */
    @Column(name = "round_no", nullable = false)
    private Integer roundNo;

    /**
     * 실제 진행 박스 수
     * 예: 12박스, 6박스
     */
    @Column(name = "box_count")
    private Integer boxCount;

    /**
     * 필러 사용 가능 여부
     */
    @Column(name = "filler_enabled", nullable = false)
    private Boolean fillerEnabled = true;

    /**
     * PYT 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "pyt_status", nullable = false, length = 30)
    private PytStatus pytStatus;

    public PytBreak(
            CardProductOption cardProductOption,
            User createdByUser,
            String title,
            BreakUnitType breakUnitType,
            Integer roundNo,
            Integer boxCount,
            Boolean fillerEnabled,
            PytStatus pytStatus) {
        this.cardProductOption = cardProductOption;
        this.createdByUser = createdByUser;
        this.title = title;
        this.breakUnitType = breakUnitType;
        this.roundNo = roundNo;
        this.boxCount = boxCount;
        this.fillerEnabled = true;
        this.pytStatus = pytStatus;
    }
}
