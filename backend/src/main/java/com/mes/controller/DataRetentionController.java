package com.mes.controller;

import com.mes.model.DataRetentionPolicy;
import com.mes.model.User;
import com.mes.security.UserDetailsImpl;
import com.mes.service.DataRetentionService;
import com.mes.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/data-retention")
@CrossOrigin(origins = "*")
public class DataRetentionController {

    @Autowired
    private DataRetentionService dataRetentionService;

    @Autowired
    private UserService userService;

    @GetMapping("/policies")
    public ResponseEntity<List<DataRetentionPolicy>> getAllPolicies() {
        return ResponseEntity.ok(dataRetentionService.getAllPolicies());
    }

    @GetMapping("/policies/active")
    public ResponseEntity<List<DataRetentionPolicy>> getActivePolicies() {
        return ResponseEntity.ok(dataRetentionService.getActivePolicies());
    }

    @GetMapping("/policies/entity/{entityType}")
    public ResponseEntity<DataRetentionPolicy> getPolicyByEntityType(@PathVariable String entityType) {
        DataRetentionPolicy policy = dataRetentionService.getPolicyByEntityType(entityType);
        if (policy == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(policy);
    }

    @PostMapping("/policies")
    public ResponseEntity<DataRetentionPolicy> createPolicy(
            @RequestBody DataRetentionPolicy policy,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        DataRetentionPolicy created = dataRetentionService.createPolicy(
                policy.getEntityType(),
                policy.getRetentionDays(),
                policy.getArchiveEnabled(),
                user
        );
        return ResponseEntity.ok(created);
    }

    @PutMapping("/policies/{id}")
    public ResponseEntity<DataRetentionPolicy> updatePolicy(
            @PathVariable Long id,
            @RequestBody DataRetentionPolicy policy) {
        return ResponseEntity.ok(dataRetentionService.updatePolicy(id, policy));
    }

    @DeleteMapping("/policies/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        dataRetentionService.deletePolicy(id);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
