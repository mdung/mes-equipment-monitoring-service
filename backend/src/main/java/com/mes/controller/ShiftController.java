package com.mes.controller;

import com.mes.dto.*;
import com.mes.service.ShiftService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    // Shift endpoints
    @GetMapping
    public ResponseEntity<List<ShiftDto>> getAllShifts() {
        return ResponseEntity.ok(shiftService.getAllShifts());
    }

    @GetMapping("/active")
    public ResponseEntity<List<ShiftDto>> getActiveShifts() {
        return ResponseEntity.ok(shiftService.getActiveShifts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftDto> getShiftById(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.getShiftById(id));
    }

    // Assignment endpoints
    @PostMapping("/assignments")
    public ResponseEntity<ShiftAssignmentDto> createAssignment(@Valid @RequestBody CreateShiftAssignmentRequest request) {
        return ResponseEntity.ok(shiftService.createAssignment(request));
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<ShiftAssignmentDto>> getAssignmentsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(shiftService.getAssignmentsByDate(date));
    }

    @GetMapping("/assignments/shift/{shiftId}")
    public ResponseEntity<List<ShiftAssignmentDto>> getAssignmentsByShiftAndDate(
            @PathVariable Long shiftId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(shiftService.getAssignmentsByShiftAndDate(shiftId, date));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<?> deleteAssignment(@PathVariable Long id) {
        shiftService.deleteAssignment(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Assignment deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Handover endpoints
    @PostMapping("/handovers")
    public ResponseEntity<ShiftHandoverDto> createHandover(@Valid @RequestBody CreateShiftHandoverRequest request) {
        return ResponseEntity.ok(shiftService.createHandover(request));
    }

    @GetMapping("/handovers")
    public ResponseEntity<List<ShiftHandoverDto>> getHandoversByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(shiftService.getHandoversByDate(date));
    }

    @GetMapping("/handovers/pending")
    public ResponseEntity<List<ShiftHandoverDto>> getPendingHandovers() {
        return ResponseEntity.ok(shiftService.getPendingHandovers());
    }

    @PutMapping("/handovers/{id}/acknowledge")
    public ResponseEntity<ShiftHandoverDto> acknowledgeHandover(@PathVariable Long id) {
        return ResponseEntity.ok(shiftService.acknowledgeHandover(id));
    }

    // Production reports
    @GetMapping("/production-report")
    public ResponseEntity<List<ShiftProductionReport>> getProductionReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(shiftService.getProductionReportByDateRange(startDate, endDate));
    }
}
