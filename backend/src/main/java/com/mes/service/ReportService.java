package com.mes.service;

import com.mes.model.*;
import com.mes.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.opencsv.CSVWriter;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReportTemplateRepository templateRepository;

    @Autowired
    private ScheduledReportRepository scheduledReportRepository;

    @Autowired
    private CustomReportRepository customReportRepository;

    @Autowired
    private AnalyticsService analyticsService;

    // Report Templates
    public List<ReportTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public List<ReportTemplate> getActiveTemplates() {
        return templateRepository.findByIsActive(true);
    }

    public List<ReportTemplate> getTemplatesByCategory(String category) {
        return templateRepository.findByCategory(category);
    }

    public ReportTemplate getTemplateById(Long id) {
        return templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    public ReportTemplate getTemplateByCode(String code) {
        return templateRepository.findByTemplateCode(code)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }

    @Transactional
    public ReportTemplate createTemplate(ReportTemplate template) {
        return templateRepository.save(template);
    }

    @Transactional
    public ReportTemplate updateTemplate(Long id, ReportTemplate templateDetails) {
        ReportTemplate template = getTemplateById(id);
        template.setTemplateName(templateDetails.getTemplateName());
        template.setDescription(templateDetails.getDescription());
        template.setCategory(templateDetails.getCategory());
        template.setReportType(templateDetails.getReportType());
        template.setQueryDefinition(templateDetails.getQueryDefinition());
        template.setChartConfig(templateDetails.getChartConfig());
        template.setParameters(templateDetails.getParameters());
        template.setIsActive(templateDetails.getIsActive());
        return templateRepository.save(template);
    }

    // Scheduled Reports
    public List<ScheduledReport> getAllScheduledReports() {
        return scheduledReportRepository.findAll();
    }

    public List<ScheduledReport> getActiveScheduledReports() {
        return scheduledReportRepository.findByIsActive(true);
    }

    @Transactional
    public ScheduledReport createScheduledReport(ScheduledReport scheduledReport) {
        return scheduledReportRepository.save(scheduledReport);
    }

    @Transactional
    public ScheduledReport updateScheduledReport(Long id, ScheduledReport reportDetails) {
        ScheduledReport report = scheduledReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Scheduled report not found"));
        report.setScheduleName(reportDetails.getScheduleName());
        report.setScheduleFrequency(reportDetails.getScheduleFrequency());
        report.setScheduleTime(reportDetails.getScheduleTime());
        report.setScheduleDayOfWeek(reportDetails.getScheduleDayOfWeek());
        report.setScheduleDayOfMonth(reportDetails.getScheduleDayOfMonth());
        report.setParameters(reportDetails.getParameters());
        report.setIsActive(reportDetails.getIsActive());
        return scheduledReportRepository.save(report);
    }

    @Transactional
    public void deleteScheduledReport(Long id) {
        scheduledReportRepository.deleteById(id);
    }

    // Custom Reports
    public List<CustomReport> getCustomReportsByUser(Long userId) {
        return customReportRepository.findByCreatedById(userId);
    }

    public List<CustomReport> getPublicCustomReports() {
        return customReportRepository.findByIsPublic(true);
    }

    @Transactional
    public CustomReport createCustomReport(CustomReport customReport) {
        return customReportRepository.save(customReport);
    }

    @Transactional
    public CustomReport updateCustomReport(Long id, CustomReport reportDetails) {
        CustomReport report = customReportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Custom report not found"));
        report.setReportName(reportDetails.getReportName());
        report.setDescription(reportDetails.getDescription());
        report.setDataSource(reportDetails.getDataSource());
        report.setSelectedFields(reportDetails.getSelectedFields());
        report.setFilters(reportDetails.getFilters());
        report.setGrouping(reportDetails.getGrouping());
        report.setSorting(reportDetails.getSorting());
        report.setChartType(reportDetails.getChartType());
        report.setChartConfig(reportDetails.getChartConfig());
        report.setIsPublic(reportDetails.getIsPublic());
        return customReportRepository.save(report);
    }

    @Transactional
    public void deleteCustomReport(Long id) {
        customReportRepository.deleteById(id);
    }

    // Report Generation
    public Map<String, Object> generateReport(String templateCode, LocalDateTime startDate, LocalDateTime endDate) {
        ReportTemplate template = getTemplateByCode(templateCode);
        
        Map<String, Object> result = new HashMap<>();
        result.put("template", template);
        result.put("generatedAt", LocalDateTime.now());
        result.put("startDate", startDate);
        result.put("endDate", endDate);

        // Generate data based on template code
        Object data = generateReportData(templateCode, startDate, endDate);
        result.put("data", data);

        return result;
    }

    private Object generateReportData(String templateCode, LocalDateTime startDate, LocalDateTime endDate) {
        switch (templateCode) {
            case "PROD_EFFICIENCY":
                return analyticsService.getProductionEfficiencyReport(startDate, endDate);
            case "EQUIP_UTIL":
                return analyticsService.getEquipmentUtilizationReport(startDate, endDate);
            case "DOWNTIME_ANALYSIS":
                return analyticsService.getDowntimeAnalysisReport(startDate, endDate);
            case "QUALITY_TRENDS":
                return analyticsService.getQualityTrendReport(startDate, endDate);
            default:
                return new ArrayList<>();
        }
    }

    // Export to Excel
    public byte[] exportToExcel(String templateCode, LocalDateTime startDate, LocalDateTime endDate) throws Exception {
        Map<String, Object> reportData = generateReport(templateCode, startDate, endDate);
        List<?> data = (List<?>) reportData.get("data");

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Report");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            if (!data.isEmpty()) {
                Object firstRow = data.get(0);
                if (firstRow instanceof Map) {
                    Map<?, ?> firstMap = (Map<?, ?>) firstRow;
                    List<String> headers = new ArrayList<>(firstMap.keySet().stream()
                            .map(Object::toString).collect(Collectors.toList()));

                    // Create header row
                    Row headerRow = sheet.createRow(0);
                    for (int i = 0; i < headers.size(); i++) {
                        Cell cell = headerRow.createCell(i);
                        cell.setCellValue(headers.get(i));
                        cell.setCellStyle(headerStyle);
                    }

                    // Create data rows
                    for (int i = 0; i < data.size(); i++) {
                        Row row = sheet.createRow(i + 1);
                        Map<?, ?> dataMap = (Map<?, ?>) data.get(i);
                        for (int j = 0; j < headers.size(); j++) {
                            Cell cell = row.createCell(j);
                            Object value = dataMap.get(headers.get(j));
                            if (value != null) {
                                if (value instanceof Number) {
                                    cell.setCellValue(((Number) value).doubleValue());
                                } else {
                                    cell.setCellValue(value.toString());
                                }
                            }
                        }
                    }

                    // Auto-size columns
                    for (int i = 0; i < headers.size(); i++) {
                        sheet.autoSizeColumn(i);
                    }
                }
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    // Export to CSV
    public byte[] exportToCSV(String templateCode, LocalDateTime startDate, LocalDateTime endDate) throws Exception {
        Map<String, Object> reportData = generateReport(templateCode, startDate, endDate);
        List<?> data = (List<?>) reportData.get("data");

        try (StringWriter stringWriter = new StringWriter(); 
             CSVWriter csvWriter = new CSVWriter(stringWriter)) {

            if (!data.isEmpty()) {
                Object firstRow = data.get(0);
                if (firstRow instanceof Map) {
                    Map<?, ?> firstMap = (Map<?, ?>) firstRow;
                    List<String> headers = new ArrayList<>(firstMap.keySet().stream()
                            .map(Object::toString).collect(Collectors.toList()));

                    // Write header
                    csvWriter.writeNext(headers.toArray(new String[0]));

                    // Write data rows
                    for (Object item : data) {
                        Map<?, ?> dataMap = (Map<?, ?>) item;
                        String[] row = new String[headers.size()];
                        for (int i = 0; i < headers.size(); i++) {
                            Object value = dataMap.get(headers.get(i));
                            row[i] = value != null ? value.toString() : "";
                        }
                        csvWriter.writeNext(row);
                    }
                }
            }

            return stringWriter.toString().getBytes();
        }
    }

    // Export to PDF
    public byte[] exportToPDF(String templateCode, LocalDateTime startDate, LocalDateTime endDate) throws Exception {
        Map<String, Object> reportData = generateReport(templateCode, startDate, endDate);
        List<?> data = (List<?>) reportData.get("data");
        ReportTemplate template = (ReportTemplate) reportData.get("template");

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            // Add title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph(template.getTemplateName(), titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Add date range
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Paragraph dateRange = new Paragraph(
                    "Period: " + startDate.toLocalDate() + " to " + endDate.toLocalDate(), normalFont);
            dateRange.setAlignment(Element.ALIGN_CENTER);
            dateRange.setSpacingAfter(20);
            document.add(dateRange);

            if (!data.isEmpty()) {
                Object firstRow = data.get(0);
                if (firstRow instanceof Map) {
                    Map<?, ?> firstMap = (Map<?, ?>) firstRow;
                    List<String> headers = new ArrayList<>(firstMap.keySet().stream()
                            .map(Object::toString).collect(Collectors.toList()));

                    // Create table
                    PdfPTable table = new PdfPTable(headers.size());
                    table.setWidthPercentage(100);
                    table.setSpacingBefore(10);

                    // Add headers
                    Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
                    for (String header : headers) {
                        PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                        cell.setPadding(5);
                        table.addCell(cell);
                    }

                    // Add data rows
                    for (Object item : data) {
                        Map<?, ?> dataMap = (Map<?, ?>) item;
                        for (String header : headers) {
                            Object value = dataMap.get(header);
                            table.addCell(value != null ? value.toString() : "");
                        }
                    }

                    document.add(table);
                }
            }

            document.close();
            return out.toByteArray();
        }
    }
}
