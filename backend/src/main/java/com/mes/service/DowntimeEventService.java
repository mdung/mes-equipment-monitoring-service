package com.mes.service;

import com.mes.model.DowntimeEvent;
import com.mes.repository.DowntimeEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DowntimeEventService {

    @Autowired
    private DowntimeEventRepository downtimeEventRepository;

    public List<DowntimeEvent> getDowntimeByEquipmentId(Long equipmentId) {
        return downtimeEventRepository.findByEquipmentIdOrderByStartTimeDesc(equipmentId);
    }

    public DowntimeEvent recordDowntime(DowntimeEvent event) {
        return downtimeEventRepository.save(event);
    }

    public DowntimeEvent endDowntime(Long id) {
        DowntimeEvent event = downtimeEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Downtime event not found"));
        event.setEndTime(LocalDateTime.now());
        return downtimeEventRepository.save(event);
    }
}
