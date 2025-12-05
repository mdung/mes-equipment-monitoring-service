package com.mes.controller;

import com.mes.model.*;
import com.mes.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Report Templates
    @GetMapping("/templates")
    public ResponseEntity<List<ReportTemplate>> getAllTemplates() {
        return ResponseEntity.ok(reportService.getAllTemplates());
    }

    @GetMapping("/templates/active")
    public ResponseEntity<List<ReportTemplate>> getActiveTemplates() {
        return ResponseEntity.ok(reportService.getActiveTemplates());
    }

    @GetMapping("/templates/category/{category}")
    public ResponseEntity<List<ReportTemplate>> getTemplatesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(reportService.getTemplatesByCategory(category));
    }

    @GetMapping("/templates/{id}")
    public ResponseEntity<ReportTemplate> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getTemplateById(id));
    }

    @GetMapping("/templates/code/{code}")
    public ResponseEntity<ReportTemplate> getTemplateByCode(@PathVariable String code) {
        return ResponseEntity.ok(reportService.getTemplateByCode(code));
    }

    @PostMapping("/templates")
    public ResponseEntity<ReportTemplate> createTemplate(@RequestBody ReportTemplate template) {
        return ResponseEntity.ok(reportService.createTemplate(template));
    }

    @PutMapping("/templates/{id}")
    public ResponseEntity<ReportTemplate> updateTemplate(@PathVariable Long id, @RequestBody ReportTemplate template) {
        return ResponseEntity.ok(reportService.updateTemplate(id, template));
    }

    // Scheduled Reports
    @GetMapping("/scheduled")
    public ResponseEntity<List<ScheduledReport>> getAllScheduledReports() {
        return ResponseEntity.ok(reportService.getAllScheduledReports());
    }

    @GetMapping("/scheduled/active")
    public ResponseEntity<List<ScheduledReport>> getActiveScheduledReports() {
        return ResponseEntity.ok(reportService.getActiveScheduledReports());
    }

    @PostMapping("/scheduled")
    public ResponseEntity<ScheduledReport> createScheduledReport(@RequestBody ScheduledReport scheduledReport) {
        return ResponseEntity.ok(reportService.createScheduledReport(scheduledReport));
    }

    @PutMapping("/scheduled/{id}")
    public ResponseEntity<ScheduledReport> updateScheduledReport(@PathVariable Long id, @RequestBody ScheduledReport scheduledReport) {
        return ResponseEntity.ok(reportService.updateScheduledReport(id, scheduledReport));
    }

    @DeleteMapping("/scheduled/{id}")
    public ResponseEntity<Void> deleteScheduledReport(@PathVariable Long id) {
        reportService.deleteScheduledReport(id);
        return ResponseEntity.ok().build();
    }

    // Custom Reports
    @GetMapping("/custom/user/{userId}")
    public ResponseEntity<List<CustomReport>> getCustomReportsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reportService.getCustomReportsByUser(userId));
    }

    @GetMapping("/custom/public")
    public ResponseEntity<List<CustomReport>> getPublicCustomReports() {
        return ResponseEntity.ok(reportService.getPublicCustomReports());
    }

    @PostMapping("/custom")
    public ResponseEntity<CustomReport> createCustomReport(@RequestBody CustomReport customReport) {
        return ResponseEntity.ok(reportService.createCustomReport(customReport));
    }

    @PutMapping("/custom/{id}")
    public ResponseEntity<CustomReport> updateCustomReport(@PathVariable Long id, @RequestBody CustomReport customReport) {
        return ResponseEntity.ok(reportService.updateCustomReport(id, customReport));
    }

    @DeleteMapping("/custom/{id}")
    public ResponseEntity<Void> deleteCustomReport(@PathVariable Long id) {
        reportService.deleteCustomReport(id);
        return ResponseEntity.ok().build();
    }

    // Report Generation
    @GetMapping("/generate/{templateCode}")
    public ResponseEntity<Map<String, Object>> generateReport(
            @PathVariable String templateCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(reportService.generateReport(templateCode, startDate, endDate));
    }

    // Export Endpoints
    @GetMapping("/export/{templateCode}/excel")
    public ResponseEntity<byte[]> exportToExcel(
            @PathVariable String templateCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            byte[] excelData = reportService.exportToExcel(templateCode, startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDispositionFormData("attachment", templateCode + "_" + System.currentTimeMillis() + ".xlsx");
            
            return new ResponseEntity<>(excelData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/{templateCode}/csv")
    public ResponseEntity<byte[]> exportToCSV(
            @PathVariable String templateCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            byte[] csvData = reportService.exportToCSV(templateCode, startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", templateCode + "_" + System.currentTimeMillis() + ".csv");
            
            return new ResponseEntity<>(csvData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/export/{templateCode}/pdf")
    public ResponseEntity<byte[]> exportToPDF(
            @PathVariable String templateCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            byte[] pdfData = reportService.exportToPDF(templateCode, startDate, endDate);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", templateCode + "_" + System.currentTimeMillis() + ".pdf");
            
            return new ResponseEntity<>(pdfData, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
