package com.mes.repository;

import com.mes.model.DefectCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DefectCategoryRepository extends JpaRepository<DefectCategory, Long> {
    List<DefectCategory> findByIsActive(Boolean isActive);
    Optional<DefectCategory> findByCategoryCode(String categoryCode);
    List<DefectCategory> findBySeverity(String severity);
}
