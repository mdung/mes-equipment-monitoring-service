package com.mes.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaintenanceTaskDto {
    private Long id;
    private Long scheduleId;
    private Long equipmentId;
    private String equipmentName;
    private String taskTitle;
    private String description;
    private Long assignedToId;
    private String assignedToName;
    private String status;
    private String priority;
    private LocalDateTime scheduledDate;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer actualDurationMinutes;
    private String notes;
    private LocalDateTime createdAt;
}
