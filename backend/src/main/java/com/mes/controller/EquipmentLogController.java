package com.mes.controller;

import com.mes.model.EquipmentLog;
import com.mes.service.EquipmentLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/equipment-logs")
@CrossOrigin(origins = "*")
public class EquipmentLogController {

    @Autowired
    private EquipmentLogService equipmentLogService;

    @GetMapping("/equipment/{equipmentId}")
    public List<EquipmentLog> getLogsByEquipment(@PathVariable Long equipmentId) {
        return equipmentLogService.getLogsByEquipmentId(equipmentId);
    }

    @GetMapping("/equipment/{equipmentId}/latest")
    public ResponseEntity<EquipmentLog> getLatestLog(@PathVariable Long equipmentId) {
        return equipmentLogService.getLatestLog(equipmentId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public EquipmentLog createLog(@RequestBody EquipmentLog log) {
        return equipmentLogService.createLog(log);
    }
}
