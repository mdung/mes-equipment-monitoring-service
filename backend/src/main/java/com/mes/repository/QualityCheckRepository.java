package com.mes.repository;

import com.mes.model.QualityCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QualityCheckRepository extends JpaRepository<QualityCheck, Long> {
    List<QualityCheck> findByProductionOrderId(Long productionOrderId);
    
    @Query("SELECT q FROM QualityCheck q WHERE q.productionOrder.equipment.id = :equipmentId " +
           "AND q.checkTime BETWEEN :start AND :end")
    List<QualityCheck> findByEquipmentIdAndCheckTimeBetween(@Param("equipmentId") Long equipmentId,
                                                             @Param("start") LocalDateTime start,
                                                             @Param("end") LocalDateTime end);
}
