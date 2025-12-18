package com.mes.controller;

import com.mes.model.ChangeHistory;
import com.mes.model.User;
import com.mes.security.UserDetailsImpl;
import com.mes.service.ChangeHistoryService;
import com.mes.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/change-history")
@CrossOrigin(origins = "*")
public class ChangeHistoryController {

    @Autowired
    private ChangeHistoryService changeHistoryService;

    @Autowired
    private UserService userService;

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<ChangeHistory>> getEntityChangeHistory(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(changeHistoryService.getEntityChangeHistory(entityType, entityId));
    }

    @GetMapping("/entity/{entityType}/{entityId}/field/{fieldName}")
    public ResponseEntity<List<ChangeHistory>> getFieldChangeHistory(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @PathVariable String fieldName) {
        return ResponseEntity.ok(changeHistoryService.getFieldChangeHistory(entityType, entityId, fieldName));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChangeHistory>> getUserChanges(@PathVariable Long userId) {
        return ResponseEntity.ok(changeHistoryService.getUserChanges(userId));
    }

    @GetMapping("/pending-approvals")
    public ResponseEntity<List<ChangeHistory>> getPendingApprovals() {
        return ResponseEntity.ok(changeHistoryService.getPendingApprovals());
    }

    @GetMapping("/pending-approvals/count")
    public ResponseEntity<Long> countPendingApprovals() {
        return ResponseEntity.ok(changeHistoryService.countPendingApprovals());
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<ChangeHistory>> getChangesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(changeHistoryService.getChangesByDateRange(start, end));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ChangeHistory> approveChange(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(changeHistoryService.approveChange(id, user));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ChangeHistory> rejectChange(
            @PathVariable Long id,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(changeHistoryService.rejectChange(id, user));
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.findByUsername(userDetails.getUsername());
    }
}
