package com.mes.repository;

import com.mes.model.ShiftProductionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftProductionLogRepository extends JpaRepository<ShiftProductionLog, Long> {
    List<ShiftProductionLog> findByShiftDate(LocalDate date);
    List<ShiftProductionLog> findByShiftDateBetween(LocalDate startDate, LocalDate endDate);
    List<ShiftProductionLog> findByShiftIdAndShiftDate(Long shiftId, LocalDate date);
}
