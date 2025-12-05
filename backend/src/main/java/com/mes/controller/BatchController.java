package com.mes.controller;

import com.mes.model.Batch;
import com.mes.service.BatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/batches")
@CrossOrigin(origins = "*")
public class BatchController {

    @Autowired
    private BatchService batchService;

    @GetMapping
    public List<Batch> getAllBatches() {
        return batchService.getAllBatches();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Batch> getBatchById(@PathVariable Long id) {
        return batchService.getBatchById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{batchNumber}")
    public ResponseEntity<Batch> getBatchByNumber(@PathVariable String batchNumber) {
        return batchService.getBatchByNumber(batchNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public List<Batch> getBatchesByProduct(@PathVariable Long productId) {
        return batchService.getBatchesByProduct(productId);
    }

    @GetMapping("/order/{orderId}")
    public List<Batch> getBatchesByOrder(@PathVariable Long orderId) {
        return batchService.getBatchesByOrder(orderId);
    }

    @PostMapping
    public Batch createBatch(@RequestBody Batch batch) {
        return batchService.createBatch(batch);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Batch> updateBatch(@PathVariable Long id, @RequestBody Batch batch) {
        try {
            return ResponseEntity.ok(batchService.updateBatch(id, batch));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Batch> updateBatchStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            String qualityStatus = request.get("qualityStatus");
            return ResponseEntity.ok(batchService.updateBatchStatus(id, status, qualityStatus));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
