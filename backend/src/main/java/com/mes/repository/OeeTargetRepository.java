package com.mes.repository;

import com.mes.model.OeeTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OeeTargetRepository extends JpaRepository<OeeTarget, Long> {
    List<OeeTarget> findByEquipmentId(Long equipmentId);
    List<OeeTarget> findByEquipmentType(String equipmentType);
    List<OeeTarget> findByIsActive(Boolean isActive);
    
    @Query("SELECT o FROM OeeTarget o WHERE o.equipment.id = :equipmentId " +
           "AND o.isActive = true AND o.effectiveFrom <= :date " +
           "AND (o.effectiveTo IS NULL OR o.effectiveTo >= :date)")
    Optional<OeeTarget> findActiveTargetForEquipment(@Param("equipmentId") Long equipmentId, 
                                                      @Param("date") LocalDate date);
    
    @Query("SELECT AVG(o.targetOee) FROM OeeTarget o WHERE o.isActive = true")
    Double getCompanyAverageTarget();
}
