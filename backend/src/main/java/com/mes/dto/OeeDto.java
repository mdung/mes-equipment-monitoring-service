package com.mes.dto;

import lombok.Data;

@Data
public class OeeDto {
    private Long equipmentId;
    private Double availability;
    private Double performance;
    private Double quality;
    private Double oeePercentage;
}
