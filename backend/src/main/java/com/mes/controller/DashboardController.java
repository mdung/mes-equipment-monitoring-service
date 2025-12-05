package com.mes.controller;

import com.mes.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        return dashboardService.getDashboardStats();
    }

    @GetMapping("/equipment-status-distribution")
    public Map<String, Long> getEquipmentStatusDistribution() {
        return dashboardService.getEquipmentStatusDistribution();
    }
}
