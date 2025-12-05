package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "oee_target")
public class OeeTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "equipment_type", length = 100)
    private String equipmentType;

    // Target Values
    @Column(name = "target_availability", nullable = false, precision = 5, scale = 2)
    private BigDecimal targetAvailability;

    @Column(name = "target_performance", nullable = false, precision = 5, scale = 2)
    private BigDecimal targetPerformance;

    @Column(name = "target_quality", nullable = false, precision = 5, scale = 2)
    private BigDecimal targetQuality;

    @Column(name = "target_oee", nullable = false, precision = 5, scale = 2)
    private BigDecimal targetOee;

    // Benchmark Values
    @Column(name = "industry_benchmark_oee", precision = 5, scale = 2)
    private BigDecimal industryBenchmarkOee;

    @Column(name = "world_class_oee", precision = 5, scale = 2)
    private BigDecimal worldClassOee = new BigDecimal("85.0");

    @Column(name = "company_average_oee", precision = 5, scale = 2)
    private BigDecimal companyAverageOee;

    // Period
    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    // Metadata
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
