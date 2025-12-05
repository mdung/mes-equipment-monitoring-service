package com.mes.repository;

import com.mes.model.ChangeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChangeHistoryRepository extends JpaRepository<ChangeHistory, Long> {
    List<ChangeHistory> findByEntityTypeAndEntityId(String entityType, Long entityId);
    List<ChangeHistory> findByChangedById(Long userId);
    List<ChangeHistory> findByChangedByUsername(String username);
    List<ChangeHistory> findByChangedAtBetween(LocalDateTime start, LocalDateTime end);
    List<ChangeHistory> findByApprovalStatus(String approvalStatus);
    List<ChangeHistory> findByApprovalRequiredTrue();
    
    @Query("SELECT c FROM ChangeHistory c WHERE c.entityType = :entityType AND c.entityId = :entityId ORDER BY c.changedAt DESC")
    List<ChangeHistory> findEntityChangeHistory(@Param("entityType") String entityType, @Param("entityId") Long entityId);
    
    @Query("SELECT c FROM ChangeHistory c WHERE c.entityType = :entityType AND c.entityId = :entityId AND c.fieldName = :fieldName ORDER BY c.changedAt DESC")
    List<ChangeHistory> findFieldChangeHistory(@Param("entityType") String entityType, @Param("entityId") Long entityId, @Param("fieldName") String fieldName);
    
    @Query("SELECT COUNT(c) FROM ChangeHistory c WHERE c.approvalRequired = true AND c.approvalStatus = 'PENDING'")
    Long countPendingApprovals();
}
