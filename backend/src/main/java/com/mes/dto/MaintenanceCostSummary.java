package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MaintenanceCostSummary {
    private Long taskId;
    private String taskTitle;
    private BigDecimal laborCost;
    private BigDecimal partsCost;
    private BigDecimal externalServiceCost;
    private BigDecimal otherCost;
    private BigDecimal totalCost;
}
