package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductionMetricsUpdate {
    private Long orderId;
    private String orderNumber;
    private Integer producedQuantity;
    private Integer targetQuantity;
    private Double progressPercentage;
    private String status;
}
