package com.mes.service;

import com.mes.model.*;
import com.mes.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QualityManagementService {

    @Autowired
    private QualityControlPlanRepository planRepository;

    @Autowired
    private InspectionChecklistRepository checklistRepository;

    @Autowired
    private InspectionChecklistItemRepository checklistItemRepository;

    @Autowired
    private DefectCategoryRepository defectCategoryRepository;

    @Autowired
    private DefectRecordRepository defectRecordRepository;

    @Autowired
    private RootCauseAnalysisRepository rcaRepository;

    @Autowired
    private SpcDataPointRepository spcRepository;

    // Quality Control Plans
    public List<QualityControlPlan> getAllPlans() {
        return planRepository.findAll();
    }

    public List<QualityControlPlan> getActivePlans() {
        return planRepository.findByIsActive(true);
    }

    public QualityControlPlan getPlanById(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
    }

    @Transactional
    public QualityControlPlan createPlan(QualityControlPlan plan) {
        return planRepository.save(plan);
    }

    @Transactional
    public QualityControlPlan updatePlan(Long id, QualityControlPlan planDetails) {
        QualityControlPlan plan = getPlanById(id);
        plan.setPlanName(planDetails.getPlanName());
        plan.setProduct(planDetails.getProduct());
        plan.setDescription(planDetails.getDescription());
        plan.setVersion(planDetails.getVersion());
        plan.setIsActive(planDetails.getIsActive());
        return planRepository.save(plan);
    }

    @Transactional
    public void deletePlan(Long id) {
        planRepository.deleteById(id);
    }

    // Inspection Checklists
    public List<InspectionChecklist> getChecklistsByPlan(Long planId) {
        return checklistRepository.findByPlanId(planId);
    }

    public InspectionChecklist getChecklistById(Long id) {
        return checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist not found"));
    }

    @Transactional
    public InspectionChecklist createChecklist(InspectionChecklist checklist) {
        return checklistRepository.save(checklist);
    }

    @Transactional
    public InspectionChecklist updateChecklist(Long id, InspectionChecklist checklistDetails) {
        InspectionChecklist checklist = getChecklistById(id);
        checklist.setChecklistName(checklistDetails.getChecklistName());
        checklist.setInspectionType(checklistDetails.getInspectionType());
        checklist.setSequenceOrder(checklistDetails.getSequenceOrder());
        checklist.setIsMandatory(checklistDetails.getIsMandatory());
        return checklistRepository.save(checklist);
    }

    // Checklist Items
    public List<InspectionChecklistItem> getChecklistItems(Long checklistId) {
        return checklistItemRepository.findByChecklistIdOrderBySequenceOrder(checklistId);
    }

    @Transactional
    public InspectionChecklistItem createChecklistItem(InspectionChecklistItem item) {
        return checklistItemRepository.save(item);
    }

    @Transactional
    public InspectionChecklistItem updateChecklistItem(Long id, InspectionChecklistItem itemDetails) {
        InspectionChecklistItem item = checklistItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));
        item.setItemDescription(itemDetails.getItemDescription());
        item.setSpecification(itemDetails.getSpecification());
        item.setMeasurementMethod(itemDetails.getMeasurementMethod());
        item.setAcceptanceCriteria(itemDetails.getAcceptanceCriteria());
        item.setSequenceOrder(itemDetails.getSequenceOrder());
        item.setIsCritical(itemDetails.getIsCritical());
        return checklistItemRepository.save(item);
    }

    @Transactional
    public void deleteChecklistItem(Long id) {
        checklistItemRepository.deleteById(id);
    }

    // Defect Categories
    public List<DefectCategory> getAllDefectCategories() {
        return defectCategoryRepository.findAll();
    }

    public List<DefectCategory> getActiveDefectCategories() {
        return defectCategoryRepository.findByIsActive(true);
    }

    @Transactional
    public DefectCategory createDefectCategory(DefectCategory category) {
        return defectCategoryRepository.save(category);
    }

    @Transactional
    public DefectCategory updateDefectCategory(Long id, DefectCategory categoryDetails) {
        DefectCategory category = defectCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Defect category not found"));
        category.setCategoryName(categoryDetails.getCategoryName());
        category.setCategoryCode(categoryDetails.getCategoryCode());
        category.setDescription(categoryDetails.getDescription());
        category.setSeverity(categoryDetails.getSeverity());
        category.setIsActive(categoryDetails.getIsActive());
        return defectCategoryRepository.save(category);
    }

    // Defect Records
    public List<DefectRecord> getAllDefects() {
        return defectRecordRepository.findAll();
    }

    public DefectRecord getDefectById(Long id) {
        return defectRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Defect record not found"));
    }

    public List<DefectRecord> getDefectsByOrder(Long orderId) {
        return defectRecordRepository.findByProductionOrderId(orderId);
    }

    public List<DefectRecord> getRecentDefects(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return defectRecordRepository.findRecentDefects(startDate);
    }

    @Transactional
    public DefectRecord createDefect(DefectRecord defect) {
        return defectRecordRepository.save(defect);
    }

    @Transactional
    public DefectRecord updateDefect(Long id, DefectRecord defectDetails) {
        DefectRecord defect = getDefectById(id);
        defect.setDefectDescription(defectDetails.getDefectDescription());
        defect.setQuantity(defectDetails.getQuantity());
        defect.setLocation(defectDetails.getLocation());
        defect.setStatus(defectDetails.getStatus());
        return defectRecordRepository.save(defect);
    }

    // Pareto Analysis
    public Map<String, Object> getDefectPareto(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> paretoData = defectRecordRepository.getDefectPareto(startDate);
        
        List<Map<String, Object>> chartData = new ArrayList<>();
        long totalDefects = 0;
        
        for (Object[] row : paretoData) {
            totalDefects += ((Number) row[2]).longValue();
        }
        
        long cumulativeCount = 0;
        for (Object[] row : paretoData) {
            String category = (String) row[0];
            long count = ((Number) row[1]).longValue();
            long quantity = ((Number) row[2]).longValue();
            cumulativeCount += quantity;
            
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("category", category);
            dataPoint.put("count", count);
            dataPoint.put("quantity", quantity);
            dataPoint.put("percentage", totalDefects > 0 ? (quantity * 100.0 / totalDefects) : 0);
            dataPoint.put("cumulativePercentage", totalDefects > 0 ? (cumulativeCount * 100.0 / totalDefects) : 0);
            chartData.add(dataPoint);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("data", chartData);
        result.put("totalDefects", totalDefects);
        return result;
    }

    // Root Cause Analysis
    public RootCauseAnalysis getRcaByDefect(Long defectId) {
        return rcaRepository.findByDefectRecordId(defectId).orElse(null);
    }

    public List<RootCauseAnalysis> getRcaByStatus(String status) {
        return rcaRepository.findByStatus(status);
    }

    @Transactional
    public RootCauseAnalysis createRca(RootCauseAnalysis rca) {
        return rcaRepository.save(rca);
    }

    @Transactional
    public RootCauseAnalysis updateRca(Long id, RootCauseAnalysis rcaDetails) {
        RootCauseAnalysis rca = rcaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RCA not found"));
        rca.setProblemStatement(rcaDetails.getProblemStatement());
        rca.setRootCause(rcaDetails.getRootCause());
        rca.setWhy1(rcaDetails.getWhy1());
        rca.setWhy2(rcaDetails.getWhy2());
        rca.setWhy3(rcaDetails.getWhy3());
        rca.setWhy4(rcaDetails.getWhy4());
        rca.setWhy5(rcaDetails.getWhy5());
        rca.setCorrectiveAction(rcaDetails.getCorrectiveAction());
        rca.setPreventiveAction(rcaDetails.getPreventiveAction());
        rca.setActionOwner(rcaDetails.getActionOwner());
        rca.setTargetCompletionDate(rcaDetails.getTargetCompletionDate());
        rca.setActualCompletionDate(rcaDetails.getActualCompletionDate());
        rca.setVerificationNotes(rcaDetails.getVerificationNotes());
        rca.setStatus(rcaDetails.getStatus());
        return rcaRepository.save(rca);
    }

    // SPC Data
    public List<SpcDataPoint> getSpcData(Long equipmentId, String parameterName, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return spcRepository.findSpcChartData(equipmentId, parameterName, startDate);
    }

    public List<String> getSpcParameters(Long equipmentId) {
        return spcRepository.findDistinctParametersByEquipment(equipmentId);
    }

    @Transactional
    public SpcDataPoint recordSpcData(SpcDataPoint dataPoint) {
        return spcRepository.save(dataPoint);
    }

    public List<SpcDataPoint> getOutOfControlPoints() {
        return spcRepository.findByIsOutOfControl(true);
    }

    // Quality Trends
    public Map<String, Object> getQualityTrends(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<DefectRecord> defects = defectRecordRepository.findByDetectedAtBetween(startDate, LocalDateTime.now());
        
        // Group by date
        Map<String, Long> trendData = defects.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getDetectedAt().toLocalDate().toString(),
                        Collectors.summingLong(DefectRecord::getQuantity)
                ));
        
        Map<String, Object> result = new HashMap<>();
        result.put("trendData", trendData);
        result.put("totalDefects", defects.stream().mapToLong(DefectRecord::getQuantity).sum());
        result.put("defectCount", defects.size());
        return result;
    }
}
