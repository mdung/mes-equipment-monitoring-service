# Alerts & Notifications System Guide

## Overview
The Alerts & Notifications system provides comprehensive monitoring and alerting capabilities for the MES Pro application. It includes real-time alerts, configurable rules, email notifications, and alert management workflows.

## Features Implemented

### ✅ 1. Alert History & Management
- View all triggered alerts with detailed information
- Filter alerts by status (unacknowledged, unresolved)
- Acknowledge alerts to indicate awareness
- Resolve alerts to mark them as handled
- Track who acknowledged/resolved each alert
- Add notes to alerts for documentation

### ✅ 2. Alert Rules Configuration
- Create custom alert rules with conditions
- Configure rule types:
  - HIGH_TEMPERATURE
  - HIGH_VIBRATION
  - EQUIPMENT_DOWN
  - LOW_STOCK
  - QUALITY_FAILURE
- Set severity levels (CRITICAL, HIGH, MEDIUM, LOW)
- Define conditions (field, operator, value)
- Enable/disable rules dynamically

### ✅ 3. Multi-Channel Notifications
- **WebSocket**: Real-time browser notifications
- **Email**: Automated email alerts (configurable)
- **SMS**: SMS notifications (infrastructure ready)
- Configure notification preferences per rule

### ✅ 4. Real-time Monitoring Integration
- Automatic alert triggering based on equipment metrics
- Temperature threshold monitoring (>85°C)
- Vibration threshold monitoring (>8.0 mm/s)
- Equipment status monitoring (DOWN state)
- Alerts stored in database for history

### ✅ 5. Alert Escalation Infrastructure
- Database schema for escalation rules
- Support for multi-level escalations
- Time-based escalation delays
- User and role-based escalation targets

## Database Schema

### Alert Rules Table
```sql
CREATE TABLE alert_rules (
    id BIGSERIAL PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    condition_field VARCHAR(100),
    condition_operator VARCHAR(20),
    condition_value DECIMAL(10, 2),
    equipment_id BIGINT REFERENCES equipment(id),
    is_active BOOLEAN DEFAULT true,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    notification_websocket BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Alert History Table
```sql
CREATE TABLE alert_history (
    id BIGSERIAL PRIMARY KEY,
    alert_rule_id BIGINT REFERENCES alert_rules(id),
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    equipment_id BIGINT REFERENCES equipment(id),
    equipment_name VARCHAR(255),
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by VARCHAR(100),
    acknowledged_at TIMESTAMP,
    resolved BOOLEAN DEFAULT false,
    resolved_by VARCHAR(100),
    resolved_at TIMESTAMP,
    notes TEXT
);
```

## API Endpoints

### Alert History Management
```
GET    /api/alerts                    - Get all alerts
GET    /api/alerts/unacknowledged     - Get unacknowledged alerts
GET    /api/alerts/unresolved         - Get unresolved alerts
PUT    /api/alerts/{id}/acknowledge   - Acknowledge an alert
PUT    /api/alerts/{id}/resolve       - Resolve an alert
```

### Alert Rules Management
```
GET    /api/alerts/rules              - Get all alert rules
GET    /api/alerts/rules/active       - Get active alert rules
POST   /api/alerts/rules              - Create new alert rule
PUT    /api/alerts/rules/{id}         - Update alert rule
DELETE /api/alerts/rules/{id}         - Delete alert rule
```

## Frontend Components

### Alert Management Page (`/alerts`)
- **Alert History Tab**: View and manage triggered alerts
- **Alert Rules Tab**: Configure and manage alert rules
- Real-time updates via WebSocket
- Acknowledge and resolve workflows
- Create new alert rules with modal form

### Alert Notifications Component
- Toast notifications for real-time alerts
- Displays alert severity with color coding
- Auto-dismiss after 10 seconds
- Click to dismiss manually

## Usage Guide

### Creating an Alert Rule

1. Navigate to **Alert Management** page
2. Click on **Alert Rules** tab
3. Click **Add Rule** button
4. Fill in the form:
   - **Rule Name**: Descriptive name for the rule
   - **Rule Type**: Select alert type
   - **Severity**: Choose severity level
   - **Condition**: Define the trigger condition
     - Field (temperature, vibration, output)
     - Operator (GT, LT, EQ, GTE, LTE)
     - Value (threshold value)
   - **Notification Methods**: Select channels
     - Email Notification
     - SMS Notification
     - Web Notification
5. Click **Create Rule**

### Managing Alerts

1. Navigate to **Alert Management** page
2. View alerts in **Alert History** tab
3. For unacknowledged alerts:
   - Click **Acknowledge** to mark as seen
   - Adds your username and timestamp
4. For acknowledged alerts:
   - Click **Resolve** to mark as handled
   - Adds resolution timestamp

### Email Configuration

To enable email notifications, update `application.properties`:

```properties
# Enable email notifications
mes.notification.email.enabled=true
mes.notification.email.from=alerts@yourcompany.com

# SMTP Configuration (Gmail example)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in the configuration

### SMS Configuration (Future Enhancement)

The infrastructure is ready for SMS notifications. To implement:

1. Choose an SMS provider (Twilio, AWS SNS, etc.)
2. Add provider SDK to `pom.xml`
3. Implement SMS service in `EmailNotificationService` or create separate `SmsNotificationService`
4. Configure provider credentials in `application.properties`

## Alert Severity Levels

- **CRITICAL**: Immediate action required, system-critical issues
- **HIGH**: Important issues requiring prompt attention
- **MEDIUM**: Notable issues that should be addressed
- **LOW**: Informational alerts for awareness

## Alert Types

- **HIGH_TEMPERATURE**: Equipment temperature exceeds threshold
- **HIGH_VIBRATION**: Equipment vibration exceeds safe levels
- **EQUIPMENT_DOWN**: Equipment is in DOWN status
- **LOW_STOCK**: Material inventory below minimum level
- **QUALITY_FAILURE**: Quality check failures detected
- **PRODUCTION_DELAY**: Production orders behind schedule

## Real-time Monitoring

The system automatically monitors equipment metrics every 5 seconds:

- **Temperature Threshold**: Alerts when > 85°C
- **Vibration Threshold**: Alerts when > 8.0 mm/s
- **Equipment Status**: Alerts when status is DOWN

Alerts are:
1. Saved to database (alert_history)
2. Sent via WebSocket to connected clients
3. Sent via email if configured and severity is CRITICAL/ERROR

## Alert Workflow

```
1. Condition Met → Alert Triggered
2. Alert Created in Database
3. Notifications Sent (WebSocket, Email, SMS)
4. User Acknowledges Alert
5. User Investigates Issue
6. User Resolves Alert
7. Alert Marked as Resolved
```

## Best Practices

1. **Set Appropriate Thresholds**: Configure alert rules based on actual equipment specifications
2. **Use Severity Wisely**: Reserve CRITICAL for truly urgent issues
3. **Acknowledge Promptly**: Acknowledge alerts to show awareness
4. **Document Resolutions**: Add notes when resolving alerts
5. **Review Alert History**: Regularly review patterns to prevent recurring issues
6. **Test Notifications**: Verify email/SMS delivery before relying on them
7. **Manage Active Rules**: Disable rules that generate too many false positives

## Troubleshooting

### Alerts Not Appearing
- Check if alert rules are active (`is_active = true`)
- Verify WebSocket connection is established
- Check browser console for errors

### Email Notifications Not Sending
- Verify `mes.notification.email.enabled=true`
- Check SMTP configuration
- Review application logs for email errors
- Test SMTP credentials separately

### Too Many Alerts
- Adjust threshold values in alert rules
- Increase condition values to reduce sensitivity
- Temporarily disable noisy rules
- Review equipment baseline metrics

## Future Enhancements

1. **Alert Escalation**: Automatic escalation to higher levels if not acknowledged
2. **SMS Integration**: Complete SMS notification implementation
3. **Alert Grouping**: Group similar alerts to reduce noise
4. **Custom Alert Templates**: User-defined alert message templates
5. **Alert Analytics**: Dashboard showing alert trends and patterns
6. **Quiet Hours**: Suppress non-critical alerts during specified hours
7. **Alert Routing**: Route alerts to specific users/teams based on equipment
8. **Mobile App**: Push notifications to mobile devices

## Technical Details

### Backend Components
- `AlertService.java`: Core alert management logic
- `AlertController.java`: REST API endpoints
- `EmailNotificationService.java`: Email notification handling
- `RealtimeMonitoringService.java`: Automatic alert triggering
- `AlertHistory.java`: Alert history entity
- `AlertRule.java`: Alert rule configuration entity

### Frontend Components
- `AlertManagement.jsx`: Main alert management page
- `AlertNotifications.jsx`: Real-time notification display
- `websocket.js`: WebSocket connection management

### Database Tables
- `alert_rules`: Alert rule configurations
- `alert_history`: Historical alert records
- `alert_escalations`: Escalation rules (ready for implementation)
- `alert_notifications`: Notification delivery log
- `notification_preferences`: User notification preferences

## Support

For issues or questions:
1. Check application logs: `backend/logs/`
2. Review browser console for frontend errors
3. Verify database connectivity
4. Check WebSocket connection status
5. Review email server logs if email issues

---

**System Status**: ✅ Fully Operational
**Last Updated**: December 2025
**Version**: 1.0
