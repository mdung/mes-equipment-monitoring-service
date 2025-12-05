package com.mes.repository;

import com.mes.model.ComplianceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ComplianceReportRepository extends JpaRepository<ComplianceReport, Long> {
    List<ComplianceReport> findByReportType(String reportType);
    List<ComplianceReport> findByGeneratedById(Long userId);
    List<ComplianceReport> findByGeneratedAtBetween(LocalDateTime start, LocalDateTime end);
    List<ComplianceReport> findByStatus(String status);
    
    @Query("SELECT c FROM ComplianceReport c WHERE c.reportType = :reportType ORDER BY c.generatedAt DESC")
    List<ComplianceReport> findRecentReportsByType(@Param("reportType") String reportType);
    
    @Query("SELECT c FROM ComplianceReport c ORDER BY c.generatedAt DESC")
    List<ComplianceReport> findAllOrderByGeneratedAtDesc();
}
