package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Entity
@Table(name = "webhook_config")
public class WebhookConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "webhook_name", nullable = false, unique = true)
    private String webhookName;

    @Column(name = "webhook_url", nullable = false, length = 500)
    private String webhookUrl;

    @Column(name = "webhook_secret", length = 500)
    private String webhookSecret;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "http_method", length = 10)
    private String httpMethod = "POST";

    @Column(name = "content_type", length = 50)
    private String contentType = "application/json";

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "retry_on_failure")
    private Boolean retryOnFailure = true;

    @Column(name = "max_retries")
    private Integer maxRetries = 3;

    @Column(name = "timeout_seconds")
    private Integer timeoutSeconds = 30;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, String> headers;

    @Column(name = "payload_template", columnDefinition = "TEXT")
    private String payloadTemplate;

    @Column(name = "last_triggered")
    private LocalDateTime lastTriggered;

    @Column(name = "success_count")
    private Integer successCount = 0;

    @Column(name = "failure_count")
    private Integer failureCount = 0;

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
