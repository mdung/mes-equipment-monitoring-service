package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DowntimeAnalysisReport {
    private String reasonCode;
    private Long occurrences;
    private Long totalMinutes;
    private Double averageMinutes;
    private Double percentageOfTotal;
}
