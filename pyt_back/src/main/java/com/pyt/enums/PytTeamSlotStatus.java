package com.pyt.enums;

public enum PytTeamSlotStatus {
    AVAILABLE, // 구매 가능
    RESERVED, // 결제 대기
    SOLD, // 판매 완료
    FILLER_TARGET, // 필러 대상 팀
    FILLER_ASSIGNED // 필러 완료 후 배정 완료
}