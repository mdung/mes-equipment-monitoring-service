package com.mes.repository;

import com.mes.model.RootCauseAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RootCauseAnalysisRepository extends JpaRepository<RootCauseAnalysis, Long> {
    Optional<RootCauseAnalysis> findByDefectRecordId(Long defectRecordId);
    List<RootCauseAnalysis> findByStatus(String status);
    List<RootCauseAnalysis> findByActionOwnerId(Long userId);
}
