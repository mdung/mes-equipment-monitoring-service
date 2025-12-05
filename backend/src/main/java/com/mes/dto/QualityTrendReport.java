package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QualityTrendReport {
    private LocalDate date;
    private Integer totalChecks;
    private Integer totalPassed;
    private Integer totalRejected;
    private Double passRate;
    private Double rejectRate;
}
