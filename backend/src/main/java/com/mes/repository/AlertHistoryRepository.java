package com.mes.repository;

import com.mes.model.AlertHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertHistoryRepository extends JpaRepository<AlertHistory, Long> {
    List<AlertHistory> findByAcknowledged(Boolean acknowledged);
    List<AlertHistory> findByResolved(Boolean resolved);
    List<AlertHistory> findByEquipmentId(Long equipmentId);
    List<AlertHistory> findByTriggeredAtBetween(LocalDateTime start, LocalDateTime end);
    List<AlertHistory> findBySeverity(String severity);
    List<AlertHistory> findAllByOrderByTriggeredAtDesc();
}
