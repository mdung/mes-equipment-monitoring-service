package com.mes.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class ShiftDto {
    private Long id;
    private String name;
    private String shiftType;
    private LocalTime startTime;
    private LocalTime endTime;
    private String description;
    private Boolean active;
}
