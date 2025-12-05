package com.mes.repository;

import com.mes.model.MaintenanceTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceTaskRepository extends JpaRepository<MaintenanceTask, Long> {
    List<MaintenanceTask> findByEquipmentId(Long equipmentId);
    List<MaintenanceTask> findByAssignedToId(Long userId);
    List<MaintenanceTask> findByStatus(String status);
    List<MaintenanceTask> findByScheduledDateBetween(LocalDateTime start, LocalDateTime end);
}
