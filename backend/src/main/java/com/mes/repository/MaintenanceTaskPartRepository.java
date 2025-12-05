package com.mes.repository;

import com.mes.model.MaintenanceTaskPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceTaskPartRepository extends JpaRepository<MaintenanceTaskPart, Long> {
    List<MaintenanceTaskPart> findByTaskId(Long taskId);
    List<MaintenanceTaskPart> findByPartId(Long partId);
}
