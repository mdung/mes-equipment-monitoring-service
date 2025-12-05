package com.mes.repository;

import com.mes.model.ScheduledReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduledReportRepository extends JpaRepository<ScheduledReport, Long> {
    List<ScheduledReport> findByIsActive(Boolean isActive);
    List<ScheduledReport> findByTemplateId(Long templateId);
}
