package com.mes.repository;

import com.mes.model.Shift;
import com.mes.model.ShiftType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByActiveTrue();
    List<Shift> findByShiftType(ShiftType shiftType);
}
