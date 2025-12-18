package com.mes.service;

import com.mes.dto.AlertNotification;
import com.mes.dto.EquipmentStatusUpdate;
import com.mes.dto.ProductionMetricsUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class WebSocketService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendEquipmentStatusUpdate(EquipmentStatusUpdate update) {
        messagingTemplate.convertAndSend("/topic/equipment-status", update);
    }

    public void sendProductionMetricsUpdate(ProductionMetricsUpdate update) {
        messagingTemplate.convertAndSend("/topic/production-metrics", update);
    }

    public void sendAlert(AlertNotification alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }

    public void sendDashboardUpdate(Object data) {
        messagingTemplate.convertAndSend("/topic/dashboard", data);
    }

    public void sendToUser(String username, String destination, Map<String, Object> payload) {
        messagingTemplate.convertAndSendToUser(username, destination, payload);
    }
}
