package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "data_retention_policy")
public class DataRetentionPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "retention_days", nullable = false)
    private Integer retentionDays;

    @Column(name = "archive_enabled")
    private Boolean archiveEnabled = false;

    @Column(name = "archive_location", length = 500)
    private String archiveLocation;

    @Column(name = "delete_after_archive")
    private Boolean deleteAfterArchive = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "last_execution")
    private LocalDateTime lastExecution;

    @Column(name = "next_execution")
    private LocalDateTime nextExecution;

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
