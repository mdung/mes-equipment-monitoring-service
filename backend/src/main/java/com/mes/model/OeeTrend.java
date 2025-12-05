package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "oee_trend")
public class OeeTrend {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "trend_period", nullable = false, length = 20)
    private String trendPeriod;

    @Column(name = "period_start", nullable = false)
    private LocalDateTime periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDateTime periodEnd;

    // Aggregated Metrics
    @Column(name = "avg_oee", nullable = false, precision = 5, scale = 2)
    private BigDecimal avgOee;

    @Column(name = "avg_availability", nullable = false, precision = 5, scale = 2)
    private BigDecimal avgAvailability;

    @Column(name = "avg_performance", nullable = false, precision = 5, scale = 2)
    private BigDecimal avgPerformance;

    @Column(name = "avg_quality", nullable = false, precision = 5, scale = 2)
    private BigDecimal avgQuality;

    @Column(name = "min_oee", precision = 5, scale = 2)
    private BigDecimal minOee;

    @Column(name = "max_oee", precision = 5, scale = 2)
    private BigDecimal maxOee;

    @Column(name = "total_production_time", precision = 10, scale = 2)
    private BigDecimal totalProductionTime;

    @Column(name = "total_downtime", precision = 10, scale = 2)
    private BigDecimal totalDowntime;

    @Column(name = "total_pieces_produced")
    private Integer totalPiecesProduced;

    @Column(name = "total_good_pieces")
    private Integer totalGoodPieces;

    // Trend Analysis
    @Column(name = "trend_direction", length = 20)
    private String trendDirection;

    @Column(name = "trend_percentage", precision = 5, scale = 2)
    private BigDecimal trendPercentage;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

    @PrePersist
    protected void onCreate() {
        calculatedAt = LocalDateTime.now();
    }
}
