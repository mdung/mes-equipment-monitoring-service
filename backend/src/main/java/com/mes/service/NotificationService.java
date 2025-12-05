package com.mes.service;

import com.mes.model.*;
import com.mes.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationService {

    @Autowired
    private UserNotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferenceRepository preferenceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebSocketService webSocketService;

    // User Notifications (Inbox)
    public List<UserNotification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<UserNotification> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByUser(userId);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUser(userId);
    }

    public List<UserNotification> getNotificationsByType(Long userId, String type) {
        return notificationRepository.findByUserIdAndNotificationTypeOrderByCreatedAtDesc(userId, type);
    }

    @Transactional
    public UserNotification createNotification(UserNotification notification) {
        UserNotification saved = notificationRepository.save(notification);
        
        // Send real-time notification via WebSocket
        if (notification.getUser() != null) {
            sendRealtimeNotification(saved);
        }
        
        return saved;
    }

    @Transactional
    public UserNotification markAsRead(Long notificationId) {
        UserNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<UserNotification> unread = notificationRepository.findUnreadByUser(userId);
        for (UserNotification notification : unread) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public UserNotification archiveNotification(Long notificationId) {
        UserNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsArchived(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Transactional
    public void cleanupExpiredNotifications() {
        List<UserNotification> expired = notificationRepository.findExpiredNotifications(LocalDateTime.now());
        notificationRepository.deleteAll(expired);
    }

    // Notification Preferences
    public List<NotificationPreference> getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId);
    }

    public NotificationPreference getPreferenceByType(Long userId, String type) {
        return preferenceRepository.findByUserIdAndNotificationType(userId, type)
                .orElse(null);
    }

    @Transactional
    public NotificationPreference savePreference(NotificationPreference preference) {
        return preferenceRepository.save(preference);
    }

    @Transactional
    public NotificationPreference updatePreference(Long id, NotificationPreference preferenceDetails) {
        NotificationPreference preference = preferenceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Preference not found"));
        
        preference.setEmailEnabled(preferenceDetails.getEmailEnabled());
        preference.setSmsEnabled(preferenceDetails.getSmsEnabled());
        preference.setWebEnabled(preferenceDetails.getWebEnabled());
        preference.setPushEnabled(preferenceDetails.getPushEnabled());
        preference.setMinSeverity(preferenceDetails.getMinSeverity());
        preference.setQuietHoursStart(preferenceDetails.getQuietHoursStart());
        preference.setQuietHoursEnd(preferenceDetails.getQuietHoursEnd());
        
        return preferenceRepository.save(preference);
    }

    // Broadcast Notifications
    @Transactional
    public void broadcastToAllUsers(String title, String message, String type, String severity) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            UserNotification notification = new UserNotification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType(type);
            notification.setSeverity(severity);
            createNotification(notification);
        }
    }

    @Transactional
    public void notifyUsersByRole(String role, String title, String message, String type, String severity) {
        List<User> users = userRepository.findByRole(Role.valueOf(role));
        for (User user : users) {
            UserNotification notification = new UserNotification();
            notification.setUser(user);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setNotificationType(type);
            notification.setSeverity(severity);
            createNotification(notification);
        }
    }

    // Helper Methods
    private void sendRealtimeNotification(UserNotification notification) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("id", notification.getId());
            payload.put("title", notification.getTitle());
            payload.put("message", notification.getMessage());
            payload.put("type", notification.getNotificationType());
            payload.put("severity", notification.getSeverity());
            payload.put("createdAt", notification.getCreatedAt());
            
            webSocketService.sendToUser(
                notification.getUser().getUsername(),
                "/queue/notifications",
                payload
            );
        } catch (Exception e) {
            // Log error but don't fail the notification creation
            System.err.println("Failed to send real-time notification: " + e.getMessage());
        }
    }

    public boolean shouldSendNotification(Long userId, String notificationType, String severity) {
        NotificationPreference pref = getPreferenceByType(userId, notificationType);
        if (pref == null) {
            return true; // Default to sending if no preference set
        }

        // Check if notification is enabled
        if (!pref.getWebEnabled()) {
            return false;
        }

        // Check severity level
        int minSeverityLevel = getSeverityLevel(pref.getMinSeverity());
        int notificationSeverityLevel = getSeverityLevel(severity);
        
        return notificationSeverityLevel >= minSeverityLevel;
    }

    private int getSeverityLevel(String severity) {
        switch (severity) {
            case "CRITICAL": return 4;
            case "ERROR": return 3;
            case "WARNING": return 2;
            case "INFO": return 1;
            default: return 0;
        }
    }
}
