package com.mes.controller;

import com.mes.model.ApiKey;
import com.mes.model.User;
import com.mes.security.UserDetailsImpl;
import com.mes.service.ApiKeyService;
import com.mes.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/api-keys")
@CrossOrigin(origins = "*")
public class ApiKeyController {

    @Autowired
    private ApiKeyService apiKeyService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<ApiKey>> getAllApiKeys() {
        return ResponseEntity.ok(apiKeyService.getAllApiKeys());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ApiKey>> getActiveApiKeys() {
        return ResponseEntity.ok(apiKeyService.getActiveApiKeys());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiKey> getApiKeyById(@PathVariable Long id) {
        return ResponseEntity.ok(apiKeyService.getApiKeyById(id));
    }

    @PostMapping
    public ResponseEntity<ApiKey> createApiKey(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        
        String keyName = (String) request.get("keyName");
        String description = (String) request.get("description");
        List<String> permissions = (List<String>) request.get("permissions");
        String expiresAtStr = (String) request.get("expiresAt");
        LocalDateTime expiresAt = expiresAtStr != null ? LocalDateTime.parse(expiresAtStr) : null;
        
        ApiKey apiKey = apiKeyService.createApiKey(keyName, description, permissions, expiresAt, user);
        return ResponseEntity.ok(apiKey);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiKey> updateApiKey(
            @PathVariable Long id,
            @RequestBody ApiKey apiKey) {
        return ResponseEntity.ok(apiKeyService.updateApiKey(id, apiKey));
    }

    @PutMapping("/{id}/revoke")
    public ResponseEntity<Void> revokeApiKey(@PathVariable Long id) {
        apiKeyService.revokeApiKey(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApiKey(@PathVariable Long id) {
        apiKeyService.deleteApiKey(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateApiKey(@RequestBody Map<String, String> request) {
        try {
            String apiKey = request.get("apiKey");
            ApiKey key = apiKeyService.validateApiKey(apiKey);
            return ResponseEntity.ok(Map.of(
                "valid", true,
                "keyName", key.getKeyName(),
                "permissions", key.getPermissions()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "valid", false,
                "error", e.getMessage()
            ));
        }
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.findByUsername(userDetails.getUsername());
    }
}
