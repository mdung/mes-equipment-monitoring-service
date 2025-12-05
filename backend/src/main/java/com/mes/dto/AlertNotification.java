package com.mes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AlertNotification {
    private String type; // ERROR, WARNING, INFO
    private String title;
    private String message;
    private Long equipmentId;
    private String equipmentName;
    private LocalDateTime timestamp;
}
