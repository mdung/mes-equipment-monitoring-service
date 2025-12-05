package com.mes.repository;

import com.mes.model.IntegrationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IntegrationLogRepository extends JpaRepository<IntegrationLog, Long> {
    List<IntegrationLog> findByIntegrationType(String integrationType);
    List<IntegrationLog> findByStatus(String status);
    List<IntegrationLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<IntegrationLog> findByExternalSystemId(Long externalSystemId);
    
    @Query("SELECT i FROM IntegrationLog i WHERE i.externalSystem.id = :systemId ORDER BY i.timestamp DESC")
    List<IntegrationLog> findRecentLogsBySystem(@Param("systemId") Long systemId);
    
    @Query("SELECT i FROM IntegrationLog i WHERE i.status = 'FAILURE' AND i.timestamp >= :since ORDER BY i.timestamp DESC")
    List<IntegrationLog> findRecentFailures(@Param("since") LocalDateTime since);
}
