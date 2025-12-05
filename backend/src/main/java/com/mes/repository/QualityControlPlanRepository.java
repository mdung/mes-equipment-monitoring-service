package com.mes.repository;

import com.mes.model.QualityControlPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QualityControlPlanRepository extends JpaRepository<QualityControlPlan, Long> {
    List<QualityControlPlan> findByIsActive(Boolean isActive);
    List<QualityControlPlan> findByProductId(Long productId);
}
