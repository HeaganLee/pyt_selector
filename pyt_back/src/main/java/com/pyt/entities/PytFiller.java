package com.pyt.entities;

import java.math.BigDecimal;

import com.pyt.entities.bases.BaseTimeEntity;
import com.pyt.enums.FillerStatus;

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
@Table(name = "pyt_fillers")
@Getter
@Setter
@NoArgsConstructor
public class PytFiller extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 어떤 PYT의 필러인지
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pyt_break_id", nullable = false)
    private PytBreak pytBreak;

    /**
     * 필러 제목
     * 예: PYT #1 Remaining Teams Filler
     */
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    /**
     * PYT 안에서의 필러 차수
     * 예: PYT 1차의 1번 필러 = 1-1차
     */
    @Column(name = "filler_round_no")
    private Integer fillerRoundNo;

    /**
     * 이 필러가 진행하는 박스 수
     */
    @Column(name = "box_count")
    private Integer boxCount;

    /**
     * 필러 참가 슬롯 하나가 가져가는 팀 수
     */
    @Column(name = "teams_per_slot")
    private Integer teamsPerSlot;

    /**
     * 필러 참가 슬롯 수
     * 예: 10명
     */
    @Column(name = "slot_count", nullable = false)
    private Integer slotCount;

    /**
     * 1슬롯 가격
     */
    @Column(name = "price_per_slot", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerSlot;

    /**
     * 필러 대상 팀 총 가격
     */
    @Column(name = "total_team_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalTeamPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "filler_status", nullable = false, length = 30)
    private FillerStatus fillerStatus;

    public PytFiller(
            PytBreak pytBreak,
            String title,
            Integer fillerRoundNo,
            Integer boxCount,
            Integer teamsPerSlot,
            Integer slotCount,
            BigDecimal pricePerSlot,
            BigDecimal totalTeamPrice,
            FillerStatus fillerStatus) {
        this.pytBreak = pytBreak;
        this.title = title;
        this.fillerRoundNo = fillerRoundNo;
        this.boxCount = boxCount;
        this.teamsPerSlot = teamsPerSlot;
        this.slotCount = slotCount;
        this.pricePerSlot = pricePerSlot;
        this.totalTeamPrice = totalTeamPrice;
        this.fillerStatus = fillerStatus;
    }
}
