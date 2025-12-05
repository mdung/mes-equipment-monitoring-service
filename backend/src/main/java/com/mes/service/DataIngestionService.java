package com.mes.service;

import com.mes.model.DataIngestionQueue;
import com.mes.repository.DataIngestionQueueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class DataIngestionService {

    @Autowired
    private DataIngestionQueueRepository queueRepository;

    @Transactional
    public DataIngestionQueue queueData(String sourceSystem, String dataType, 
                                       Map<String, Object> payload, Integer priority) {
        DataIngestionQueue item = new DataIngestionQueue();
        item.setSourceSystem(sourceSystem);
        item.setDataType(dataType);
        item.setPayload(payload);
        item.setPriority(priority != null ? priority : 5);
        item.setStatus("PENDING");
        
        return queueRepository.save(item);
    }

    public List<DataIngestionQueue> getPendingItems() {
        return queueRepository.findPendingItemsByPriority();
    }

    public List<DataIngestionQueue> getItemsByStatus(String status) {
        return queueRepository.findByStatus(status);
    }

    public List<DataIngestionQueue> getItemsBySource(String sourceSystem) {
        return queueRepository.findBySourceSystem(sourceSystem);
    }

    @Transactional
    public DataIngestionQueue processItem(Long id) {
        DataIngestionQueue item = queueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Queue item not found"));
        
        item.setStatus("PROCESSING");
        queueRepository.save(item);
        
        try {
            // Process the data based on data type
            boolean success = processDataByType(item);
            
            if (success) {
                item.setStatus("COMPLETED");
                item.setProcessedAt(LocalDateTime.now());
            } else {
                item.setStatus("FAILED");
                item.setRetryCount(item.getRetryCount() + 1);
                item.setErrorMessage("Processing failed");
            }
            
        } catch (Exception e) {
            item.setStatus("FAILED");
            item.setRetryCount(item.getRetryCount() + 1);
            item.setErrorMessage(e.getMessage());
        }
        
        return queueRepository.save(item);
    }

    private boolean processDataByType(DataIngestionQueue item) {
        // Implement actual data processing logic based on data type
        // This is a placeholder
        switch (item.getDataType()) {
            case "EQUIPMENT_DATA":
                return processEquipmentData(item.getPayload());
            case "PRODUCTION_DATA":
                return processProductionData(item.getPayload());
            case "SENSOR_DATA":
                return processSensorData(item.getPayload());
            default:
                return false;
        }
    }

    private boolean processEquipmentData(Map<String, Object> payload) {
        // Placeholder for equipment data processing
        return true;
    }

    private boolean processProductionData(Map<String, Object> payload) {
        // Placeholder for production data processing
        return true;
    }

    private boolean processSensorData(Map<String, Object> payload) {
        // Placeholder for sensor data processing
        return true;
    }

    // Scheduled job to process pending items (runs every minute)
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processQueuedItems() {
        List<DataIngestionQueue> pendingItems = getPendingItems();
        
        for (DataIngestionQueue item : pendingItems) {
            try {
                processItem(item.getId());
            } catch (Exception e) {
                System.err.println("Failed to process queue item " + item.getId() + ": " + e.getMessage());
            }
        }
    }

    // Retry failed items
    @Scheduled(fixedRate = 300000) // Every 5 minutes
    @Transactional
    public void retryFailedItems() {
        List<DataIngestionQueue> failedItems = queueRepository.findFailedItemsForRetry();
        
        for (DataIngestionQueue item : failedItems) {
            try {
                processItem(item.getId());
            } catch (Exception e) {
                System.err.println("Failed to retry queue item " + item.getId() + ": " + e.getMessage());
            }
        }
    }
}
