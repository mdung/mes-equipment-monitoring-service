package com.mes.repository;

import com.mes.model.OeeTrend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OeeTrendRepository extends JpaRepository<OeeTrend, Long> {
    List<OeeTrend> findByEquipmentId(Long equipmentId);
    List<OeeTrend> findByTrendPeriod(String trendPeriod);
    
    @Query("SELECT o FROM OeeTrend o WHERE o.equipment.id = :equipmentId " +
           "AND o.trendPeriod = :period ORDER BY o.periodStart DESC")
    List<OeeTrend> findByEquipmentAndPeriod(@Param("equipmentId") Long equipmentId, 
                                            @Param("period") String period);
    
    @Query("SELECT o FROM OeeTrend o WHERE o.equipment.id = :equipmentId " +
           "AND o.periodStart >= :start AND o.periodEnd <= :end " +
           "ORDER BY o.periodStart ASC")
    List<OeeTrend> findTrendData(@Param("equipmentId") Long equipmentId,
                                  @Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);
}
