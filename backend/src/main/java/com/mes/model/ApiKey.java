package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "api_key")
public class ApiKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_name", nullable = false)
    private String keyName;

    @Column(name = "api_key", nullable = false, unique = true, length = 500)
    private String apiKey;

    @Column(name = "api_secret", length = 500)
    private String apiSecret;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> permissions;

    @Column(name = "rate_limit_per_minute")
    private Integer rateLimitPerMinute = 60;

    @Column(name = "rate_limit_per_hour")
    private Integer rateLimitPerHour = 1000;

    @Column(name = "allowed_ip_addresses", columnDefinition = "TEXT[]")
    private String[] allowedIpAddresses;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "last_used")
    private LocalDateTime lastUsed;

    @Column(name = "usage_count")
    private Integer usageCount = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
