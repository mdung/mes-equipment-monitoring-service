package com.mes.repository;

import com.mes.model.DefectRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DefectRecordRepository extends JpaRepository<DefectRecord, Long> {
    List<DefectRecord> findByProductionOrderId(Long productionOrderId);
    List<DefectRecord> findByDefectCategoryId(Long categoryId);
    List<DefectRecord> findByStatus(String status);
    List<DefectRecord> findByDetectedAtBetween(LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT dr FROM DefectRecord dr WHERE dr.detectedAt >= :startDate ORDER BY dr.detectedAt DESC")
    List<DefectRecord> findRecentDefects(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT dr.defectCategory.categoryName, COUNT(dr), SUM(dr.quantity) " +
           "FROM DefectRecord dr " +
           "WHERE dr.detectedAt >= :startDate " +
           "GROUP BY dr.defectCategory.categoryName " +
           "ORDER BY SUM(dr.quantity) DESC")
    List<Object[]> getDefectPareto(@Param("startDate") LocalDateTime startDate);
}
