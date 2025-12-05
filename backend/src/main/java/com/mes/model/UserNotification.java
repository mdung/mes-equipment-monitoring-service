package com.mes.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "user_notifications")
public class UserNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "notification_type", nullable = false, length = 50)
    private String notificationType; // ALERT, SYSTEM, REPORT, MAINTENANCE, QUALITY

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    private String severity; // INFO, WARNING, ERROR, CRITICAL

    @Column(name = "source_type", length = 50)
    private String sourceType; // ALERT, EQUIPMENT, ORDER, DEFECT, REPORT

    @Column(name = "source_id")
    private Long sourceId;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
