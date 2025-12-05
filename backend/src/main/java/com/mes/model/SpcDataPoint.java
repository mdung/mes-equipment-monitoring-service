package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "spc_data_points")
public class SpcDataPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @Column(name = "parameter_name", nullable = false, length = 100)
    private String parameterName;

    @Column(name = "measured_value", nullable = false, precision = 15, scale = 6)
    private BigDecimal measuredValue;

    @Column(name = "unit_of_measure", length = 50)
    private String unitOfMeasure;

    @Column(name = "upper_control_limit", precision = 15, scale = 6)
    private BigDecimal upperControlLimit;

    @Column(name = "lower_control_limit", precision = 15, scale = 6)
    private BigDecimal lowerControlLimit;

    @Column(name = "upper_spec_limit", precision = 15, scale = 6)
    private BigDecimal upperSpecLimit;

    @Column(name = "lower_spec_limit", precision = 15, scale = 6)
    private BigDecimal lowerSpecLimit;

    @Column(name = "target_value", precision = 15, scale = 6)
    private BigDecimal targetValue;

    @Column(name = "sample_size")
    private Integer sampleSize;

    @ManyToOne
    @JoinColumn(name = "measured_by_user_id")
    private User measuredBy;

    @Column(name = "measured_at", nullable = false)
    private LocalDateTime measuredAt;

    @Column(name = "is_out_of_control")
    private Boolean isOutOfControl = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (measuredAt == null) {
            measuredAt = LocalDateTime.now();
        }
        // Check if out of control
        if (upperControlLimit != null && measuredValue.compareTo(upperControlLimit) > 0) {
            isOutOfControl = true;
        }
        if (lowerControlLimit != null && measuredValue.compareTo(lowerControlLimit) < 0) {
            isOutOfControl = true;
        }
    }
}
