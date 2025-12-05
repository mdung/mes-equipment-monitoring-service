package com.mes.repository;

import com.mes.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    Optional<Batch> findByBatchNumber(String batchNumber);
    List<Batch> findByProductId(Long productId);
    List<Batch> findByProductionOrderId(Long productionOrderId);
    List<Batch> findByStatus(String status);
}
