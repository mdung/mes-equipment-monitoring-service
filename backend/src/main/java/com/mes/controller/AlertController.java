package com.mes.controller;

import com.mes.model.AlertHistory;
import com.mes.model.AlertRule;
import com.mes.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    public List<AlertHistory> getAllAlerts() {
        return alertService.getAllAlerts();
    }

    @GetMapping("/unacknowledged")
    public List<AlertHistory> getUnacknowledgedAlerts() {
        return alertService.getUnacknowledgedAlerts();
    }

    @GetMapping("/unresolved")
    public List<AlertHistory> getUnresolvedAlerts() {
        return alertService.getUnresolvedAlerts();
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<AlertHistory> acknowledgeAlert(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String acknowledgedBy = request.get("acknowledgedBy");
            String notes = request.get("notes");
            return ResponseEntity.ok(alertService.acknowledgeAlert(id, acknowledgedBy, notes));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<AlertHistory> resolveAlert(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        try {
            String resolvedBy = request.get("resolvedBy");
            String notes = request.get("notes");
            return ResponseEntity.ok(alertService.resolveAlert(id, resolvedBy, notes));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Alert Rules Management
    @GetMapping("/rules")
    public List<AlertRule> getAllAlertRules() {
        return alertService.getAllAlertRules();
    }

    @GetMapping("/rules/active")
    public List<AlertRule> getActiveAlertRules() {
        return alertService.getActiveAlertRules();
    }

    @PostMapping("/rules")
    public AlertRule createAlertRule(@RequestBody AlertRule rule) {
        return alertService.createAlertRule(rule);
    }

    @PutMapping("/rules/{id}")
    public ResponseEntity<AlertRule> updateAlertRule(@PathVariable Long id, @RequestBody AlertRule rule) {
        try {
            return ResponseEntity.ok(alertService.updateAlertRule(id, rule));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteAlertRule(@PathVariable Long id) {
        alertService.deleteAlertRule(id);
        return ResponseEntity.ok().build();
    }
}
