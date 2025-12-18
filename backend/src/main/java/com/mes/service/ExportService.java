package com.mes.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.opencsv.CSVWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    public byte[] exportToExcel(List<?> data, String sheetName) throws Exception {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("No data to export");
        }

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet(sheetName);

        // Create header style
        CellStyle headerStyle = workbook.createCellStyle();
        org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Get fields from first object
        Object firstObject = data.get(0);
        Field[] fields = firstObject.getClass().getDeclaredFields();

        // Create header row
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < fields.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(formatFieldName(fields[i].getName()));
            cell.setCellStyle(headerStyle);
        }

        // Create data rows
        int rowNum = 1;
        for (Object obj : data) {
            Row row = sheet.createRow(rowNum++);
            for (int i = 0; i < fields.length; i++) {
                fields[i].setAccessible(true);
                Object value = fields[i].get(obj);
                Cell cell = row.createCell(i);
                setCellValue(cell, value);
            }
        }

        // Auto-size columns
        for (int i = 0; i < fields.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }

    public byte[] exportToCSV(List<?> data) throws Exception {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("No data to export");
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8));

        // Get fields from first object
        Object firstObject = data.get(0);
        Field[] fields = firstObject.getClass().getDeclaredFields();

        // Write header
        String[] header = new String[fields.length];
        for (int i = 0; i < fields.length; i++) {
            header[i] = formatFieldName(fields[i].getName());
        }
        writer.writeNext(header);

        // Write data
        for (Object obj : data) {
            String[] row = new String[fields.length];
            for (int i = 0; i < fields.length; i++) {
                fields[i].setAccessible(true);
                Object value = fields[i].get(obj);
                row[i] = value != null ? value.toString() : "";
            }
            writer.writeNext(row);
        }

        writer.close();
        return outputStream.toByteArray();
    }

    public byte[] exportToPDF(List<?> data, String title) throws Exception {
        if (data == null || data.isEmpty()) {
            throw new IllegalArgumentException("No data to export");
        }

        Document document = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Add title
        com.itextpdf.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.BLACK);
        Paragraph titleParagraph = new Paragraph(title, titleFont);
        titleParagraph.setAlignment(Element.ALIGN_CENTER);
        titleParagraph.setSpacingAfter(20);
        document.add(titleParagraph);

        // Add generation date
        com.itextpdf.text.Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 10, BaseColor.GRAY);
        Paragraph dateParagraph = new Paragraph("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), dateFont);
        dateParagraph.setAlignment(Element.ALIGN_RIGHT);
        dateParagraph.setSpacingAfter(20);
        document.add(dateParagraph);

        // Get fields from first object
        Object firstObject = data.get(0);
        Field[] fields = firstObject.getClass().getDeclaredFields();

        // Create table
        PdfPTable table = new PdfPTable(fields.length);
        table.setWidthPercentage(100);

        // Add header
        com.itextpdf.text.Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE);
        for (Field field : fields) {
            PdfPCell cell = new PdfPCell(new Phrase(formatFieldName(field.getName()), headerFont));
            cell.setBackgroundColor(BaseColor.DARK_GRAY);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            cell.setPadding(5);
            table.addCell(cell);
        }

        // Add data
        com.itextpdf.text.Font dataFont = FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK);
        for (Object obj : data) {
            for (Field field : fields) {
                field.setAccessible(true);
                Object value = field.get(obj);
                PdfPCell cell = new PdfPCell(new Phrase(value != null ? value.toString() : "", dataFont));
                cell.setPadding(5);
                table.addCell(cell);
            }
        }

        document.add(table);
        document.close();

        return outputStream.toByteArray();
    }

    private String formatFieldName(String fieldName) {
        // Convert camelCase to Title Case
        return fieldName.replaceAll("([A-Z])", " $1")
                .replaceAll("^.", String.valueOf(Character.toUpperCase(fieldName.charAt(0))))
                .trim();
    }

    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else if (value instanceof LocalDateTime) {
            cell.setCellValue(((LocalDateTime) value).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        } else if (value instanceof LocalDate) {
            cell.setCellValue(((LocalDate) value).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
        } else {
            cell.setCellValue(value.toString());
        }
    }
}
