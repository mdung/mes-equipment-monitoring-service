package com.mes.service;

import com.mes.model.ProductionSchedule;
import com.mes.repository.ProductionScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProductionScheduleService {

    @Autowired
    private ProductionScheduleRepository scheduleRepository;

    public List<ProductionSchedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Optional<ProductionSchedule> getScheduleById(Long id) {
        return scheduleRepository.findById(id);
    }

    public List<ProductionSchedule> getSchedulesByEquipment(Long equipmentId) {
        return scheduleRepository.findByEquipmentId(equipmentId);
    }

    public List<ProductionSchedule> getSchedulesByDateRange(LocalDateTime start, LocalDateTime end) {
        return scheduleRepository.findByScheduledStartBetween(start, end);
    }

    public ProductionSchedule createSchedule(ProductionSchedule schedule) {
        return scheduleRepository.save(schedule);
    }

    public ProductionSchedule updateSchedule(Long id, ProductionSchedule scheduleDetails) {
        ProductionSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        schedule.setScheduleName(scheduleDetails.getScheduleName());
        schedule.setScheduledStart(scheduleDetails.getScheduledStart());
        schedule.setScheduledEnd(scheduleDetails.getScheduledEnd());
        schedule.setPriority(scheduleDetails.getPriority());
        schedule.setStatus(scheduleDetails.getStatus());
        schedule.setNotes(scheduleDetails.getNotes());

        return scheduleRepository.save(schedule);
    }

    public ProductionSchedule startSchedule(Long id) {
        ProductionSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        schedule.setActualStart(LocalDateTime.now());
        schedule.setStatus("IN_PROGRESS");

        return scheduleRepository.save(schedule);
    }

    public ProductionSchedule completeSchedule(Long id) {
        ProductionSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));

        schedule.setActualEnd(LocalDateTime.now());
        schedule.setStatus("COMPLETED");

        return scheduleRepository.save(schedule);
    }

    public void deleteSchedule(Long id) {
        scheduleRepository.deleteById(id);
    }
}
