package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "oee_calculation")
public class OeeCalculation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @ManyToOne
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(name = "calculation_period_start", nullable = false)
    private LocalDateTime calculationPeriodStart;

    @Column(name = "calculation_period_end", nullable = false)
    private LocalDateTime calculationPeriodEnd;

    // Time Components
    @Column(name = "planned_production_time", nullable = false, precision = 10, scale = 2)
    private BigDecimal plannedProductionTime;

    @Column(precision = 10, scale = 2)
    private BigDecimal downtime = BigDecimal.ZERO;

    @Column(name = "operating_time", nullable = false, precision = 10, scale = 2)
    private BigDecimal operatingTime;

    // Availability
    @Column(name = "availability_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal availabilityPercentage;

    // Performance
    @Column(name = "ideal_cycle_time", precision = 10, scale = 4)
    private BigDecimal idealCycleTime;

    @Column(name = "total_pieces_produced", nullable = false)
    private Integer totalPiecesProduced;

    @Column(name = "ideal_production_quantity")
    private Integer idealProductionQuantity;

    @Column(name = "performance_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal performancePercentage;

    // Quality
    @Column(name = "good_pieces", nullable = false)
    private Integer goodPieces;

    @Column(name = "rejected_pieces")
    private Integer rejectedPieces = 0;

    @Column(name = "quality_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal qualityPercentage;

    // OEE
    @Column(name = "oee_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal oeePercentage;

    // Additional Metrics
    @Column(name = "target_oee_percentage", precision = 5, scale = 2)
    private BigDecimal targetOeePercentage;

    @Column(name = "variance_from_target", precision = 5, scale = 2)
    private BigDecimal varianceFromTarget;

    @Column(name = "world_class_oee", precision = 5, scale = 2)
    private BigDecimal worldClassOee = new BigDecimal("85.0");

    // Metadata
    @Column(name = "calculation_type", length = 20)
    private String calculationType = "REAL_TIME";

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @Column(name = "calculated_by", length = 100)
    private String calculatedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        if (calculatedAt == null) {
            calculatedAt = LocalDateTime.now();
        }
    }
}
