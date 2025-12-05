package com.mes.controller;

import com.mes.dto.*;
import com.mes.model.*;
import com.mes.service.MaintenanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    // Maintenance Schedules
    @GetMapping("/schedules")
    public ResponseEntity<List<MaintenanceScheduleDto>> getAllSchedules() {
        return ResponseEntity.ok(maintenanceService.getAllSchedules());
    }

    @GetMapping("/schedules/{id}")
    public ResponseEntity<MaintenanceScheduleDto> getScheduleById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getScheduleById(id));
    }

    @GetMapping("/schedules/equipment/{equipmentId}")
    public ResponseEntity<List<MaintenanceScheduleDto>> getSchedulesByEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(maintenanceService.getSchedulesByEquipment(equipmentId));
    }

    @GetMapping("/schedules/upcoming")
    public ResponseEntity<List<MaintenanceScheduleDto>> getUpcomingSchedules() {
        return ResponseEntity.ok(maintenanceService.getUpcomingSchedules());
    }

    @PostMapping("/schedules")
    public ResponseEntity<MaintenanceScheduleDto> createSchedule(@RequestBody MaintenanceSchedule schedule) {
        return ResponseEntity.ok(maintenanceService.createSchedule(schedule));
    }

    @PutMapping("/schedules/{id}")
    public ResponseEntity<MaintenanceScheduleDto> updateSchedule(@PathVariable Long id, @RequestBody MaintenanceSchedule schedule) {
        return ResponseEntity.ok(maintenanceService.updateSchedule(id, schedule));
    }

    @DeleteMapping("/schedules/{id}")
    public ResponseEntity<?> deleteSchedule(@PathVariable Long id) {
        maintenanceService.deleteSchedule(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Schedule deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Maintenance Tasks
    @GetMapping("/tasks")
    public ResponseEntity<List<MaintenanceTaskDto>> getAllTasks() {
        return ResponseEntity.ok(maintenanceService.getAllTasks());
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<MaintenanceTaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getTaskById(id));
    }

    @GetMapping("/tasks/equipment/{equipmentId}")
    public ResponseEntity<List<MaintenanceTaskDto>> getTasksByEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(maintenanceService.getTasksByEquipment(equipmentId));
    }

    @GetMapping("/tasks/user/{userId}")
    public ResponseEntity<List<MaintenanceTaskDto>> getTasksByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(maintenanceService.getTasksByUser(userId));
    }

    @GetMapping("/tasks/status/{status}")
    public ResponseEntity<List<MaintenanceTaskDto>> getTasksByStatus(@PathVariable String status) {
        return ResponseEntity.ok(maintenanceService.getTasksByStatus(status));
    }

    @PostMapping("/tasks")
    public ResponseEntity<MaintenanceTaskDto> createTask(@RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.createTask(task));
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<MaintenanceTaskDto> updateTask(@PathVariable Long id, @RequestBody MaintenanceTask task) {
        return ResponseEntity.ok(maintenanceService.updateTask(id, task));
    }

    @PutMapping("/tasks/{id}/start")
    public ResponseEntity<MaintenanceTaskDto> startTask(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.startTask(id));
    }

    @PutMapping("/tasks/{id}/complete")
    public ResponseEntity<MaintenanceTaskDto> completeTask(
            @PathVariable Long id,
            @RequestParam(required = false) Integer actualDuration,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(maintenanceService.completeTask(id, actualDuration, notes));
    }

    // Spare Parts
    @GetMapping("/spare-parts")
    public ResponseEntity<List<SparePartDto>> getAllSpareParts() {
        return ResponseEntity.ok(maintenanceService.getAllSpareParts());
    }

    @GetMapping("/spare-parts/low-stock")
    public ResponseEntity<List<SparePartDto>> getLowStockParts() {
        return ResponseEntity.ok(maintenanceService.getLowStockParts());
    }

    @PostMapping("/spare-parts")
    public ResponseEntity<SparePartDto> createSparePart(@RequestBody SparePart part) {
        return ResponseEntity.ok(maintenanceService.createSparePart(part));
    }

    @PutMapping("/spare-parts/{id}")
    public ResponseEntity<SparePartDto> updateSparePart(@PathVariable Long id, @RequestBody SparePart part) {
        return ResponseEntity.ok(maintenanceService.updateSparePart(id, part));
    }

    // Maintenance Costs
    @GetMapping("/costs/task/{taskId}")
    public ResponseEntity<List<MaintenanceCost>> getCostsByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(maintenanceService.getCostsByTask(taskId));
    }

    @GetMapping("/costs/task/{taskId}/total")
    public ResponseEntity<Map<String, BigDecimal>> getTotalCostByTask(@PathVariable Long taskId) {
        BigDecimal total = maintenanceService.getTotalCostByTask(taskId);
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("totalCost", total);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/costs")
    public ResponseEntity<MaintenanceCost> addCost(@RequestBody MaintenanceCost cost) {
        return ResponseEntity.ok(maintenanceService.addCost(cost));
    }
}
