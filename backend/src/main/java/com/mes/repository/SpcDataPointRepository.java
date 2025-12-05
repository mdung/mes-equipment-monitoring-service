package com.mes.repository;

import com.mes.model.SpcDataPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SpcDataPointRepository extends JpaRepository<SpcDataPoint, Long> {
    List<SpcDataPoint> findByEquipmentIdAndParameterNameOrderByMeasuredAtDesc(Long equipmentId, String parameterName);
    List<SpcDataPoint> findByProductionOrderId(Long productionOrderId);
    List<SpcDataPoint> findByIsOutOfControl(Boolean isOutOfControl);
    
    @Query("SELECT s FROM SpcDataPoint s WHERE s.equipment.id = :equipmentId " +
           "AND s.parameterName = :parameterName " +
           "AND s.measuredAt >= :startDate " +
           "ORDER BY s.measuredAt ASC")
    List<SpcDataPoint> findSpcChartData(@Param("equipmentId") Long equipmentId,
                                        @Param("parameterName") String parameterName,
                                        @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT DISTINCT s.parameterName FROM SpcDataPoint s WHERE s.equipment.id = :equipmentId")
    List<String> findDistinctParametersByEquipment(@Param("equipmentId") Long equipmentId);
}
