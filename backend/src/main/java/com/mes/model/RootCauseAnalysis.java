package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "root_cause_analysis")
public class RootCauseAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "defect_record_id")
    private DefectRecord defectRecord;

    @Column(name = "analysis_date", nullable = false)
    private LocalDateTime analysisDate;

    @ManyToOne
    @JoinColumn(name = "analyst_user_id")
    private User analyst;

    @Column(name = "problem_statement", nullable = false, columnDefinition = "TEXT")
    private String problemStatement;

    @Column(name = "root_cause", columnDefinition = "TEXT")
    private String rootCause;

    // 5 Whys Analysis
    @Column(name = "why_1", columnDefinition = "TEXT")
    private String why1;

    @Column(name = "why_2", columnDefinition = "TEXT")
    private String why2;

    @Column(name = "why_3", columnDefinition = "TEXT")
    private String why3;

    @Column(name = "why_4", columnDefinition = "TEXT")
    private String why4;

    @Column(name = "why_5", columnDefinition = "TEXT")
    private String why5;

    @Column(name = "corrective_action", columnDefinition = "TEXT")
    private String correctiveAction;

    @Column(name = "preventive_action", columnDefinition = "TEXT")
    private String preventiveAction;

    @ManyToOne
    @JoinColumn(name = "action_owner_user_id")
    private User actionOwner;

    @Column(name = "target_completion_date")
    private LocalDate targetCompletionDate;

    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;

    @Column(name = "verification_notes", columnDefinition = "TEXT")
    private String verificationNotes;

    @Column(length = 20)
    private String status = "OPEN"; // OPEN, IN_PROGRESS, COMPLETED, VERIFIED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (analysisDate == null) {
            analysisDate = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
