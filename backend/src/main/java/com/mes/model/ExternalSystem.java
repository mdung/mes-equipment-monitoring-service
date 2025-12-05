package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "external_system")
public class ExternalSystem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "system_name", nullable = false, unique = true)
    private String systemName;

    @Column(name = "system_type", nullable = false, length = 50)
    private String systemType; // ERP, SCADA, PLC, SENSOR, WEBHOOK, CUSTOM

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_url", length = 500)
    private String baseUrl;

    @Column(name = "api_key", length = 500)
    private String apiKey;

    @Column(name = "api_secret", length = 500)
    private String apiSecret;

    @Column(name = "authentication_type", length = 50)
    private String authenticationType;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "connection_status", length = 20)
    private String connectionStatus = "DISCONNECTED";

    @Column(name = "last_sync")
    private LocalDateTime lastSync;

    @Column(name = "sync_interval_minutes")
    private Integer syncIntervalMinutes = 5;

    @Column(name = "retry_count")
    private Integer retryCount = 3;

    @Column(name = "timeout_seconds")
    private Integer timeoutSeconds = 30;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> configuration;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

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
