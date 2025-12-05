package com.mes.service;

import com.mes.model.ChangeHistory;
import com.mes.model.User;
import com.mes.repository.ChangeHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChangeHistoryService {

    @Autowired
    private ChangeHistoryRepository changeHistoryRepository;

    @Transactional
    public ChangeHistory recordChange(String entityType, Long entityId, String entityName,
                                      String fieldName, String oldValue, String newValue,
                                      String username, String changeReason) {
        ChangeHistory change = new ChangeHistory();
        change.setEntityType(entityType);
        change.setEntityId(entityId);
        change.setEntityName(entityName);
        change.setFieldName(fieldName);
        change.setOldValue(oldValue);
        change.setNewValue(newValue);
        change.setChangedByUsername(username);
        change.setChangedAt(LocalDateTime.now());
        change.setChangeReason(changeReason);
        
        return changeHistoryRepository.save(change);
    }

    @Transactional
    public ChangeHistory recordChange(String entityType, Long entityId, String entityName,
                                      String fieldName, String oldValue, String newValue,
                                      User user, String changeReason, boolean requiresApproval) {
        ChangeHistory change = recordChange(entityType, entityId, entityName, fieldName, 
                                           oldValue, newValue, user.getUsername(), changeReason);
        change.setChangedBy(user);
        change.setApprovalRequired(requiresApproval);
        if (requiresApproval) {
            change.setApprovalStatus("PENDING");
        }
        
        return changeHistoryRepository.save(change);
    }

    @Transactional
    public ChangeHistory approveChange(Long changeId, User approver) {
        ChangeHistory change = changeHistoryRepository.findById(changeId)
                .orElseThrow(() -> new RuntimeException("Change history not found"));
        
        change.setApprovedBy(approver);
        change.setApprovedAt(LocalDateTime.now());
        change.setApprovalStatus("APPROVED");
        
        return changeHistoryRepository.save(change);
    }

    @Transactional
    public ChangeHistory rejectChange(Long changeId, User approver) {
        ChangeHistory change = changeHistoryRepository.findById(changeId)
                .orElseThrow(() -> new RuntimeException("Change history not found"));
        
        change.setApprovedBy(approver);
        change.setApprovedAt(LocalDateTime.now());
        change.setApprovalStatus("REJECTED");
        
        return changeHistoryRepository.save(change);
    }

    public List<ChangeHistory> getEntityChangeHistory(String entityType, Long entityId) {
        return changeHistoryRepository.findEntityChangeHistory(entityType, entityId);
    }

    public List<ChangeHistory> getFieldChangeHistory(String entityType, Long entityId, String fieldName) {
        return changeHistoryRepository.findFieldChangeHistory(entityType, entityId, fieldName);
    }

    public List<ChangeHistory> getUserChanges(Long userId) {
        return changeHistoryRepository.findByChangedById(userId);
    }

    public List<ChangeHistory> getPendingApprovals() {
        return changeHistoryRepository.findByApprovalStatus("PENDING");
    }

    public Long countPendingApprovals() {
        return changeHistoryRepository.countPendingApprovals();
    }

    public List<ChangeHistory> getChangesByDateRange(LocalDateTime start, LocalDateTime end) {
        return changeHistoryRepository.findByChangedAtBetween(start, end);
    }
}
