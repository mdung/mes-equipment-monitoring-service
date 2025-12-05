package com.mes.controller;

import com.mes.model.ProductionSchedule;
import com.mes.service.ProductionScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/schedules")
@CrossOrigin(origins = "*")
public class ProductionScheduleController {

    @Autowired
    private ProductionScheduleService scheduleService;

    @GetMapping
    public List<ProductionSchedule> getAllSchedules() {
        return scheduleService.getAllSchedules();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductionSchedule> getScheduleById(@PathVariable Long id) {
        return scheduleService.getScheduleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/equipment/{equipmentId}")
    public List<ProductionSchedule> getSchedulesByEquipment(@PathVariable Long equipmentId) {
        return scheduleService.getSchedulesByEquipment(equipmentId);
    }

    @GetMapping("/date-range")
    public List<ProductionSchedule> getSchedulesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return scheduleService.getSchedulesByDateRange(start, end);
    }

    @PostMapping
    public ProductionSchedule createSchedule(@RequestBody ProductionSchedule schedule) {
        return scheduleService.createSchedule(schedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductionSchedule> updateSchedule(@PathVariable Long id, @RequestBody ProductionSchedule schedule) {
        try {
            return ResponseEntity.ok(scheduleService.updateSchedule(id, schedule));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<ProductionSchedule> startSchedule(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(scheduleService.startSchedule(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ProductionSchedule> completeSchedule(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(scheduleService.completeSchedule(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok().build();
    }
}
