package com.mes.repository;

import com.mes.model.WorkInstruction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkInstructionRepository extends JpaRepository<WorkInstruction, Long> {
    List<WorkInstruction> findByProductIdOrderByStepNumber(Long productId);
}
