package com.mes.controller;

import com.mes.model.ComplianceReport;
import com.mes.model.User;
import com.mes.security.UserDetailsImpl;
import com.mes.service.ComplianceService;
import com.mes.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/compliance")
@CrossOrigin(origins = "*")
public class ComplianceController {

    @Autowired
    private ComplianceService complianceService;

    @Autowired
    private UserService userService;

    @PostMapping("/reports/audit-trail")
    public ResponseEntity<ComplianceReport> generateAuditTrailReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestBody(required = false) Map<String, Object> filters,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        ComplianceReport report = complianceService.generateAuditTrailReport(user, startDate, endDate, filters);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/reports/user-activity")
    public ResponseEntity<ComplianceReport> generateUserActivityReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestBody(required = false) Map<String, Object> filters,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        ComplianceReport report = complianceService.generateUserActivityReport(user, startDate, endDate, filters);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/reports/change-history")
    public ResponseEntity<ComplianceReport> generateChangeHistoryReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestBody(required = false) Map<String, Object> filters,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        ComplianceReport report = complianceService.generateChangeHistoryReport(user, startDate, endDate, filters);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<ComplianceReport>> getAllReports() {
        return ResponseEntity.ok(complianceService.getAllReports());
    }

    @GetMapping("/reports/type/{reportType}")
    public ResponseEntity<List<ComplianceReport>> getReportsByType(@PathVariable String reportType) {
        return ResponseEntity.ok(complianceService.getReportsByType(reportType));
    }

    @GetMapping("/reports/{id}")
    public ResponseEntity<ComplianceReport> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(complianceService.getReportById(id));
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
