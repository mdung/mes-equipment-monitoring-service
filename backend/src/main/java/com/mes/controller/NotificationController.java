package com.mes.controller;

import com.mes.model.NotificationPreference;
import com.mes.model.UserNotification;
import com.mes.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // User Notifications (Inbox)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserNotification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<UserNotification>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        Map<String, Long> response = new HashMap<>();
        response.put("count", notificationService.getUnreadCount(userId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}/type/{type}")
    public ResponseEntity<List<UserNotification>> getNotificationsByType(
            @PathVariable Long userId,
            @PathVariable String type) {
        return ResponseEntity.ok(notificationService.getNotificationsByType(userId, type));
    }

    @PostMapping
    public ResponseEntity<UserNotification> createNotification(@RequestBody UserNotification notification) {
        return ResponseEntity.ok(notificationService.createNotification(notification));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<UserNotification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<UserNotification> archiveNotification(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.archiveNotification(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }

    // Notification Preferences
    @GetMapping("/preferences/user/{userId}")
    public ResponseEntity<List<NotificationPreference>> getUserPreferences(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserPreferences(userId));
    }

    @GetMapping("/preferences/user/{userId}/type/{type}")
    public ResponseEntity<NotificationPreference> getPreferenceByType(
            @PathVariable Long userId,
            @PathVariable String type) {
        NotificationPreference pref = notificationService.getPreferenceByType(userId, type);
        if (pref == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pref);
    }

    @PostMapping("/preferences")
    public ResponseEntity<NotificationPreference> savePreference(@RequestBody NotificationPreference preference) {
        return ResponseEntity.ok(notificationService.savePreference(preference));
    }

    @PutMapping("/preferences/{id}")
    public ResponseEntity<NotificationPreference> updatePreference(
            @PathVariable Long id,
            @RequestBody NotificationPreference preference) {
        return ResponseEntity.ok(notificationService.updatePreference(id, preference));
    }

    // Broadcast Notifications
    @PostMapping("/broadcast")
    public ResponseEntity<Void> broadcastToAllUsers(@RequestBody Map<String, String> request) {
        notificationService.broadcastToAllUsers(
            request.get("title"),
            request.get("message"),
            request.get("type"),
            request.get("severity")
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/broadcast/role/{role}")
    public ResponseEntity<Void> notifyUsersByRole(
            @PathVariable String role,
            @RequestBody Map<String, String> request) {
        notificationService.notifyUsersByRole(
            role,
            request.get("title"),
            request.get("message"),
            request.get("type"),
            request.get("severity")
        );
        return ResponseEntity.ok().build();
    }
}
