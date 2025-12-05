package com.mes.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateShiftHandoverRequest {
    @NotNull(message = "From shift ID is required")
    private Long fromShiftId;

    @NotNull(message = "To shift ID is required")
    private Long toShiftId;

    @NotNull(message = "Handover date is required")
    private LocalDate handoverDate;

    private String productionSummary;
    private String qualityIssues;
    private String equipmentStatus;
    private String pendingTasks;
    private String notes;
}
