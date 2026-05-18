package com.pyt.entities;

import java.math.BigDecimal;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.PytEntryStatus;

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
@Table(name = "pyt_filler_entries")
@Getter
@Setter
@NoArgsConstructor
public class PytFillerEntry extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 어떤 필러인지
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pyt_filler_id", nullable = false)
    private PytFiller pytFiller;

    /**
     * 참가자
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 필러 번호
     * 예: 1번, 2번, 3번
     */
    @Column(name = "slot_no", nullable = false)
    private Integer slotNo;

    /**
     * 결제 금액
     */
    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount;

    /**
     * 추첨 후 배정된 팀 슬롯
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_slot_id")
    private PytTeamSlot assignedTeamSlot;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_status", nullable = false, length = 30)
    private PytEntryStatus entryStatus;

    public PytFillerEntry(
            PytFiller pytFiller,
            User user,
            Integer slotNo,
            BigDecimal paidAmount,
            PytEntryStatus entryStatus) {
        this.pytFiller = pytFiller;
        this.user = user;
        this.slotNo = slotNo;
        this.paidAmount = paidAmount;
        this.entryStatus = entryStatus;
    }
}