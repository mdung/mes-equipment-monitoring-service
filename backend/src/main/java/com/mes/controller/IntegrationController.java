package com.mes.controller;

import com.mes.model.ExternalSystem;
import com.mes.model.IntegrationLog;
import com.mes.model.User;
import com.mes.security.UserDetailsImpl;
import com.mes.service.IntegrationService;
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
@RequestMapping("/api/integration")
@CrossOrigin(origins = "*")
public class IntegrationController {

    @Autowired
    private IntegrationService integrationService;

    @Autowired
    private UserService userService;

    // External Systems
    @GetMapping("/systems")
    public ResponseEntity<List<ExternalSystem>> getAllSystems() {
        return ResponseEntity.ok(integrationService.getAllExternalSystems());
    }

    @GetMapping("/systems/active")
    public ResponseEntity<List<ExternalSystem>> getActiveSystems() {
        return ResponseEntity.ok(integrationService.getActiveExternalSystems());
    }

    @GetMapping("/systems/type/{systemType}")
    public ResponseEntity<List<ExternalSystem>> getSystemsByType(@PathVariable String systemType) {
        return ResponseEntity.ok(integrationService.getExternalSystemsByType(systemType));
    }

    @GetMapping("/systems/{id}")
    public ResponseEntity<ExternalSystem> getSystemById(@PathVariable Long id) {
        return ResponseEntity.ok(integrationService.getExternalSystemById(id));
    }

    @PostMapping("/systems")
    public ResponseEntity<ExternalSystem> createSystem(
            @RequestBody ExternalSystem system,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(integrationService.createExternalSystem(system, user));
    }

    @PutMapping("/systems/{id}")
    public ResponseEntity<ExternalSystem> updateSystem(
            @PathVariable Long id,
            @RequestBody ExternalSystem system) {
        return ResponseEntity.ok(integrationService.updateExternalSystem(id, system));
    }

    @DeleteMapping("/systems/{id}")
    public ResponseEntity<Void> deleteSystem(@PathVariable Long id) {
        integrationService.deleteExternalSystem(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/systems/{id}/test-connection")
    public ResponseEntity<Map<String, Object>> testConnection(@PathVariable Long id) {
        boolean connected = integrationService.testConnection(id);
        return ResponseEntity.ok(Map.of(
            "connected", connected,
            "timestamp", LocalDateTime.now()
        ));
    }

    // Integration Logs
    @GetMapping("/logs/system/{systemId}")
    public ResponseEntity<List<IntegrationLog>> getSystemLogs(@PathVariable Long systemId) {
        return ResponseEntity.ok(integrationService.getIntegrationLogs(systemId));
    }

    @GetMapping("/logs/type/{integrationType}")
    public ResponseEntity<List<IntegrationLog>> getLogsByType(@PathVariable String integrationType) {
        return ResponseEntity.ok(integrationService.getIntegrationLogsByType(integrationType));
    }

    @GetMapping("/logs/failures")
    public ResponseEntity<List<IntegrationLog>> getRecentFailures(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        return ResponseEntity.ok(integrationService.getRecentFailures(since));
    }

    @GetMapping("/logs/date-range")
    public ResponseEntity<List<IntegrationLog>> getLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(integrationService.getIntegrationLogsByDateRange(start, end));
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
