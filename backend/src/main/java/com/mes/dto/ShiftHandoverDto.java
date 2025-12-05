package com.mes.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ShiftHandoverDto {
    private Long id;
    private Long fromShiftId;
    private String fromShiftName;
    private Long toShiftId;
    private String toShiftName;
    private Long fromUserId;
    private String fromUserName;
    private Long toUserId;
    private String toUserName;
    private LocalDate handoverDate;
    private LocalDateTime handoverTime;
    private String productionSummary;
    private String qualityIssues;
    private String equipmentStatus;
    private String pendingTasks;
    private String notes;
    private Boolean acknowledged;
    private LocalDateTime acknowledgedAt;
}
