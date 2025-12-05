package com.mes.repository;

import com.mes.model.ShiftAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShiftAssignmentRepository extends JpaRepository<ShiftAssignment, Long> {
    List<ShiftAssignment> findByAssignmentDate(LocalDate date);
    List<ShiftAssignment> findByShiftIdAndAssignmentDate(Long shiftId, LocalDate date);
    List<ShiftAssignment> findByUserIdAndAssignmentDate(Long userId, LocalDate date);
    List<ShiftAssignment> findByAssignmentDateBetween(LocalDate startDate, LocalDate endDate);
}
