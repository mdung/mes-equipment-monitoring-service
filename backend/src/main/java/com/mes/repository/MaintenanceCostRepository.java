package com.mes.repository;

import com.mes.model.MaintenanceCost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface MaintenanceCostRepository extends JpaRepository<MaintenanceCost, Long> {
    List<MaintenanceCost> findByTaskId(Long taskId);
    
    @Query("SELECT SUM(c.amount) FROM MaintenanceCost c WHERE c.task.id = :taskId")
    BigDecimal getTotalCostByTaskId(Long taskId);
}
