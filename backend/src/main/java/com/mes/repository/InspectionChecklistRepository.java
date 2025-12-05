package com.mes.repository;

import com.mes.model.InspectionChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InspectionChecklistRepository extends JpaRepository<InspectionChecklist, Long> {
    List<InspectionChecklist> findByPlanId(Long planId);
    List<InspectionChecklist> findByInspectionType(String inspectionType);
}
