package com.mes.service;

import com.mes.model.Batch;
import com.mes.repository.BatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class BatchService {

    @Autowired
    private BatchRepository batchRepository;

    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    public Optional<Batch> getBatchById(Long id) {
        return batchRepository.findById(id);
    }

    public Optional<Batch> getBatchByNumber(String batchNumber) {
        return batchRepository.findByBatchNumber(batchNumber);
    }

    public List<Batch> getBatchesByProduct(Long productId) {
        return batchRepository.findByProductId(productId);
    }

    public List<Batch> getBatchesByOrder(Long orderId) {
        return batchRepository.findByProductionOrderId(orderId);
    }

    public Batch createBatch(Batch batch) {
        return batchRepository.save(batch);
    }

    public Batch updateBatch(Long id, Batch batchDetails) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        batch.setQuantity(batchDetails.getQuantity());
        batch.setManufacturingDate(batchDetails.getManufacturingDate());
        batch.setExpiryDate(batchDetails.getExpiryDate());
        batch.setStatus(batchDetails.getStatus());
        batch.setQualityStatus(batchDetails.getQualityStatus());
        batch.setNotes(batchDetails.getNotes());

        return batchRepository.save(batch);
    }

    public Batch updateBatchStatus(Long id, String status, String qualityStatus) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        batch.setStatus(status);
        if (qualityStatus != null) {
            batch.setQualityStatus(qualityStatus);
        }

        return batchRepository.save(batch);
    }
}
