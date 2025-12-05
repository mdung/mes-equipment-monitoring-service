package com.mes.repository;

import com.mes.model.EquipmentLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EquipmentLogRepository extends JpaRepository<EquipmentLog, Long> {
    List<EquipmentLog> findByEquipmentIdOrderByTimestampDesc(Long equipmentId);
}
