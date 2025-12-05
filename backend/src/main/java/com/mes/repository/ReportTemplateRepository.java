package com.mes.repository;

import com.mes.model.ReportTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReportTemplateRepository extends JpaRepository<ReportTemplate, Long> {
    List<ReportTemplate> findByIsActive(Boolean isActive);
    List<ReportTemplate> findByCategory(String category);
    Optional<ReportTemplate> findByTemplateCode(String templateCode);
}
