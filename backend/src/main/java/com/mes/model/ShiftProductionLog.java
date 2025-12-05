package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "shift_production_logs")
public class ShiftProductionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "shift_id", nullable = false)
    private Shift shift;

    @ManyToOne
    @JoinColumn(name = "production_order_id", nullable = false)
    private ProductionOrder productionOrder;

    @Column(name = "shift_date", nullable = false)
    private LocalDate shiftDate;

    @Column(name = "quantity_produced")
    private Integer quantityProduced = 0;

    @Column(name = "quality_passed")
    private Integer qualityPassed = 0;

    @Column(name = "quality_rejected")
    private Integer qualityRejected = 0;

    @Column(name = "downtime_minutes")
    private Integer downtimeMinutes = 0;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
