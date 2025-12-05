package com.mes.repository;

import com.mes.model.WebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WebhookConfigRepository extends JpaRepository<WebhookConfig, Long> {
    Optional<WebhookConfig> findByWebhookName(String webhookName);
    List<WebhookConfig> findByEventType(String eventType);
    List<WebhookConfig> findByIsActive(Boolean isActive);
    List<WebhookConfig> findByEventTypeAndIsActive(String eventType, Boolean isActive);
}
