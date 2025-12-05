package com.mes.service;

import com.mes.dto.AlertNotification;
import com.mes.model.AlertHistory;
import com.mes.model.AlertRule;
import com.mes.repository.AlertHistoryRepository;
import com.mes.repository.AlertRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertHistoryRepository alertHistoryRepository;

    @Autowired
    private AlertRuleRepository alertRuleRepository;

    @Autowired
    private EmailNotificationService emailService;

    @Autowired
    private WebSocketService webSocketService;

    public List<AlertHistory> getAllAlerts() {
        return alertHistoryRepository.findAllByOrderByTriggeredAtDesc();
    }

    public List<AlertHistory> getUnacknowledgedAlerts() {
        return alertHistoryRepository.findByAcknowledged(false);
    }

    public List<AlertHistory> getUnresolvedAlerts() {
        return alertHistoryRepository.findByResolved(false);
    }

    public AlertHistory createAlert(AlertNotification notification) {
        AlertHistory alert = new AlertHistory();
        alert.setAlertType(notification.getType());
        alert.setSeverity(notification.getType());
        alert.setTitle(notification.getTitle());
        alert.setMessage(notification.getMessage());
        alert.setEquipmentName(notification.getEquipmentName());
        alert.setTriggeredAt(notification.getTimestamp());
        
        AlertHistory savedAlert = alertHistoryRepository.save(alert);
        
        // Send notifications based on severity
        if ("CRITICAL".equals(notification.getType()) || "ERROR".equals(notification.getType())) {
            emailService.sendCriticalAlert("admin@mes.com", notification.getEquipmentName(), notification.getMessage());
        }
        
        // Send WebSocket notification
        webSocketService.sendAlert(notification);
        
        return savedAlert;
    }

    @Transactional
    public AlertHistory acknowledgeAlert(Long id, String acknowledgedBy, String notes) {
        AlertHistory alert = alertHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setAcknowledged(true);
        alert.setAcknowledgedBy(acknowledgedBy);
        alert.setAcknowledgedAt(LocalDateTime.now());
        if (notes != null) {
            alert.setNotes(notes);
        }
        
        return alertHistoryRepository.save(alert);
    }

    @Transactional
    public AlertHistory resolveAlert(Long id, String resolvedBy, String notes) {
        AlertHistory alert = alertHistoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert not found"));
        
        alert.setResolved(true);
        alert.setResolvedBy(resolvedBy);
        alert.setResolvedAt(LocalDateTime.now());
        if (notes != null) {
            alert.setNotes(alert.getNotes() != null ? alert.getNotes() + "\n" + notes : notes);
        }
        
        return alertHistoryRepository.save(alert);
    }

    // Alert Rules Management
    public List<AlertRule> getAllAlertRules() {
        return alertRuleRepository.findAll();
    }

    public List<AlertRule> getActiveAlertRules() {
        return alertRuleRepository.findByIsActive(true);
    }

    public AlertRule createAlertRule(AlertRule rule) {
        return alertRuleRepository.save(rule);
    }

    public AlertRule updateAlertRule(Long id, AlertRule ruleDetails) {
        AlertRule rule = alertRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alert rule not found"));
        
        rule.setRuleName(ruleDetails.getRuleName());
        rule.setRuleType(ruleDetails.getRuleType());
        rule.setSeverity(ruleDetails.getSeverity());
        rule.setConditionField(ruleDetails.getConditionField());
        rule.setConditionOperator(ruleDetails.getConditionOperator());
        rule.setConditionValue(ruleDetails.getConditionValue());
        rule.setIsActive(ruleDetails.getIsActive());
        rule.setNotificationEmail(ruleDetails.getNotificationEmail());
        rule.setNotificationSms(ruleDetails.getNotificationSms());
        rule.setNotificationWebsocket(ruleDetails.getNotificationWebsocket());
        
        return alertRuleRepository.save(rule);
    }

    public void deleteAlertRule(Long id) {
        alertRuleRepository.deleteById(id);
    }
}
