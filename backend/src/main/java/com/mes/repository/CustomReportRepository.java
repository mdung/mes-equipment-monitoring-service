package com.mes.repository;

import com.mes.model.CustomReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomReportRepository extends JpaRepository<CustomReport, Long> {
    List<CustomReport> findByCreatedById(Long userId);
    List<CustomReport> findByIsPublic(Boolean isPublic);
    List<CustomReport> findByDataSource(String dataSource);
}
