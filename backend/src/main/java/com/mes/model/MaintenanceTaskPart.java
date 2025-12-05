package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "maintenance_task_parts")
public class MaintenanceTaskPart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    private MaintenanceTask task;

    @ManyToOne
    @JoinColumn(name = "part_id", nullable = false)
    private SparePart part;

    @Column(name = "quantity_used", nullable = false)
    private Integer quantityUsed;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
