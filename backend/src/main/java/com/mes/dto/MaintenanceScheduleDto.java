package com.mes.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MaintenanceScheduleDto {
    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String scheduleName;
    private String description;
    private String frequency;
    private Integer frequencyValue;
    private LocalDateTime lastMaintenanceDate;
    private LocalDateTime nextMaintenanceDate;
    private Integer estimatedDurationMinutes;
    private String priority;
    private Boolean isActive;
}
