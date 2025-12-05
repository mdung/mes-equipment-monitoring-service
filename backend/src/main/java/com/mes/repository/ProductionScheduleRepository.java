package com.mes.repository;

import com.mes.model.ProductionSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProductionScheduleRepository extends JpaRepository<ProductionSchedule, Long> {
    List<ProductionSchedule> findByEquipmentId(Long equipmentId);
    List<ProductionSchedule> findByProductionOrderId(Long productionOrderId);
    List<ProductionSchedule> findByScheduledStartBetween(LocalDateTime start, LocalDateTime end);
    List<ProductionSchedule> findByStatus(String status);
}
