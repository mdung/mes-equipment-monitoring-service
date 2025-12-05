package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EquipmentStatusUpdate {
    private Long equipmentId;
    private String equipmentName;
    private String status;
    private Double temperature;
    private Double vibration;
    private Integer outputCount;
    private LocalDateTime timestamp;
}
