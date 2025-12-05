package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "custom_reports")
public class CustomReport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_name", nullable = false)
    private String reportName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "data_source", nullable = false, length = 50)
    private String dataSource; // PRODUCTION, QUALITY, MAINTENANCE, EQUIPMENT

    @Column(name = "selected_fields", nullable = false, columnDefinition = "JSONB")
    private String selectedFields;

    @Column(columnDefinition = "JSONB")
    private String filters;

    @Column(columnDefinition = "JSONB")
    private String grouping;

    @Column(columnDefinition = "JSONB")
    private String sorting;

    @Column(name = "chart_type", length = 50)
    private String chartType; // BAR, LINE, PIE, TABLE

    @Column(name = "chart_config", columnDefinition = "JSONB")
    private String chartConfig;

    @ManyToOne
    @JoinColumn(name = "created_by_user_id")
    private User createdBy;

    @Column(name = "is_public")
    private Boolean isPublic = false;

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
