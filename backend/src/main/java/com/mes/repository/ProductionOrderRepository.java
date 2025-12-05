package com.mes.repository;

import com.mes.model.ProductionOrder;
import com.mes.model.ProductionOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long> {
    Optional<ProductionOrder> findByOrderNumber(String orderNumber);

    List<ProductionOrder> findByStatus(ProductionOrderStatus status);

    List<ProductionOrder> findByEquipmentId(Long equipmentId);
    
    @Query("SELECT p FROM ProductionOrder p WHERE p.equipment.id = :equipmentId " +
           "AND ((p.startDate BETWEEN :start AND :end) OR (p.endDate BETWEEN :start AND :end))")
    List<ProductionOrder> findByEquipmentIdAndStatusInPeriod(@Param("equipmentId") Long equipmentId,
                                                              @Param("start") LocalDateTime start,
                                                              @Param("end") LocalDateTime end);
}
