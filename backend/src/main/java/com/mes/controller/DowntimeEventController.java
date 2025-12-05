package com.mes.controller;

import com.mes.model.DowntimeEvent;
import com.mes.service.DowntimeEventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/downtime")
@CrossOrigin(origins = "*")
public class DowntimeEventController {

    @Autowired
    private DowntimeEventService downtimeEventService;

    @GetMapping("/equipment/{equipmentId}")
    public List<DowntimeEvent> getDowntimeByEquipment(@PathVariable Long equipmentId) {
        return downtimeEventService.getDowntimeByEquipmentId(equipmentId);
    }

    @PostMapping
    public DowntimeEvent recordDowntime(@RequestBody DowntimeEvent event) {
        return downtimeEventService.recordDowntime(event);
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<DowntimeEvent> endDowntime(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(downtimeEventService.endDowntime(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
