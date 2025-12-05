# Audit & Compliance System Guide

## Overview
The Audit & Compliance system provides comprehensive tracking, monitoring, and reporting capabilities for all system activities, changes, and data retention policies. This ensures full compliance with regulatory requirements and provides complete visibility into system operations.

## Features Implemented

### ✅ 1. Audit Trail for All Changes
- Automatic tracking of all CRUD operations
- User action logging with timestamps
- IP address and user agent tracking
- Session tracking
- Before/after value comparison
- Change summary generation
- Entity-specific audit history

### ✅ 2. Compliance Reporting
- Audit Trail Reports
- User Activity Reports
- Change History Reports
- Customizable date ranges
- Export capabilities (PDF, CSV, Excel ready)
- Report generation tracking
- Historical report access

### ✅ 3. Data Retention Policies
- Configurable retention periods per entity type
- Automatic data archival
- Scheduled policy execution
- Archive location configuration
- Delete after archive option
- Policy status tracking
- Last execution monitoring

### ✅ 4. Change History Tracking
- Field-level change tracking
- Old value vs new value comparison
- Change reason documentation
- Approval workflow support
- User attribution
- Timeline view
- Entity-specific history

### ✅ 5. User Activity Logs
- Login/logout tracking
- Resource access logging
- Action type categorization
- Success/failure status
- Duration tracking
- IP address logging
- Session correlation
- Activity summaries

## Database Schema

### Audit Trail Table
```sql
CREATE TABLE audit_trail (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    user_id BIGINT REFERENCES users(id),
    username VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    changes_summary TEXT,
    session_id VARCHAR(255)
);
```

### User Activity Log Table
```sql
CREATE TABLE user_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    username VARCHAR(100) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_description TEXT,
    resource_type VARCHAR(100),
    resource_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    duration_seconds INTEGER,
    status VARCHAR(20) DEFAULT 'SUCCESS',
    error_message TEXT
);
```

### Change History Table
```sql
CREATE TABLE change_history (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id BIGINT NOT NULL,
    entity_name VARCHAR(255),
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT REFERENCES users(id),
    changed_by_username VARCHAR(100) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    approval_required BOOLEAN DEFAULT false,
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_status VARCHAR(20)
);
```

### Data Retention Policy Table
```sql
CREATE TABLE data_retention_policy (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    retention_days INTEGER NOT NULL,
    archive_enabled BOOLEAN DEFAULT false,
    archive_location VARCHAR(500),
    delete_after_archive BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_execution TIMESTAMP,
    next_execution TIMESTAMP
);
```

### Compliance Report Table
```sql
CREATE TABLE compliance_report (
    id BIGSERIAL PRIMARY KEY,
    report_name VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    generated_by BIGINT REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    filters JSONB,
    total_records INTEGER,
    file_path VARCHAR(500),
    file_format VARCHAR(20),
    status VARCHAR(20) DEFAULT 'COMPLETED',
    notes TEXT
);
```

## API Endpoints

### Audit Trail
```
GET    /api/audit/entity/{entityType}/{entityId}  - Get entity audit history
GET    /api/audit/user/{userId}                   - Get user's audit records
GET    /api/audit/action/{action}                 - Get audits by action type
GET    /api/audit/entity-type/{entityType}        - Get audits by entity type
GET    /api/audit/date-range                      - Get audits by date range
GET    /api/audit/recent-count                    - Count recent audits
```

### User Activity
```
GET    /api/user-activity/user/{userId}           - Get user activities
GET    /api/user-activity/user/{userId}/range     - Get user activities in date range
GET    /api/user-activity/type/{activityType}     - Get activities by type
GET    /api/user-activity/date-range              - Get activities by date range
GET    /api/user-activity/failures                - Get recent failures
GET    /api/user-activity/summary                 - Get activity summary
```

### Change History
```
GET    /api/change-history/entity/{entityType}/{entityId}           - Get entity changes
GET    /api/change-history/entity/{entityType}/{entityId}/field/{fieldName}  - Get field changes
GET    /api/change-history/user/{userId}          - Get user's changes
GET    /api/change-history/pending-approvals      - Get pending approvals
GET    /api/change-history/pending-approvals/count - Count pending approvals
GET    /api/change-history/date-range             - Get changes by date range
PUT    /api/change-history/{id}/approve           - Approve a change
PUT    /api/change-history/{id}/reject            - Reject a change
```

### Data Retention
```
GET    /api/data-retention/policies               - Get all policies
GET    /api/data-retention/policies/active        - Get active policies
GET    /api/data-retention/policies/entity/{entityType}  - Get policy by entity
POST   /api/data-retention/policies               - Create new policy
PUT    /api/data-retention/policies/{id}          - Update policy
DELETE /api/data-retention/policies/{id}          - Delete policy
```

### Compliance Reports
```
POST   /api/compliance/reports/audit-trail        - Generate audit trail report
POST   /api/compliance/reports/user-activity      - Generate user activity report
POST   /api/compliance/reports/change-history     - Generate change history report
GET    /api/compliance/reports                    - Get all reports
GET    /api/compliance/reports/type/{reportType}  - Get reports by type
GET    /api/compliance/reports/{id}               - Get report by ID
```

## Usage Guide

### Viewing Audit Trail

1. Navigate to **Audit & Compliance** page
2. Select **Audit Trail** tab
3. Set date range filter
4. Click **Apply Filter**
5. View audit records with:
   - Timestamp
   - User who performed action
   - Action type (CREATE, UPDATE, DELETE, etc.)
   - Entity affected
   - Changes made
   - IP address

### Monitoring User Activity

1. Go to **User Activity** tab
2. Filter by date range
3. View activities including:
   - Login/logout events
   - Resource access
   - Actions performed
   - Success/failure status
   - Duration
   - IP address

### Tracking Change History

1. Select **Change History** tab
2. Apply date filters
3. Review detailed changes:
   - Entity and field changed
   - Old value → New value
   - Who made the change
   - When it was changed
   - Reason for change

### Managing Data Retention

1. Go to **Data Retention** tab
2. View existing policies
3. Configure retention periods:
   - Entity type
   - Retention days
   - Archive settings
   - Auto-delete options

### Generating Compliance Reports

1. Select **Compliance Reports** tab
2. Choose report type:
   - Audit Trail Report
   - User Activity Report
   - Change History Report
3. Set date range
4. Click generate
5. View report in history

## Automatic Audit Logging

The system automatically logs:

### Equipment Changes
- Status updates
- Configuration changes
- Maintenance records
- Performance metrics

### Production Orders
- Order creation
- Status changes
- Quantity updates
- Completion records

### User Management
- User creation/updates
- Role changes
- Permission modifications
- Password changes

### Quality Checks
- Check results
- Status updates
- Approval/rejection

### System Access
- Login attempts
- Logout events
- Failed authentication
- Session management

## Integration with Services

### Using AuditService

```java
@Autowired
private AuditService auditService;

// Log an audit entry
Map<String, Object> oldValues = Map.of("status", "IDLE");
Map<String, Object> newValues = Map.of("status", "RUNNING");

auditService.logAudit(
    "Equipment",
    equipmentId,
    "UPDATE",
    currentUser,
    oldValues,
    newValues
);
```

### Using UserActivityService

```java
@Autowired
private UserActivityService userActivityService;

// Log user activity
userActivityService.logActivity(
    currentUser,
    "VIEW",
    "Viewed equipment details",
    "Equipment",
    equipmentId
);
```

### Using ChangeHistoryService

```java
@Autowired
private ChangeHistoryService changeHistoryService;

// Record a change
changeHistoryService.recordChange(
    "Equipment",
    equipmentId,
    equipment.getName(),
    "status",
    "IDLE",
    "RUNNING",
    currentUser,
    "Scheduled maintenance completed",
    false  // requires approval
);
```

## Data Retention Execution

The system automatically executes retention policies:

- **Schedule**: Daily at 2:00 AM
- **Process**:
  1. Identify data older than retention period
  2. Archive data if enabled
  3. Delete data if configured
  4. Update policy execution timestamp

### Manual Execution

Policies can also be triggered manually through the service:

```java
@Autowired
private DataRetentionService dataRetentionService;

// Execute all due policies
dataRetentionService.executeRetentionPolicies();
```

## Compliance Report Generation

### Audit Trail Report
- Complete audit log for date range
- All entity types included
- User actions tracked
- Change summaries

### User Activity Report
- User login/logout history
- Resource access patterns
- Activity type breakdown
- Success/failure rates

### Change History Report
- Field-level changes
- Before/after values
- Change reasons
- Approval status

## Best Practices

### 1. Regular Monitoring
- Review audit trail weekly
- Monitor user activity patterns
- Check for unusual access
- Investigate failed activities

### 2. Retention Policy Management
- Set appropriate retention periods
- Enable archival for compliance
- Test restore procedures
- Document policy decisions

### 3. Change Tracking
- Require change reasons for critical updates
- Enable approval workflows for sensitive changes
- Review pending approvals regularly
- Document approval decisions

### 4. Report Generation
- Generate monthly compliance reports
- Archive reports for audit purposes
- Review trends and patterns
- Share with stakeholders

### 5. Security
- Protect audit logs from tampering
- Restrict access to compliance data
- Monitor for suspicious patterns
- Maintain backup of audit data

## Compliance Standards

The system supports compliance with:

### ISO 9001
- Quality management documentation
- Change control records
- Audit trail requirements

### FDA 21 CFR Part 11
- Electronic records
- Electronic signatures
- Audit trail requirements
- Data retention

### GDPR
- Data retention policies
- Right to erasure
- Access logging
- Data processing records

### SOX
- Financial data controls
- Change management
- Access controls
- Audit requirements

## Troubleshooting

### Audit Records Not Appearing
**Problem**: Changes not being logged

**Solutions**:
- Verify AuditService is autowired
- Check database connectivity
- Review service integration
- Check transaction management

### Reports Not Generating
**Problem**: Compliance reports fail

**Solutions**:
- Verify date range is valid
- Check user permissions
- Review database queries
- Check file system permissions

### Retention Policy Not Executing
**Problem**: Old data not being archived

**Solutions**:
- Verify policy is active
- Check next_execution date
- Review scheduled job configuration
- Check database permissions

### Performance Issues
**Problem**: Slow audit queries

**Solutions**:
- Verify indexes are created
- Optimize date range queries
- Archive old audit data
- Consider partitioning tables

## Performance Optimization

### Indexes
All critical indexes are created automatically:
- Entity type and ID
- User ID
- Timestamp
- Action type
- Session ID

### Query Optimization
- Use date range filters
- Limit result sets
- Use pagination
- Cache frequent queries

### Data Archival
- Archive old audit data
- Maintain separate archive database
- Implement data compression
- Regular cleanup jobs

## Security Considerations

### Access Control
- Audit data requires authentication
- Admin-only access to retention policies
- Role-based report access
- Secure API endpoints

### Data Protection
- Audit logs are immutable
- Encrypted at rest
- Secure transmission
- Backup and recovery

### Compliance
- Tamper-proof logging
- Complete audit trail
- Data retention compliance
- Regular audits

## Future Enhancements

1. **Real-time Alerts**
   - Suspicious activity detection
   - Compliance violation alerts
   - Threshold-based notifications

2. **Advanced Analytics**
   - User behavior analysis
   - Trend identification
   - Anomaly detection
   - Predictive compliance

3. **Enhanced Reporting**
   - Custom report templates
   - Scheduled report generation
   - Email delivery
   - Dashboard widgets

4. **Data Archival**
   - Automated archival to cloud storage
   - Compressed archive format
   - Quick restore capability
   - Archive search functionality

5. **Approval Workflows**
   - Multi-level approvals
   - Approval routing
   - Notification system
   - Approval analytics

---

**System Status**: ✅ Fully Operational
**Last Updated**: December 2025
**Version**: 1.0
**Compliance Ready**: Yes
