package com.mes.service;

import com.mes.dto.OeeDto;
import com.mes.model.Equipment;
import com.mes.model.EquipmentStatus;
import com.mes.repository.EquipmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class EquipmentService {

    @Autowired
    private EquipmentRepository equipmentRepository;

    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> getEquipmentById(Long id) {
        return equipmentRepository.findById(id);
    }

    public Equipment createEquipment(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    public Equipment updateEquipment(Long id, Equipment equipmentDetails) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipment not found"));

        equipment.setName(equipmentDetails.getName());
        equipment.setCode(equipmentDetails.getCode());
        equipment.setLocation(equipmentDetails.getLocation());
        equipment.setStatus(equipmentDetails.getStatus());

        return equipmentRepository.save(equipment);
    }

    public void deleteEquipment(Long id) {
        equipmentRepository.deleteById(id);
    }

    public OeeDto calculateOee(Long equipmentId) {
        // In a real system, this would query EquipmentLog, DowntimeEvent, and
        // QualityCheck
        // For MVP, we will simulate or return static data based on status
        Equipment equipment = equipmentRepository.findById(equipmentId).orElse(null);

        OeeDto oee = new OeeDto();
        oee.setEquipmentId(equipmentId);

        if (equipment == null)
            return oee;

        // Simulation logic
        Random rand = new Random();
        double availability = 0.90 + (rand.nextDouble() * 0.10); // 90-100%
        double performance = 0.85 + (rand.nextDouble() * 0.15); // 85-100%
        double quality = 0.95 + (rand.nextDouble() * 0.05); // 95-100%

        if (equipment.getStatus() == EquipmentStatus.DOWN) {
            availability = 0.0;
        } else if (equipment.getStatus() == EquipmentStatus.IDLE) {
            performance = 0.0;
        }

        oee.setAvailability(Math.round(availability * 100.0) / 100.0);
        oee.setPerformance(Math.round(performance * 100.0) / 100.0);
        oee.setQuality(Math.round(quality * 100.0) / 100.0);
        oee.setOeePercentage(Math.round(availability * performance * quality * 100.0 * 100.0) / 100.0);

        return oee;
    }
}
