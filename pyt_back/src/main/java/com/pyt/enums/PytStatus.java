package com.pyt.enums;

public enum PytStatus {
    DRAFT, // 작성 중
    OPEN, // 모집 중
    SOLD_OUT, // 전체 팀 마감
    FILLER_OPEN, // 필러 모집 중
    FILLER_SOLD_OUT, // 필러 마감
    READY, // 진행 준비 완료
    COMPLETED, // 완료
    CANCELLED // 취소
}