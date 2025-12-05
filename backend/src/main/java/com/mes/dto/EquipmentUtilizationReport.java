package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentUtilizationReport {
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCode;
    private Long totalMinutes;
    private Long runningMinutes;
    private Long idleMinutes;
    private Long downMinutes;
    private Long maintenanceMinutes;
    private Double utilizationRate;
    private Double availabilityRate;
}
