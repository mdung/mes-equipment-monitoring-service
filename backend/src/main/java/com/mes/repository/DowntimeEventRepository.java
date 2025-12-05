package com.mes.repository;

import com.mes.model.DowntimeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DowntimeEventRepository extends JpaRepository<DowntimeEvent, Long> {
    List<DowntimeEvent> findByEquipmentIdOrderByStartTimeDesc(Long equipmentId);
}
