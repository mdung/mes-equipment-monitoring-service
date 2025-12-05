package com.mes.controller;

import com.mes.model.*;
import com.mes.service.QualityManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quality-management")
@CrossOrigin(origins = "*")
public class QualityManagementController {

    @Autowired
    private QualityManagementService qualityService;

    // Quality Control Plans
    @GetMapping("/plans")
    public ResponseEntity<List<QualityControlPlan>> getAllPlans() {
        return ResponseEntity.ok(qualityService.getAllPlans());
    }

    @GetMapping("/plans/active")
    public ResponseEntity<List<QualityControlPlan>> getActivePlans() {
        return ResponseEntity.ok(qualityService.getActivePlans());
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<QualityControlPlan> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(qualityService.getPlanById(id));
    }

    @PostMapping("/plans")
    public ResponseEntity<QualityControlPlan> createPlan(@RequestBody QualityControlPlan plan) {
        return ResponseEntity.ok(qualityService.createPlan(plan));
    }

    @PutMapping("/plans/{id}")
    public ResponseEntity<QualityControlPlan> updatePlan(@PathVariable Long id, @RequestBody QualityControlPlan plan) {
        return ResponseEntity.ok(qualityService.updatePlan(id, plan));
    }

    @DeleteMapping("/plans/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long id) {
        qualityService.deletePlan(id);
        return ResponseEntity.ok().build();
    }

    // Inspection Checklists
    @GetMapping("/checklists/plan/{planId}")
    public ResponseEntity<List<InspectionChecklist>> getChecklistsByPlan(@PathVariable Long planId) {
        return ResponseEntity.ok(qualityService.getChecklistsByPlan(planId));
    }

    @GetMapping("/checklists/{id}")
    public ResponseEntity<InspectionChecklist> getChecklistById(@PathVariable Long id) {
        return ResponseEntity.ok(qualityService.getChecklistById(id));
    }

    @PostMapping("/checklists")
    public ResponseEntity<InspectionChecklist> createChecklist(@RequestBody InspectionChecklist checklist) {
        return ResponseEntity.ok(qualityService.createChecklist(checklist));
    }

    @PutMapping("/checklists/{id}")
    public ResponseEntity<InspectionChecklist> updateChecklist(@PathVariable Long id, @RequestBody InspectionChecklist checklist) {
        return ResponseEntity.ok(qualityService.updateChecklist(id, checklist));
    }

    // Checklist Items
    @GetMapping("/checklist-items/checklist/{checklistId}")
    public ResponseEntity<List<InspectionChecklistItem>> getChecklistItems(@PathVariable Long checklistId) {
        return ResponseEntity.ok(qualityService.getChecklistItems(checklistId));
    }

    @PostMapping("/checklist-items")
    public ResponseEntity<InspectionChecklistItem> createChecklistItem(@RequestBody InspectionChecklistItem item) {
        return ResponseEntity.ok(qualityService.createChecklistItem(item));
    }

    @PutMapping("/checklist-items/{id}")
    public ResponseEntity<InspectionChecklistItem> updateChecklistItem(@PathVariable Long id, @RequestBody InspectionChecklistItem item) {
        return ResponseEntity.ok(qualityService.updateChecklistItem(id, item));
    }

    @DeleteMapping("/checklist-items/{id}")
    public ResponseEntity<Void> deleteChecklistItem(@PathVariable Long id) {
        qualityService.deleteChecklistItem(id);
        return ResponseEntity.ok().build();
    }

    // Defect Categories
    @GetMapping("/defect-categories")
    public ResponseEntity<List<DefectCategory>> getAllDefectCategories() {
        return ResponseEntity.ok(qualityService.getAllDefectCategories());
    }

    @GetMapping("/defect-categories/active")
    public ResponseEntity<List<DefectCategory>> getActiveDefectCategories() {
        return ResponseEntity.ok(qualityService.getActiveDefectCategories());
    }

    @PostMapping("/defect-categories")
    public ResponseEntity<DefectCategory> createDefectCategory(@RequestBody DefectCategory category) {
        return ResponseEntity.ok(qualityService.createDefectCategory(category));
    }

    @PutMapping("/defect-categories/{id}")
    public ResponseEntity<DefectCategory> updateDefectCategory(@PathVariable Long id, @RequestBody DefectCategory category) {
        return ResponseEntity.ok(qualityService.updateDefectCategory(id, category));
    }

    // Defect Records
    @GetMapping("/defects")
    public ResponseEntity<List<DefectRecord>> getAllDefects() {
        return ResponseEntity.ok(qualityService.getAllDefects());
    }

    @GetMapping("/defects/{id}")
    public ResponseEntity<DefectRecord> getDefectById(@PathVariable Long id) {
        return ResponseEntity.ok(qualityService.getDefectById(id));
    }

    @GetMapping("/defects/order/{orderId}")
    public ResponseEntity<List<DefectRecord>> getDefectsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(qualityService.getDefectsByOrder(orderId));
    }

    @GetMapping("/defects/recent")
    public ResponseEntity<List<DefectRecord>> getRecentDefects(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(qualityService.getRecentDefects(days));
    }

    @PostMapping("/defects")
    public ResponseEntity<DefectRecord> createDefect(@RequestBody DefectRecord defect) {
        return ResponseEntity.ok(qualityService.createDefect(defect));
    }

    @PutMapping("/defects/{id}")
    public ResponseEntity<DefectRecord> updateDefect(@PathVariable Long id, @RequestBody DefectRecord defect) {
        return ResponseEntity.ok(qualityService.updateDefect(id, defect));
    }

    // Pareto Analysis
    @GetMapping("/defects/pareto")
    public ResponseEntity<Map<String, Object>> getDefectPareto(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(qualityService.getDefectPareto(days));
    }

    // Root Cause Analysis
    @GetMapping("/rca/defect/{defectId}")
    public ResponseEntity<RootCauseAnalysis> getRcaByDefect(@PathVariable Long defectId) {
        RootCauseAnalysis rca = qualityService.getRcaByDefect(defectId);
        if (rca == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(rca);
    }

    @GetMapping("/rca/status/{status}")
    public ResponseEntity<List<RootCauseAnalysis>> getRcaByStatus(@PathVariable String status) {
        return ResponseEntity.ok(qualityService.getRcaByStatus(status));
    }

    @PostMapping("/rca")
    public ResponseEntity<RootCauseAnalysis> createRca(@RequestBody RootCauseAnalysis rca) {
        return ResponseEntity.ok(qualityService.createRca(rca));
    }

    @PutMapping("/rca/{id}")
    public ResponseEntity<RootCauseAnalysis> updateRca(@PathVariable Long id, @RequestBody RootCauseAnalysis rca) {
        return ResponseEntity.ok(qualityService.updateRca(id, rca));
    }

    // SPC Data
    @GetMapping("/spc/equipment/{equipmentId}/parameter/{parameterName}")
    public ResponseEntity<List<SpcDataPoint>> getSpcData(
            @PathVariable Long equipmentId,
            @PathVariable String parameterName,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(qualityService.getSpcData(equipmentId, parameterName, days));
    }

    @GetMapping("/spc/equipment/{equipmentId}/parameters")
    public ResponseEntity<List<String>> getSpcParameters(@PathVariable Long equipmentId) {
        return ResponseEntity.ok(qualityService.getSpcParameters(equipmentId));
    }

    @PostMapping("/spc")
    public ResponseEntity<SpcDataPoint> recordSpcData(@RequestBody SpcDataPoint dataPoint) {
        return ResponseEntity.ok(qualityService.recordSpcData(dataPoint));
    }

    @GetMapping("/spc/out-of-control")
    public ResponseEntity<List<SpcDataPoint>> getOutOfControlPoints() {
        return ResponseEntity.ok(qualityService.getOutOfControlPoints());
    }

    // Quality Trends
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getQualityTrends(@RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(qualityService.getQualityTrends(days));
    }
}
