package com.mes.controller;

import com.mes.dto.*;
import com.mes.service.AnalyticsService;
import com.mes.service.ExportService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private ExportService exportService;

    @GetMapping("/historical-data/{equipmentId}")
    public ResponseEntity<List<HistoricalDataPoint>> getHistoricalData(
            @PathVariable Long equipmentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<HistoricalDataPoint> data = analyticsService.getHistoricalData(equipmentId, startDate, endDate);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/production-efficiency")
    public ResponseEntity<List<ProductionEfficiencyReport>> getProductionEfficiencyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<ProductionEfficiencyReport> report = analyticsService.getProductionEfficiencyReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/equipment-utilization")
    public ResponseEntity<List<EquipmentUtilizationReport>> getEquipmentUtilizationReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<EquipmentUtilizationReport> report = analyticsService.getEquipmentUtilizationReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/downtime-analysis")
    public ResponseEntity<List<DowntimeAnalysisReport>> getDowntimeAnalysisReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<DowntimeAnalysisReport> report = analyticsService.getDowntimeAnalysisReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/quality-trends")
    public ResponseEntity<List<QualityTrendReport>> getQualityTrendReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<QualityTrendReport> report = analyticsService.getQualityTrendReport(startDate, endDate);
        return ResponseEntity.ok(report);
    }

    // Export endpoints
    @GetMapping("/export/production-efficiency/excel")
    public ResponseEntity<byte[]> exportProductionEfficiencyToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            List<ProductionEfficiencyReport> data = analyticsService.getProductionEfficiencyReport(startDate, endDate);
            byte[] excelData = exportService.exportToExcel(data, "Production Efficiency");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "production-efficiency-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".xlsx");
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/production-efficiency/csv")
    public ResponseEntity<byte[]> exportProductionEfficiencyToCSV(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            List<ProductionEfficiencyReport> data = analyticsService.getProductionEfficiencyReport(startDate, endDate);
            byte[] csvData = exportService.exportToCSV(data);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "production-efficiency-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".csv");
            
            return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/production-efficiency/pdf")
    public ResponseEntity<byte[]> exportProductionEfficiencyToPDF(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            List<ProductionEfficiencyReport> data = analyticsService.getProductionEfficiencyReport(startDate, endDate);
            byte[] pdfData = exportService.exportToPDF(data, "Production Efficiency Report");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "production-efficiency-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".pdf");
            
            return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/equipment-utilization/excel")
    public ResponseEntity<byte[]> exportEquipmentUtilizationToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            List<EquipmentUtilizationReport> data = analyticsService.getEquipmentUtilizationReport(startDate, endDate);
            byte[] excelData = exportService.exportToExcel(data, "Equipment Utilization");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "equipment-utilization-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".xlsx");
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/downtime-analysis/excel")
    public ResponseEntity<byte[]> exportDowntimeAnalysisToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            List<DowntimeAnalysisReport> data = analyticsService.getDowntimeAnalysisReport(startDate, endDate);
            byte[] excelData = exportService.exportToExcel(data, "Downtime Analysis");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "downtime-analysis-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".xlsx");
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/quality-trends/excel")
    public ResponseEntity<byte[]> exportQualityTrendsToExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        try {
            List<QualityTrendReport> data = analyticsService.getQualityTrendReport(startDate, endDate);
            byte[] excelData = exportService.exportToExcel(data, "Quality Trends");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", "quality-trends-" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")) + ".xlsx");
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
