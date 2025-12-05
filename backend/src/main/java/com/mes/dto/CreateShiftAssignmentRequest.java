package com.mes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateShiftAssignmentRequest {
    @NotNull(message = "Shift ID is required")
    private Long shiftId;

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long equipmentId;

    @NotNull(message = "Assignment date is required")
    private LocalDate assignmentDate;

    private String notes;
}
