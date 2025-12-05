package com.mes.repository;

import com.mes.model.OeeCalculation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OeeCalculationRepository extends JpaRepository<OeeCalculation, Long> {
    List<OeeCalculation> findByEquipmentId(Long equipmentId);
    List<OeeCalculation> findByProductionOrderId(Long productionOrderId);
    List<OeeCalculation> findByShiftId(Long shiftId);
    List<OeeCalculation> findByCalculationType(String calculationType);
    
    @Query("SELECT o FROM OeeCalculation o WHERE o.equipment.id = :equipmentId " +
           "AND o.calculationPeriodStart >= :start AND o.calculationPeriodEnd <= :end " +
           "ORDER BY o.calculationPeriodStart DESC")
    List<OeeCalculation> findByEquipmentAndPeriod(@Param("equipmentId") Long equipmentId,
                                                   @Param("start") LocalDateTime start,
                                                   @Param("end") LocalDateTime end);
    
    @Query("SELECT o FROM OeeCalculation o WHERE o.calculationPeriodStart >= :start " +
           "AND o.calculationPeriodEnd <= :end ORDER BY o.calculationPeriodStart DESC")
    List<OeeCalculation> findByPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT o FROM OeeCalculation o WHERE o.equipment.id = :equipmentId " +
           "ORDER BY o.calculationPeriodStart DESC LIMIT 1")
    OeeCalculation findLatestByEquipment(@Param("equipmentId") Long equipmentId);
    
    @Query("SELECT AVG(o.oeePercentage) FROM OeeCalculation o WHERE o.equipment.id = :equipmentId " +
           "AND o.calculationPeriodStart >= :start")
    Double getAverageOeeByEquipment(@Param("equipmentId") Long equipmentId, @Param("start") LocalDateTime start);
}
