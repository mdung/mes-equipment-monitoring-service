package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "shift_handovers")
public class ShiftHandover {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "from_shift_id", nullable = false)
    private Shift fromShift;

    @ManyToOne
    @JoinColumn(name = "to_shift_id", nullable = false)
    private Shift toShift;

    @ManyToOne
    @JoinColumn(name = "from_user_id", nullable = false)
    private User fromUser;

    @ManyToOne
    @JoinColumn(name = "to_user_id")
    private User toUser;

    @Column(name = "handover_date", nullable = false)
    private LocalDate handoverDate;

    @Column(name = "handover_time", nullable = false)
    private LocalDateTime handoverTime;

    @Column(name = "production_summary", columnDefinition = "TEXT")
    private String productionSummary;

    @Column(name = "quality_issues", columnDefinition = "TEXT")
    private String qualityIssues;

    @Column(name = "equipment_status", columnDefinition = "TEXT")
    private String equipmentStatus;

    @Column(name = "pending_tasks", columnDefinition = "TEXT")
    private String pendingTasks;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private Boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
