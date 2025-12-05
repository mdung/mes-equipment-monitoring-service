package com.mes.service;

import com.mes.model.DataRetentionPolicy;
import com.mes.model.User;
import com.mes.repository.DataRetentionPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DataRetentionService {

    @Autowired
    private DataRetentionPolicyRepository policyRepository;

    @Transactional
    public DataRetentionPolicy createPolicy(String entityType, Integer retentionDays, 
                                           Boolean archiveEnabled, User createdBy) {
        DataRetentionPolicy policy = new DataRetentionPolicy();
        policy.setEntityType(entityType);
        policy.setRetentionDays(retentionDays);
        policy.setArchiveEnabled(archiveEnabled);
        policy.setCreatedBy(createdBy);
        policy.setIsActive(true);
        policy.setNextExecution(LocalDateTime.now().plusDays(1));
        
        return policyRepository.save(policy);
    }

    @Transactional
    public DataRetentionPolicy updatePolicy(Long id, DataRetentionPolicy policyDetails) {
        DataRetentionPolicy policy = policyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found"));
        
        policy.setRetentionDays(policyDetails.getRetentionDays());
        policy.setArchiveEnabled(policyDetails.getArchiveEnabled());
        policy.setArchiveLocation(policyDetails.getArchiveLocation());
        policy.setDeleteAfterArchive(policyDetails.getDeleteAfterArchive());
        policy.setIsActive(policyDetails.getIsActive());
        
        return policyRepository.save(policy);
    }

    public List<DataRetentionPolicy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public List<DataRetentionPolicy> getActivePolicies() {
        return policyRepository.findAllActivePolicies();
    }

    public DataRetentionPolicy getPolicyByEntityType(String entityType) {
        return policyRepository.findByEntityType(entityType).orElse(null);
    }

    @Transactional
    public void deletePolicy(Long id) {
        policyRepository.deleteById(id);
    }

    // Scheduled job to execute retention policies (runs daily at 2 AM)
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void executeRetentionPolicies() {
        List<DataRetentionPolicy> policies = policyRepository.findPoliciesDueForExecution(LocalDateTime.now());
        
        for (DataRetentionPolicy policy : policies) {
            try {
                executePolicy(policy);
                policy.setLastExecution(LocalDateTime.now());
                policy.setNextExecution(LocalDateTime.now().plusDays(1));
                policyRepository.save(policy);
            } catch (Exception e) {
                System.err.println("Failed to execute retention policy for " + policy.getEntityType() + ": " + e.getMessage());
            }
        }
    }

    private void executePolicy(DataRetentionPolicy policy) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(policy.getRetentionDays());
        
        // Implementation would depend on entity type
        // This is a placeholder for the actual archival/deletion logic
        System.out.println("Executing retention policy for " + policy.getEntityType() + 
                          " with cutoff date: " + cutoffDate);
        
        if (policy.getArchiveEnabled()) {
            // Archive old data
            System.out.println("Archiving data older than " + cutoffDate);
        }
        
        if (policy.getDeleteAfterArchive()) {
            // Delete archived data
            System.out.println("Deleting archived data");
        }
    }

    public Integer getRetentionDays(String entityType) {
        DataRetentionPolicy policy = getPolicyByEntityType(entityType);
        return policy != null ? policy.getRetentionDays() : null;
    }
}
