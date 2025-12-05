package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alert_rules")
public class AlertRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_name", nullable = false)
    private String ruleName;

    @Column(name = "rule_type", nullable = false, length = 50)
    private String ruleType; // EQUIPMENT_DOWN, HIGH_TEMPERATURE, etc.

    @Column(nullable = false, length = 20)
    private String severity; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(name = "condition_field", length = 100)
    private String conditionField;

    @Column(name = "condition_operator", length = 20)
    private String conditionOperator; // GT, LT, EQ, GTE, LTE

    @Column(name = "condition_value", precision = 10, scale = 2)
    private BigDecimal conditionValue;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "notification_email")
    private Boolean notificationEmail = true;

    @Column(name = "notification_sms")
    private Boolean notificationSms = false;

    @Column(name = "notification_websocket")
    private Boolean notificationWebsocket = true;

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
