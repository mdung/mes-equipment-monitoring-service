package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "alert_escalations")
public class AlertEscalation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "alert_rule_id", nullable = false)
    private AlertRule alertRule;

    @Column(name = "escalation_level", nullable = false)
    private Integer escalationLevel;

    @Column(name = "escalation_delay_minutes", nullable = false)
    private Integer escalationDelayMinutes;

    @Column(name = "notify_email")
    private String notifyEmail;

    @Column(name = "notify_sms", length = 20)
    private String notifySms;

    @ManyToOne
    @JoinColumn(name = "notify_user_id")
    private User notifyUser;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
