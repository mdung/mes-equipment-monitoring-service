package com.mes.controller;

import com.mes.model.QualityCheck;
import com.mes.service.QualityCheckService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/quality")
@CrossOrigin(origins = "*")
public class QualityCheckController {

    @Autowired
    private QualityCheckService qualityCheckService;

    @GetMapping("/order/{orderId}")
    public List<QualityCheck> getChecksByOrder(@PathVariable Long orderId) {
        return qualityCheckService.getChecksByOrderId(orderId);
    }

    @PostMapping
    public QualityCheck recordCheck(@RequestBody QualityCheck check) {
        return qualityCheckService.recordCheck(check);
    }
}
