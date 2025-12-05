package com.mes.repository;

import com.mes.model.WorkflowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface WorkflowTemplateRepository extends JpaRepository<WorkflowTemplate, Long> {
    List<WorkflowTemplate> findByProductId(Long productId);
    List<WorkflowTemplate> findByIsActive(Boolean isActive);
}
