package com.mes.service;

import com.mes.model.ComplianceReport;
import com.mes.model.User;
import com.mes.repository.ComplianceReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ComplianceService {

    @Autowired
    private ComplianceReportRepository complianceReportRepository;

    @Autowired
    private AuditService auditService;

    @Autowired
    private UserActivityService userActivityService;

    @Autowired
    private ChangeHistoryService changeHistoryService;

    @Transactional
    public ComplianceReport generateAuditTrailReport(User user, LocalDateTime startDate, 
                                                     LocalDateTime endDate, Map<String, Object> filters) {
        ComplianceReport report = new ComplianceReport();
        report.setReportName("Audit Trail Report - " + LocalDateTime.now());
        report.setReportType("AUDIT_TRAIL");
        report.setGeneratedBy(user);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setFilters(filters);
        
        var audits = auditService.getAuditsByDateRange(startDate, endDate);
        report.setTotalRecords(audits.size());
        report.setStatus("COMPLETED");
        
        return complianceReportRepository.save(report);
    }

    @Transactional
    public ComplianceReport generateUserActivityReport(User user, LocalDateTime startDate, 
                                                       LocalDateTime endDate, Map<String, Object> filters) {
        ComplianceReport report = new ComplianceReport();
        report.setReportName("User Activity Report - " + LocalDateTime.now());
        report.setReportType("USER_ACTIVITY");
        report.setGeneratedBy(user);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setFilters(filters);
        
        var activities = userActivityService.getActivitiesByDateRange(startDate, endDate);
        report.setTotalRecords(activities.size());
        report.setStatus("COMPLETED");
        
        return complianceReportRepository.save(report);
    }

    @Transactional
    public ComplianceReport generateChangeHistoryReport(User user, LocalDateTime startDate, 
                                                        LocalDateTime endDate, Map<String, Object> filters) {
        ComplianceReport report = new ComplianceReport();
        report.setReportName("Change History Report - " + LocalDateTime.now());
        report.setReportType("CHANGE_HISTORY");
        report.setGeneratedBy(user);
        report.setStartDate(startDate);
        report.setEndDate(endDate);
        report.setFilters(filters);
        
        var changes = changeHistoryService.getChangesByDateRange(startDate, endDate);
        report.setTotalRecords(changes.size());
        report.setStatus("COMPLETED");
        
        return complianceReportRepository.save(report);
    }

    public List<ComplianceReport> getAllReports() {
        return complianceReportRepository.findAllOrderByGeneratedAtDesc();
    }

    public List<ComplianceReport> getReportsByType(String reportType) {
        return complianceReportRepository.findRecentReportsByType(reportType);
    }

    public List<ComplianceReport> getUserReports(Long userId) {
        return complianceReportRepository.findByGeneratedById(userId);
    }

    public ComplianceReport getReportById(Long id) {
        return complianceReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }
}
