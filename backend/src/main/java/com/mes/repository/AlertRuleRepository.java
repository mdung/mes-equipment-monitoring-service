package com.mes.repository;

import com.mes.model.AlertRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {
    List<AlertRule> findByIsActive(Boolean isActive);
    List<AlertRule> findByRuleType(String ruleType);
    List<AlertRule> findByEquipmentId(Long equipmentId);
}
