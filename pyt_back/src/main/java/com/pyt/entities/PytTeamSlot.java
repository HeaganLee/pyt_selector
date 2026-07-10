package com.pyt.entities;

import java.math.BigDecimal;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.PytTeamSlotStatus;

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
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pyt_team_slots", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pyt_team_slot_break_team", columnNames = { "pyt_break_id", "team_id" })
})
@Getter
@Setter
@NoArgsConstructor
public class PytTeamSlot extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 어떤 PYT 모집방인지
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pyt_break_id", nullable = false)
    private PytBreak pytBreak;

    /**
     * DB에 있는 팀
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "team_id", nullable = false)
    private SportsTeam team;

    /**
     * 팀별 가격
     */
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    /**
     * 구매자
     * 아직 아무도 안 샀으면 null
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_user_id")
    private User buyerUser;

    /**
     * 팀 슬롯 상태
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "slot_status", nullable = false, length = 30)
    private PytTeamSlotStatus slotStatus;

    /**
     * 필러로 넘겨졌는지 여부
     */
    @Column(name = "filler_target", nullable = false)
    private Boolean fillerTarget = false;

    /**
     * 공개 PYT 모집에는 보이지 않고 필러 생성에만 쓰는 팀 슬롯
     */
    @Column(name = "filler_only")
    private Boolean fillerOnly = false;

    public PytTeamSlot(
            PytBreak pytBreak,
            SportsTeam team,
            BigDecimal price,
            PytTeamSlotStatus slotStatus,
            Boolean fillerOnly) {
        this.pytBreak = pytBreak;
        this.team = team;
        this.price = price;
        this.slotStatus = slotStatus;
        this.fillerOnly = Boolean.TRUE.equals(fillerOnly);
    }
}
