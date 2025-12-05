package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductionEfficiencyReport {
    private Long orderId;
    private String orderNumber;
    private String productName;
    private Integer targetQuantity;
    private Integer producedQuantity;
    private Double completionRate;
    private Long durationMinutes;
    private Double unitsPerHour;
    private String status;
}
