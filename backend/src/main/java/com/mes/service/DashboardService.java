package com.mes.service;

import com.mes.model.Equipment;
import com.mes.model.EquipmentStatus;
import com.mes.repository.EquipmentRepository;
import com.mes.repository.ProductionOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    @Autowired
    private ProductionOrderRepository productionOrderRepository;

    @Autowired
    private EquipmentService equipmentService;

    public Map<String, Object> getDashboardStats() {
        List<Equipment> allEquipment = equipmentRepository.findAll();
        
        long totalEquipment = allEquipment.size();
        long running = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.RUNNING)
                .count();
        long down = allEquipment.stream()
                .filter(e -> e.getStatus() == EquipmentStatus.DOWN)
                .count();
        
        // Calculate average OEE across all equipment
        double avgOee = allEquipment.stream()
                .mapToDouble(e -> {
                    try {
                        return equipmentService.calculateOee(e.getId()).getOeePercentage();
                    } catch (Exception ex) {
                        return 0.0;
                    }
                })
                .average()
                .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEquipment", totalEquipment);
        stats.put("running", running);
        stats.put("down", down);
        stats.put("avgOee", Math.round(avgOee * 100.0) / 100.0);
        
        return stats;
    }

    public Map<String, Long> getEquipmentStatusDistribution() {
        List<Equipment> allEquipment = equipmentRepository.findAll();
        
        return allEquipment.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getStatus().name(),
                        Collectors.counting()
                ));
    }
}
