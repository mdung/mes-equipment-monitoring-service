package com.mes.repository;

import com.mes.model.AuditTrail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditTrailRepository extends JpaRepository<AuditTrail, Long> {
    List<AuditTrail> findByEntityTypeAndEntityId(String entityType, Long entityId);
    List<AuditTrail> findByUserId(Long userId);
    List<AuditTrail> findByUsername(String username);
    List<AuditTrail> findByAction(String action);
    List<AuditTrail> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<AuditTrail> findByEntityType(String entityType);
    List<AuditTrail> findBySessionId(String sessionId);
    
    @Query("SELECT a FROM AuditTrail a WHERE a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.timestamp DESC")
    List<AuditTrail> findEntityHistory(@Param("entityType") String entityType, @Param("entityId") Long entityId);
    
    @Query("SELECT a FROM AuditTrail a WHERE a.timestamp BETWEEN :start AND :end ORDER BY a.timestamp DESC")
    List<AuditTrail> findAuditTrailByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(a) FROM AuditTrail a WHERE a.timestamp >= :since")
    Long countRecentAudits(@Param("since") LocalDateTime since);
}
