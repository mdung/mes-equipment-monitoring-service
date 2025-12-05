package com.mes.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ShiftAssignmentDto {
    private Long id;
    private Long shiftId;
    private String shiftName;
    private Long userId;
    private String userName;
    private String userFullName;
    private Long equipmentId;
    private String equipmentName;
    private LocalDate assignmentDate;
    private String notes;
}
