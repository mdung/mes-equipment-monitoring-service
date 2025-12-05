package com.mes.repository;

import com.mes.model.DataRetentionPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DataRetentionPolicyRepository extends JpaRepository<DataRetentionPolicy, Long> {
    Optional<DataRetentionPolicy> findByEntityType(String entityType);
    List<DataRetentionPolicy> findByIsActive(Boolean isActive);
    List<DataRetentionPolicy> findByArchiveEnabled(Boolean archiveEnabled);
    
    @Query("SELECT d FROM DataRetentionPolicy d WHERE d.isActive = true AND d.nextExecution <= :now")
    List<DataRetentionPolicy> findPoliciesDueForExecution(@Param("now") LocalDateTime now);
    
    @Query("SELECT d FROM DataRetentionPolicy d WHERE d.isActive = true ORDER BY d.entityType")
    List<DataRetentionPolicy> findAllActivePolicies();
}
