package com.mes.controller;

import com.mes.model.User;
import com.mes.model.WebhookConfig;
import com.mes.security.UserDetailsImpl;
import com.mes.service.UserService;
import com.mes.service.WebhookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@CrossOrigin(origins = "*")
public class WebhookController {

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<WebhookConfig>> getAllWebhooks() {
        return ResponseEntity.ok(webhookService.getAllWebhooks());
    }

    @GetMapping("/active")
    public ResponseEntity<List<WebhookConfig>> getActiveWebhooks() {
        return ResponseEntity.ok(webhookService.getActiveWebhooks());
    }

    @GetMapping("/event/{eventType}")
    public ResponseEntity<List<WebhookConfig>> getWebhooksByEventType(@PathVariable String eventType) {
        return ResponseEntity.ok(webhookService.getWebhooksByEventType(eventType));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WebhookConfig> getWebhookById(@PathVariable Long id) {
        return ResponseEntity.ok(webhookService.getWebhookById(id));
    }

    @PostMapping
    public ResponseEntity<WebhookConfig> createWebhook(
            @RequestBody WebhookConfig webhook,
            Authentication authentication) {
        User user = getCurrentUser(authentication);
        return ResponseEntity.ok(webhookService.createWebhook(webhook, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebhookConfig> updateWebhook(
            @PathVariable Long id,
            @RequestBody WebhookConfig webhook) {
        return ResponseEntity.ok(webhookService.updateWebhook(id, webhook));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWebhook(@PathVariable Long id) {
        webhookService.deleteWebhook(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/test")
    public ResponseEntity<Map<String, Object>> testWebhook(@PathVariable Long id) {
        boolean success = webhookService.testWebhook(id);
        return ResponseEntity.ok(Map.of(
            "success", success,
            "message", success ? "Webhook test successful" : "Webhook test failed"
        ));
    }

    @PostMapping("/trigger")
    public ResponseEntity<Map<String, Object>> triggerWebhook(@RequestBody Map<String, Object> request) {
        String eventType = (String) request.get("eventType");
        Map<String, Object> payload = (Map<String, Object>) request.get("payload");
        
        boolean success = webhookService.triggerWebhook(eventType, payload);
        return ResponseEntity.ok(Map.of(
            "success", success,
            "message", success ? "Webhooks triggered successfully" : "Some webhooks failed"
        ));
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userService.findByUsername(userDetails.getUsername());
    }
}
