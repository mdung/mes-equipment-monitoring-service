package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "inspection_checklists")
public class InspectionChecklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private QualityControlPlan plan;

    @Column(name = "checklist_name", nullable = false)
    private String checklistName;

    @Column(name = "inspection_type", nullable = false)
    private String inspectionType; // INCOMING, IN_PROCESS, FINAL, AUDIT

    @Column(name = "sequence_order")
    private Integer sequenceOrder;

    @Column(name = "is_mandatory")
    private Boolean isMandatory = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
