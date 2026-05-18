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
@Table(name = "pyt_entries")
@Getter
@Setter
@NoArgsConstructor
public class PytEntry extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 어떤 PYT인지
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pyt_break_id", nullable = false)
    private PytBreak pytBreak;

    /**
     * 어떤 팀 슬롯인지
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pyt_team_slot_id", nullable = false)
    private PytTeamSlot pytTeamSlot;

    /**
     * 참가자
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * 구매 금액
     */
    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "entry_status", nullable = false, length = 30)
    private PytEntryStatus entryStatus;

    public PytEntry(
            PytBreak pytBreak,
            PytTeamSlot pytTeamSlot,
            User user,
            BigDecimal paidAmount,
            PytEntryStatus entryStatus) {
        this.pytBreak = pytBreak;
        this.pytTeamSlot = pytTeamSlot;
        this.user = user;
        this.paidAmount = paidAmount;
        this.entryStatus = entryStatus;
    }
}
