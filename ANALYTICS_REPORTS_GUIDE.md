# Analytics & Reports Guide

## Overview

The MES application now includes comprehensive analytics and reporting capabilities with historical data analysis, multiple report types, and export functionality in Excel, CSV, and PDF formats.

## Features Implemented

### 1. **Historical Data Analysis**
- Equipment sensor data over time
- Temperature, vibration, and output trends
- Custom date range queries
- Time-series data visualization

### 2. **Production Efficiency Reports**
- Order completion rates
- Production duration analysis
- Units per hour calculation
- Target vs actual comparison
- Status tracking

### 3. **Equipment Utilization Reports**
- Running time analysis
- Idle time tracking
- Downtime monitoring
- Maintenance time
- Utilization and availability rates

### 4. **Downtime Analysis**
- Downtime by reason code
- Occurrence frequency
- Average downtime duration
- Percentage of total downtime
- Pareto analysis

### 5. **Quality Trends**
- Daily quality metrics
- Pass/reject rates over time
- Quality trend analysis
- Total checks tracking

### 6. **Export Capabilities**
- Excel (.xlsx) export
- CSV export
- PDF export with formatting
- Automatic file naming with timestamps

## API Endpoints

### Analytics Endpoints

#### Historical Data
```http
GET /api/analytics/historical-data/{equipmentId}
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

**Response**:
```json
[
  {
    "timestamp": "2025-12-03T10:30:00",
    "metric": "temperature",
    "value": 75.5,
    "unit": "°C"
  }
]
```

#### Production Efficiency
```http
GET /api/analytics/production-efficiency
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

**Response**:
```json
[
  {
    "orderId": 1,
    "orderNumber": "PO-001",
    "productName": "Widget A",
    "targetQuantity": 1000,
    "producedQuantity": 950,
    "completionRate": 95.0,
    "durationMinutes": 480,
    "unitsPerHour": 118.75,
    "status": "COMPLETED"
  }
]
```

#### Equipment Utilization
```http
GET /api/analytics/equipment-utilization
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

**Response**:
```json
[
  {
    "equipmentId": 1,
    "equipmentName": "CNC Machine 1",
    "equipmentCode": "CNC-001",
    "totalMinutes": 43200,
    "runningMinutes": 32400,
    "idleMinutes": 8640,
    "downMinutes": 1440,
    "maintenanceMinutes": 720,
    "utilizationRate": 75.0,
    "availabilityRate": 96.67
  }
]
```

#### Downtime Analysis
```http
GET /api/analytics/downtime-analysis
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

**Response**:
```json
[
  {
    "reasonCode": "MECHANICAL_FAILURE",
    "occurrences": 5,
    "totalMinutes": 720,
    "averageMinutes": 144.0,
    "percentageOfTotal": 45.0
  }
]
```

#### Quality Trends
```http
GET /api/analytics/quality-trends
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

**Response**:
```json
[
  {
    "date": "2025-12-03",
    "totalChecks": 10,
    "totalPassed": 950,
    "totalRejected": 50,
    "passRate": 95.0,
    "rejectRate": 5.0
  }
]
```

### Export Endpoints

#### Export Production Efficiency

**Excel**:
```http
GET /api/analytics/export/production-efficiency/excel
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

**CSV**:
```http
GET /api/analytics/export/production-efficiency/csv
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

**PDF**:
```http
GET /api/analytics/export/production-efficiency/pdf
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

#### Export Equipment Utilization

```http
GET /api/analytics/export/equipment-utilization/excel
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

#### Export Downtime Analysis

```http
GET /api/analytics/export/downtime-analysis/excel
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

#### Export Quality Trends

```http
GET /api/analytics/export/quality-trends/excel
  ?startDate=2025-12-01T00:00:00
  &endDate=2025-12-31T23:59:59
```

## Frontend Usage

### Reports Page

Navigate to `/reports` to access the Analytics & Reports page.

#### Features:
1. **Report Type Selection** - Choose from 4 report types
2. **Date Range Picker** - Select start and end dates
3. **Generate Report** - View data in table format
4. **Export Options** - Download as Excel, CSV, or PDF

#### Using the Reports Page:

1. **Select Report Type**:
   - Click on one of the report type cards
   - Options: Production Efficiency, Equipment Utilization, Downtime Analysis, Quality Trends

2. **Set Date Range**:
   - Select start date and time
   - Select end date and time
   - Ensure end date is after start date

3. **Generate Report**:
   - Click "Generate Report" button
   - Data will be displayed in a table
   - Loading indicator shows progress

4. **Export Report**:
   - After generating, export buttons appear
   - Click "Export Excel" for .xlsx file
   - Click "Export CSV" for .csv file
   - Click "Export PDF" for .pdf file
   - File downloads automatically

## Report Types Explained

### 1. Production Efficiency Report

**Purpose**: Analyze production order performance

**Metrics**:
- Order details (number, product name)
- Target vs produced quantities
- Completion rate (%)
- Duration in minutes
- Units per hour
- Order status

**Use Cases**:
- Identify slow-performing orders
- Calculate production rates
- Track order completion
- Optimize production planning

### 2. Equipment Utilization Report

**Purpose**: Analyze equipment usage and availability

**Metrics**:
- Equipment identification
- Total time period
- Running time
- Idle time
- Downtime
- Maintenance time
- Utilization rate (%)
- Availability rate (%)

**Use Cases**:
- Identify underutilized equipment
- Plan maintenance schedules
- Optimize equipment allocation
- Calculate ROI

### 3. Downtime Analysis Report

**Purpose**: Analyze equipment downtime by reason

**Metrics**:
- Reason code
- Number of occurrences
- Total downtime minutes
- Average downtime per occurrence
- Percentage of total downtime

**Use Cases**:
- Identify most common failure reasons
- Prioritize maintenance efforts
- Reduce downtime
- Improve reliability

### 4. Quality Trends Report

**Purpose**: Track quality metrics over time

**Metrics**:
- Date
- Total quality checks
- Total passed units
- Total rejected units
- Pass rate (%)
- Reject rate (%)

**Use Cases**:
- Monitor quality improvements
- Identify quality issues
- Track quality goals
- Compliance reporting

## Export Formats

### Excel (.xlsx)

**Features**:
- Formatted headers with bold font
- Auto-sized columns
- Gray header background
- Professional appearance
- Supports formulas and charts

**Best For**:
- Further analysis in Excel
- Creating charts and graphs
- Sharing with stakeholders
- Long-term storage

### CSV (.csv)

**Features**:
- Plain text format
- Comma-separated values
- Universal compatibility
- Small file size
- Easy to import

**Best For**:
- Data import to other systems
- Database imports
- Scripting and automation
- Simple data exchange

### PDF (.pdf)

**Features**:
- Professional formatting
- Report title and date
- Formatted table with headers
- Read-only format
- Print-ready

**Best For**:
- Formal reports
- Presentations
- Archiving
- Sharing with management
- Printing

## Date Range Queries

### Supported Formats

The API accepts ISO 8601 date-time format:
```
YYYY-MM-DDTHH:mm:ss
```

Example:
```
2025-12-01T00:00:00
```

### Common Date Ranges

**Last 7 Days**:
```javascript
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 7);
```

**Last 30 Days**:
```javascript
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);
```

**Current Month**:
```javascript
const now = new Date();
const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
```

**Last Month**:
```javascript
const now = new Date();
const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
```

## Testing

### Test Production Efficiency Report

1. Create production orders with different statuses
2. Start and complete some orders
3. Navigate to Reports page
4. Select "Production Efficiency"
5. Set date range to include your orders
6. Click "Generate Report"
7. Verify data is displayed
8. Export to Excel/CSV/PDF

### Test Equipment Utilization Report

1. Ensure equipment exists with logs
2. Navigate to Reports page
3. Select "Equipment Utilization"
4. Set date range
5. Generate and verify report

### Test Downtime Analysis Report

1. Create downtime events with reason codes
2. Navigate to Reports page
3. Select "Downtime Analysis"
4. Generate report
5. Verify grouping by reason code

### Test Quality Trends Report

1. Record quality checks for orders
2. Navigate to Reports page
3. Select "Quality Trends"
4. Generate report
5. Verify daily aggregation

## Performance Considerations

### Backend
- Reports are generated on-demand
- Large date ranges may take longer
- Consider pagination for very large datasets
- Database indexes improve query performance

### Frontend
- Reports load asynchronously
- Loading indicators show progress
- Export happens in background
- Large exports may take time

## Security

### Access Control
- All analytics endpoints require authentication
- Consider role-based access for sensitive reports
- Audit report generation and exports

### Data Privacy
- Reports may contain sensitive data
- Implement data masking if needed
- Control export permissions
- Log all report access

## Troubleshooting

### No Data in Report

**Causes**:
- No data in selected date range
- Incorrect date format
- Database empty

**Solutions**:
- Verify date range
- Check data exists in database
- Try wider date range

### Export Fails

**Causes**:
- Large dataset
- Server timeout
- Missing dependencies

**Solutions**:
- Reduce date range
- Check server logs
- Verify export libraries installed

### Slow Report Generation

**Causes**:
- Large date range
- Many records
- Complex calculations

**Solutions**:
- Reduce date range
- Add database indexes
- Optimize queries
- Consider caching

## Dependencies

### Backend (pom.xml)

```xml
<!-- Excel Export -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.5</version>
</dependency>

<!-- CSV Export -->
<dependency>
    <groupId>com.opencsv</groupId>
    <artifactId>opencsv</artifactId>
    <version>5.9</version>
</dependency>

<!-- PDF Export -->
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itextpdf</artifactId>
    <version>5.5.13.3</version>
</dependency>
```

## Future Enhancements

1. **Scheduled Reports**
   - Email reports automatically
   - Daily/weekly/monthly schedules
   - Report subscriptions

2. **Custom Reports**
   - User-defined metrics
   - Custom calculations
   - Report templates

3. **Data Visualization**
   - Interactive charts
   - Trend lines
   - Comparative analysis

4. **Advanced Analytics**
   - Predictive analytics
   - Machine learning insights
   - Anomaly detection

5. **Report Sharing**
   - Share via email
   - Generate public links
   - Collaborative reports

## Best Practices

1. **Date Ranges**
   - Use reasonable date ranges
   - Avoid very large ranges
   - Consider data volume

2. **Export Formats**
   - Use Excel for analysis
   - Use CSV for imports
   - Use PDF for sharing

3. **Performance**
   - Generate reports during off-peak hours
   - Cache frequently accessed reports
   - Archive old reports

4. **Data Quality**
   - Ensure data is complete
   - Validate calculations
   - Review reports regularly

## Success Criteria

✅ All report types generate successfully
✅ Date range filtering works correctly
✅ Export to Excel, CSV, and PDF works
✅ Reports display data accurately
✅ Performance is acceptable
✅ UI is intuitive and user-friendly
✅ Error handling is robust

Analytics & Reporting is fully operational! 📊
