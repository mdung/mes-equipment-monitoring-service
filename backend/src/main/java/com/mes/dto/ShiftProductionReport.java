package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShiftProductionReport {
    private LocalDate shiftDate;
    private Long shiftId;
    private String shiftName;
    private String shiftType;
    private Integer totalProduced;
    private Integer totalPassed;
    private Integer totalRejected;
    private Integer totalDowntimeMinutes;
    private Double passRate;
    private Integer operatorCount;
}
