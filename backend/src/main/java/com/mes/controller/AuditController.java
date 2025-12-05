package com.mes.controller;

import com.mes.model.AuditTrail;
import com.mes.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "*")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<AuditTrail>> getEntityHistory(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(auditService.getEntityHistory(entityType, entityId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditTrail>> getUserAudits(@PathVariable Long userId) {
        return ResponseEntity.ok(auditService.getUserAudits(userId));
    }

    @GetMapping("/action/{action}")
    public ResponseEntity<List<AuditTrail>> getAuditsByAction(@PathVariable String action) {
        return ResponseEntity.ok(auditService.getAuditsByAction(action));
    }

    @GetMapping("/entity-type/{entityType}")
    public ResponseEntity<List<AuditTrail>> getAuditsByEntityType(@PathVariable String entityType) {
        return ResponseEntity.ok(auditService.getAuditsByEntityType(entityType));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<AuditTrail>> getAuditsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(auditService.getAuditsByDateRange(start, end));
    }

    @GetMapping("/recent-count")
    public ResponseEntity<Long> getRecentAuditCount(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        return ResponseEntity.ok(auditService.getRecentAuditCount(since));
    }
}
