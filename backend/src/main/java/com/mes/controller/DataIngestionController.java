package com.mes.controller;

import com.mes.model.DataIngestionQueue;
import com.mes.service.ApiKeyService;
import com.mes.service.DataIngestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data-ingestion")
@CrossOrigin(origins = "*")
public class DataIngestionController {

    @Autowired
    private DataIngestionService dataIngestionService;

    @Autowired
    private ApiKeyService apiKeyService;

    // Public endpoint for external systems to push data
    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingestData(
            @RequestHeader("X-API-Key") String apiKey,
            @RequestBody Map<String, Object> request) {
        
        try {
            // Validate API key
            apiKeyService.validateApiKey(apiKey);
            apiKeyService.recordApiKeyUsage(apiKey);
            
            String sourceSystem = (String) request.get("sourceSystem");
            String dataType = (String) request.get("dataType");
            Map<String, Object> payload = (Map<String, Object>) request.get("payload");
            Integer priority = (Integer) request.getOrDefault("priority", 5);
            
            DataIngestionQueue item = dataIngestionService.queueData(sourceSystem, dataType, payload, priority);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "queueId", item.getId(),
                "status", item.getStatus(),
                "message", "Data queued for processing"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    // Admin endpoints
    @GetMapping("/queue")
    public ResponseEntity<List<DataIngestionQueue>> getPendingItems() {
        return ResponseEntity.ok(dataIngestionService.getPendingItems());
    }

    @GetMapping("/queue/status/{status}")
    public ResponseEntity<List<DataIngestionQueue>> getItemsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(dataIngestionService.getItemsByStatus(status));
    }

    @GetMapping("/queue/source/{sourceSystem}")
    public ResponseEntity<List<DataIngestionQueue>> getItemsBySource(@PathVariable String sourceSystem) {
        return ResponseEntity.ok(dataIngestionService.getItemsBySource(sourceSystem));
    }

    @PostMapping("/queue/{id}/process")
    public ResponseEntity<DataIngestionQueue> processItem(@PathVariable Long id) {
        return ResponseEntity.ok(dataIngestionService.processItem(id));
    }
}
