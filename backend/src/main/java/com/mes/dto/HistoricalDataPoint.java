package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistoricalDataPoint {
    private LocalDateTime timestamp;
    private String metric;
    private Double value;
    private String unit;
}
