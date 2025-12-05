package com.mes.repository;

import com.mes.model.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, Long> {
    List<MaintenanceSchedule> findByEquipmentId(Long equipmentId);
    List<MaintenanceSchedule> findByIsActiveTrue();
    List<MaintenanceSchedule> findByNextMaintenanceDateBefore(LocalDateTime date);
}
