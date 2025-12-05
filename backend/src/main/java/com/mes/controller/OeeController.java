package com.mes.controller;

import com.mes.model.OeeCalculation;
import com.mes.model.OeeTarget;
import com.mes.model.OeeTrend;
import com.mes.repository.OeeTargetRepository;
import com.mes.service.OeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/oee")
@CrossOrigin(origins = "*")
public class OeeController {

    @Autowired
    private OeeService oeeService;

    @Autowired
    private OeeTargetRepository oeeTargetRepository;

    // Real-time OEE calculation
    @PostMapping("/calculate/{equipmentId}")
    public ResponseEntity<OeeCalculation> calculateOee(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        OeeCalculation calculation = oeeService.calculateRealTimeOee(equipmentId, start, end);
        return ResponseEntity.ok(calculation);
    }

    // Get OEE breakdown
    @GetMapping("/breakdown/{equipmentId}")
    public ResponseEntity<Map<String, Object>> getOeeBreakdown(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Map<String, Object> breakdown = oeeService.getOeeBreakdown(equipmentId, start, end);
        return ResponseEntity.ok(breakdown);
    }

    // Get OEE trends
    @GetMapping("/trends/{equipmentId}")
    public ResponseEntity<List<OeeTrend>> getOeeTrends(
            @PathVariable Long equipmentId,
            @RequestParam String period,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<OeeTrend> trends = oeeService.getOeeTrends(equipmentId, period, start, end);
        return ResponseEntity.ok(trends);
    }

    // Get benchmark comparison
    @GetMapping("/benchmark/{equipmentId}")
    public ResponseEntity<Map<String, Object>> getBenchmarkComparison(@PathVariable Long equipmentId) {
        Map<String, Object> comparison = oeeService.getBenchmarkComparison(equipmentId);
        return ResponseEntity.ok(comparison);
    }

    // Get target vs actual
    @GetMapping("/target-vs-actual/{equipmentId}")
    public ResponseEntity<Map<String, Object>> getTargetVsActual(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Map<String, Object> data = oeeService.getTargetVsActual(equipmentId, start, end);
        return ResponseEntity.ok(data);
    }

    // OEE Targets Management
    @GetMapping("/targets")
    public ResponseEntity<List<OeeTarget>> getAllTargets() {
        return ResponseEntity.ok(oeeTargetRepository.findAll());
    }

    @GetMapping("/targets/equipment/{equipmentId}")
    public ResponseEntity<List<OeeTarget>> getTargetsByEquipment(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(oeeTargetRepository.findByEquipmentId(equipmentId));
    }

    @PostMapping("/targets")
    public ResponseEntity<OeeTarget> createTarget(@RequestBody OeeTarget target) {
        return ResponseEntity.ok(oeeTargetRepository.save(target));
    }

    @PutMapping("/targets/{id}")
    public ResponseEntity<OeeTarget> updateTarget(@PathVariable Long id, @RequestBody OeeTarget targetDetails) {
        OeeTarget target = oeeTargetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Target not found"));
        
        target.setTargetAvailability(targetDetails.getTargetAvailability());
        target.setTargetPerformance(targetDetails.getTargetPerformance());
        target.setTargetQuality(targetDetails.getTargetQuality());
        target.setTargetOee(targetDetails.getTargetOee());
        target.setIndustryBenchmarkOee(targetDetails.getIndustryBenchmarkOee());
        target.setEffectiveFrom(targetDetails.getEffectiveFrom());
        target.setEffectiveTo(targetDetails.getEffectiveTo());
        target.setIsActive(targetDetails.getIsActive());
        
        return ResponseEntity.ok(oeeTargetRepository.save(target));
    }

    @DeleteMapping("/targets/{id}")
    public ResponseEntity<Void> deleteTarget(@PathVariable Long id) {
        oeeTargetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
