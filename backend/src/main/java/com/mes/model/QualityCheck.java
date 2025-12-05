package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "quality_check")
public class QualityCheck {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @Column(name = "passed_count")
    private Integer passedCount;

    @Column(name = "rejected_count")
    private Integer rejectedCount;

    @Column(name = "check_time")
    private LocalDateTime checkTime;

    @PrePersist
    protected void onCreate() {
        if (checkTime == null) {
            checkTime = LocalDateTime.now();
        }
    }
}
