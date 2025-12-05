package com.mes.service;

import com.mes.model.User;
import com.mes.model.WebhookConfig;
import com.mes.repository.WebhookConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class WebhookService {

    @Autowired
    private WebhookConfigRepository webhookConfigRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Transactional
    public WebhookConfig createWebhook(WebhookConfig webhook, User createdBy) {
        webhook.setCreatedBy(createdBy);
        return webhookConfigRepository.save(webhook);
    }

    @Transactional
    public WebhookConfig updateWebhook(Long id, WebhookConfig webhookDetails) {
        WebhookConfig webhook = webhookConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Webhook not found"));
        
        webhook.setWebhookName(webhookDetails.getWebhookName());
        webhook.setWebhookUrl(webhookDetails.getWebhookUrl());
        webhook.setWebhookSecret(webhookDetails.getWebhookSecret());
        webhook.setEventType(webhookDetails.getEventType());
        webhook.setHttpMethod(webhookDetails.getHttpMethod());
        webhook.setIsActive(webhookDetails.getIsActive());
        webhook.setRetryOnFailure(webhookDetails.getRetryOnFailure());
        webhook.setMaxRetries(webhookDetails.getMaxRetries());
        webhook.setHeaders(webhookDetails.getHeaders());
        webhook.setPayloadTemplate(webhookDetails.getPayloadTemplate());
        
        return webhookConfigRepository.save(webhook);
    }

    public List<WebhookConfig> getAllWebhooks() {
        return webhookConfigRepository.findAll();
    }

    public List<WebhookConfig> getActiveWebhooks() {
        return webhookConfigRepository.findByIsActive(true);
    }

    public List<WebhookConfig> getWebhooksByEventType(String eventType) {
        return webhookConfigRepository.findByEventTypeAndIsActive(eventType, true);
    }

    public WebhookConfig getWebhookById(Long id) {
        return webhookConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Webhook not found"));
    }

    @Transactional
    public void deleteWebhook(Long id) {
        webhookConfigRepository.deleteById(id);
    }

    // Trigger webhook
    @Transactional
    public boolean triggerWebhook(String eventType, Map<String, Object> payload) {
        List<WebhookConfig> webhooks = getWebhooksByEventType(eventType);
        
        boolean allSuccess = true;
        for (WebhookConfig webhook : webhooks) {
            boolean success = sendWebhook(webhook, payload);
            if (!success) {
                allSuccess = false;
            }
        }
        
        return allSuccess;
    }

    @Transactional
    public boolean sendWebhook(WebhookConfig webhook, Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Add custom headers
            if (webhook.getHeaders() != null) {
                webhook.getHeaders().forEach(headers::add);
            }
            
            // Add webhook secret as header if present
            if (webhook.getWebhookSecret() != null) {
                headers.add("X-Webhook-Secret", webhook.getWebhookSecret());
            }
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            long startTime = System.currentTimeMillis();
            ResponseEntity<String> response = restTemplate.exchange(
                webhook.getWebhookUrl(),
                HttpMethod.valueOf(webhook.getHttpMethod()),
                request,
                String.class
            );
            long duration = System.currentTimeMillis() - startTime;
            
            webhook.setLastTriggered(LocalDateTime.now());
            webhook.setSuccessCount(webhook.getSuccessCount() + 1);
            webhookConfigRepository.save(webhook);
            
            return response.getStatusCode().is2xxSuccessful();
            
        } catch (Exception e) {
            webhook.setFailureCount(webhook.getFailureCount() + 1);
            webhookConfigRepository.save(webhook);
            
            // Retry if configured
            if (webhook.getRetryOnFailure() && webhook.getFailureCount() < webhook.getMaxRetries()) {
                return retryWebhook(webhook, payload);
            }
            
            return false;
        }
    }

    private boolean retryWebhook(WebhookConfig webhook, Map<String, Object> payload) {
        try {
            Thread.sleep(1000); // Wait 1 second before retry
            return sendWebhook(webhook, payload);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    // Test webhook
    public boolean testWebhook(Long id) {
        WebhookConfig webhook = getWebhookById(id);
        Map<String, Object> testPayload = Map.of(
            "test", true,
            "timestamp", LocalDateTime.now().toString(),
            "message", "This is a test webhook"
        );
        
        return sendWebhook(webhook, testPayload);
    }
}
