package com.mes.service;

import com.mes.model.EquipmentLog;
import com.mes.repository.EquipmentLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class EquipmentLogService {

    @Autowired
    private EquipmentLogRepository equipmentLogRepository;

    public List<EquipmentLog> getLogsByEquipmentId(Long equipmentId) {
        return equipmentLogRepository.findByEquipmentIdOrderByTimestampDesc(equipmentId);
    }

    public Optional<EquipmentLog> getLatestLog(Long equipmentId) {
        List<EquipmentLog> logs = equipmentLogRepository.findByEquipmentIdOrderByTimestampDesc(equipmentId);
        return logs.isEmpty() ? Optional.empty() : Optional.of(logs.get(0));
    }

    public EquipmentLog createLog(EquipmentLog log) {
        return equipmentLogRepository.save(log);
    }
}
