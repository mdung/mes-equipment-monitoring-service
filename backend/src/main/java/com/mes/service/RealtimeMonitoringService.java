package com.mes.service;

import com.mes.dto.AlertNotification;
import com.mes.dto.EquipmentStatusUpdate;
import com.mes.dto.ProductionMetricsUpdate;
import com.mes.model.Equipment;
import com.mes.model.EquipmentStatus;
import com.mes.model.ProductionOrder;
import com.mes.repository.EquipmentRepository;
import com.mes.repository.ProductionOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class RealtimeMonitoringService {

    @Autowired
    private WebSocketService webSocketService;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private ProductionOrderRepository productionOrderRepository;

    @Autowired
    private AlertService alertService;

    private Random random = new Random();

    // Simulate equipment status updates every 5 seconds
    @Scheduled(fixedRate = 5000)
    public void broadcastEquipmentStatus() {
        List<Equipment> equipmentList = equipmentRepository.findAll();
        
        for (Equipment equipment : equipmentList) {
            EquipmentStatusUpdate update = new EquipmentStatusUpdate(
                equipment.getId(),
                equipment.getName(),
                equipment.getStatus().name(),
                generateTemperature(equipment.getStatus()),
                generateVibration(equipment.getStatus()),
                generateOutputCount(equipment.getStatus()),
                LocalDateTime.now()
            );
            
            webSocketService.sendEquipmentStatusUpdate(update);
            
            // Check for alerts
            checkForAlerts(equipment, update);
        }
    }

    // Simulate production metrics updates every 10 seconds
    @Scheduled(fixedRate = 10000)
    public void broadcastProductionMetrics() {
        List<ProductionOrder> orders = productionOrderRepository.findAll();
        
        for (ProductionOrder order : orders) {
            if (order.getStatus().name().equals("IN_PROGRESS")) {
                // Simulate production progress
                int currentProduced = order.getProducedQuantity() != null ? order.getProducedQuantity() : 0;
                int target = order.getTargetQuantity();
                
                if (currentProduced < target) {
                    int increment = random.nextInt(5) + 1;
                    int newProduced = Math.min(currentProduced + increment, target);
                    
                    ProductionMetricsUpdate update = new ProductionMetricsUpdate(
                        order.getId(),
                        order.getOrderNumber(),
                        newProduced,
                        target,
                        (double) newProduced / target * 100,
                        order.getStatus().name()
                    );
                    
                    webSocketService.sendProductionMetricsUpdate(update);
                }
            }
        }
    }

    // Broadcast dashboard updates every 15 seconds
    @Scheduled(fixedRate = 15000)
    public void broadcastDashboardUpdate() {
        webSocketService.sendDashboardUpdate(new Object() {
            public final String type = "refresh";
            public final LocalDateTime timestamp = LocalDateTime.now();
        });
    }

    private void checkForAlerts(Equipment equipment, EquipmentStatusUpdate update) {
        // Check temperature threshold
        if (update.getTemperature() != null && update.getTemperature() > 85.0) {
            AlertNotification alert = new AlertNotification(
                "WARNING",
                "High Temperature Alert",
                String.format("Equipment %s temperature is %.1f°C (threshold: 85°C)", 
                    equipment.getName(), update.getTemperature()),
                equipment.getId(),
                equipment.getName(),
                LocalDateTime.now()
            );
            alertService.createAlert(alert);
        }

        // Check vibration threshold
        if (update.getVibration() != null && update.getVibration() > 8.0) {
            AlertNotification alert = new AlertNotification(
                "WARNING",
                "High Vibration Alert",
                String.format("Equipment %s vibration is %.1f mm/s (threshold: 8.0 mm/s)", 
                    equipment.getName(), update.getVibration()),
                equipment.getId(),
                equipment.getName(),
                LocalDateTime.now()
            );
            alertService.createAlert(alert);
        }

        // Check equipment down status
        if (equipment.getStatus() == EquipmentStatus.DOWN) {
            AlertNotification alert = new AlertNotification(
                "ERROR",
                "Equipment Down",
                String.format("Equipment %s is currently down", equipment.getName()),
                equipment.getId(),
                equipment.getName(),
                LocalDateTime.now()
            );
            alertService.createAlert(alert);
        }
    }

    private Double generateTemperature(EquipmentStatus status) {
        switch (status) {
            case RUNNING:
                return 70.0 + random.nextDouble() * 20; // 70-90°C
            case IDLE:
                return 40.0 + random.nextDouble() * 10; // 40-50°C
            case DOWN:
                return 30.0 + random.nextDouble() * 5; // 30-35°C
            case MAINTENANCE:
                return 35.0 + random.nextDouble() * 10; // 35-45°C
            default:
                return 50.0;
        }
    }

    private Double generateVibration(EquipmentStatus status) {
        switch (status) {
            case RUNNING:
                return 3.0 + random.nextDouble() * 6; // 3-9 mm/s
            case IDLE:
                return 0.5 + random.nextDouble() * 1; // 0.5-1.5 mm/s
            case DOWN:
                return 0.0;
            case MAINTENANCE:
                return 1.0 + random.nextDouble() * 2; // 1-3 mm/s
            default:
                return 2.0;
        }
    }

    private Integer generateOutputCount(EquipmentStatus status) {
        if (status == EquipmentStatus.RUNNING) {
            return random.nextInt(100) + 50; // 50-150 units
        }
        return 0;
    }
}
