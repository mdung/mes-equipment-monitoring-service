package com.mes.repository;

import com.mes.model.ShiftHandover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftHandoverRepository extends JpaRepository<ShiftHandover, Long> {
    List<ShiftHandover> findByHandoverDate(LocalDate date);
    List<ShiftHandover> findByHandoverDateBetween(LocalDate startDate, LocalDate endDate);
    List<ShiftHandover> findByToUserIdAndAcknowledgedFalse(Long userId);
    List<ShiftHandover> findByFromShiftIdAndHandoverDate(Long shiftId, LocalDate date);
}
