package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "defect_records")
public class DefectRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "production_order_id")
    private ProductionOrder productionOrder;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @ManyToOne
    @JoinColumn(name = "defect_category_id", nullable = false)
    private DefectCategory defectCategory;

    @Column(name = "defect_description", nullable = false, columnDefinition = "TEXT")
    private String defectDescription;

    @Column(nullable = false)
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "detected_by_user_id")
    private User detectedBy;

    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt;

    private String location;

    @Column(length = 20)
    private String status = "OPEN"; // OPEN, INVESTIGATING, RESOLVED, CLOSED

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (detectedAt == null) {
            detectedAt = LocalDateTime.now();
        }
    }
}
