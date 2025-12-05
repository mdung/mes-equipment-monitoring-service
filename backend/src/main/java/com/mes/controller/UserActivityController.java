package com.mes.controller;

import com.mes.model.UserActivityLog;
import com.mes.service.UserActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user-activity")
@CrossOrigin(origins = "*")
public class UserActivityController {

    @Autowired
    private UserActivityService userActivityService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserActivityLog>> getUserActivities(@PathVariable Long userId) {
        return ResponseEntity.ok(userActivityService.getUserActivities(userId));
    }

    @GetMapping("/user/{userId}/range")
    public ResponseEntity<List<UserActivityLog>> getUserActivitiesInRange(
            @PathVariable Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(userActivityService.getUserActivitiesInRange(userId, start, end));
    }

    @GetMapping("/type/{activityType}")
    public ResponseEntity<List<UserActivityLog>> getActivitiesByType(@PathVariable String activityType) {
        return ResponseEntity.ok(userActivityService.getActivitiesByType(activityType));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<UserActivityLog>> getActivitiesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(userActivityService.getActivitiesByDateRange(start, end));
    }

    @GetMapping("/failures")
    public ResponseEntity<List<UserActivityLog>> getRecentFailures(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        return ResponseEntity.ok(userActivityService.getRecentFailures(since));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Long>> getActivitySummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        return ResponseEntity.ok(userActivityService.getActivitySummary(since));
    }
}
