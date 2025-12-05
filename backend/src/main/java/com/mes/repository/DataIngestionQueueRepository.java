package com.mes.repository;

import com.mes.model.DataIngestionQueue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DataIngestionQueueRepository extends JpaRepository<DataIngestionQueue, Long> {
    List<DataIngestionQueue> findByStatus(String status);
    List<DataIngestionQueue> findBySourceSystem(String sourceSystem);
    List<DataIngestionQueue> findByDataType(String dataType);
    
    @Query("SELECT d FROM DataIngestionQueue d WHERE d.status = 'PENDING' ORDER BY d.priority DESC, d.createdAt ASC")
    List<DataIngestionQueue> findPendingItemsByPriority();
    
    @Query("SELECT d FROM DataIngestionQueue d WHERE d.status = 'FAILED' AND d.retryCount < d.maxRetries")
    List<DataIngestionQueue> findFailedItemsForRetry();
}
