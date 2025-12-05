# Alerts & Notifications - Quick Start Guide

## 🚀 Getting Started

This guide will help you quickly test and use the Alerts & Notifications system.

## Prerequisites

- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5173`
- PostgreSQL database running
- User account with login credentials

## Step 1: Access Alert Management

1. Login to the application
2. Look for **Alert Management** in the left sidebar (with ⚠️ icon)
3. Click to open the Alert Management page

## Step 2: View Alert History

The **Alert History** tab shows all triggered alerts:

- **Red Triangle Icon**: Unacknowledged alert
- **Blue Clock Icon**: Acknowledged but not resolved
- **Green Check Icon**: Resolved alert

### Alert Information Displayed:
- Alert title and severity badge
- Alert message
- Equipment name
- Triggered timestamp
- Acknowledgment/resolution details

### Actions Available:
- **Acknowledge**: Mark alert as seen (adds your username and timestamp)
- **Resolve**: Mark alert as handled (only available after acknowledgment)

## Step 3: Create Your First Alert Rule

1. Click on the **Alert Rules** tab
2. Click the **Add Rule** button
3. Fill in the form:

### Example: High Temperature Alert
```
Rule Name: Critical Temperature Warning
Rule Type: HIGH_TEMPERATURE
Severity: HIGH
Field: temperature
Operator: Greater Than
Value: 85
Notification Methods:
  ☑ Email Notification
  ☐ SMS Notification
  ☑ Web Notification
```

4. Click **Create Rule**

## Step 4: Test Real-time Alerts

The system automatically monitors equipment every 5 seconds. Alerts will trigger when:

### Temperature Alert
- Equipment temperature > 85°C
- Severity: WARNING
- Notification: Toast appears in top-right corner

### Vibration Alert
- Equipment vibration > 8.0 mm/s
- Severity: WARNING
- Notification: Toast appears in top-right corner

### Equipment Down Alert
- Equipment status changes to DOWN
- Severity: ERROR
- Notification: Toast appears + Email (if configured)

## Step 5: Manage Alerts

### To Acknowledge an Alert:
1. Go to Alert History tab
2. Find an unacknowledged alert (red triangle icon)
3. Click **Acknowledge** button
4. Alert status updates to acknowledged (blue clock icon)

### To Resolve an Alert:
1. Find an acknowledged alert
2. Click **Resolve** button
3. Alert status updates to resolved (green check icon)

## Step 6: Enable Email Notifications (Optional)

### For Gmail:

1. Stop the backend application

2. Edit `backend/src/main/resources/application.properties`:
```properties
mes.notification.email.enabled=true
mes.notification.email.from=your-email@gmail.com

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

3. Generate Gmail App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification (enable if not enabled)
   - App Passwords → Generate new password
   - Copy the 16-character password

4. Replace `your-app-password` with the generated password

5. Restart the backend application

6. Test by triggering a CRITICAL or ERROR alert

### For Other Email Providers:

**Office 365:**
```properties
spring.mail.host=smtp.office365.com
spring.mail.port=587
```

**Custom SMTP:**
```properties
spring.mail.host=your-smtp-server.com
spring.mail.port=587
```

## Testing Scenarios

### Scenario 1: Temperature Alert
1. Wait for equipment monitoring cycle (every 5 seconds)
2. If equipment temperature randomly exceeds 85°C, alert triggers
3. Check Alert History for new alert
4. Acknowledge and resolve the alert

### Scenario 2: Create Custom Rule
1. Create a rule for vibration > 7.0 mm/s
2. Set severity to MEDIUM
3. Enable web notifications
4. Wait for monitoring to trigger the rule
5. Verify alert appears in history

### Scenario 3: Email Notification
1. Configure email settings (see Step 6)
2. Create a rule with CRITICAL severity
3. Trigger the rule condition
4. Check your email inbox for alert notification

## Alert Rule Examples

### Low Vibration Warning
```
Rule Name: Low Vibration Check
Rule Type: HIGH_VIBRATION
Severity: LOW
Field: vibration
Operator: Less Than
Value: 2.0
```

### High Output Target
```
Rule Name: Production Target Alert
Rule Type: QUALITY_FAILURE
Severity: MEDIUM
Field: output
Operator: Greater Than or Equal
Value: 100
```

### Equipment Monitoring
```
Rule Name: Equipment Status Monitor
Rule Type: EQUIPMENT_DOWN
Severity: CRITICAL
(No condition needed - triggers on DOWN status)
```

## Troubleshooting

### No Alerts Appearing
**Problem**: Alert History is empty

**Solutions**:
- Check if equipment is being monitored (Dashboard should show live data)
- Verify WebSocket connection (check browser console)
- Ensure alert rules are active
- Check backend logs for errors

### Email Not Sending
**Problem**: Email notifications not received

**Solutions**:
- Verify `mes.notification.email.enabled=true`
- Check SMTP credentials are correct
- Review backend logs for email errors
- Test SMTP connection separately
- Check spam/junk folder

### Alerts Not Triggering
**Problem**: Conditions met but no alert

**Solutions**:
- Verify rule is active (`is_active = true`)
- Check condition values are correct
- Ensure equipment metrics are being updated
- Review backend logs for errors

### WebSocket Connection Issues
**Problem**: Real-time notifications not appearing

**Solutions**:
- Check browser console for WebSocket errors
- Verify backend WebSocket endpoint is accessible
- Refresh the page to reconnect
- Check firewall/proxy settings

## Quick Reference

### Alert Severity Colors
- 🔴 **CRITICAL/ERROR**: Red badge
- 🟡 **WARNING**: Yellow badge
- 🟠 **HIGH**: Orange badge
- 🔵 **MEDIUM**: Blue badge
- ⚪ **LOW**: Gray badge

### Alert Status Icons
- ⚠️ **Red Triangle**: Unacknowledged
- 🕐 **Blue Clock**: Acknowledged
- ✅ **Green Check**: Resolved

### Condition Operators
- **GT**: Greater Than (>)
- **LT**: Less Than (<)
- **EQ**: Equal To (=)
- **GTE**: Greater Than or Equal (≥)
- **LTE**: Less Than or Equal (≤)

### Default Thresholds
- Temperature: 85°C
- Vibration: 8.0 mm/s
- Equipment Status: DOWN

## API Testing (Optional)

### Get All Alerts
```bash
curl -X GET http://localhost:8080/api/alerts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Alert Rule
```bash
curl -X POST http://localhost:8080/api/alerts/rules \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ruleName": "Test Rule",
    "ruleType": "HIGH_TEMPERATURE",
    "severity": "HIGH",
    "conditionField": "temperature",
    "conditionOperator": "GT",
    "conditionValue": 80.0,
    "notificationEmail": true,
    "notificationWebsocket": true
  }'
```

### Acknowledge Alert
```bash
curl -X PUT http://localhost:8080/api/alerts/1/acknowledge \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "acknowledgedBy": "admin",
    "notes": "Investigating the issue"
  }'
```

## Next Steps

1. ✅ Create your first alert rule
2. ✅ Monitor equipment and wait for alerts
3. ✅ Practice acknowledging and resolving alerts
4. ✅ Configure email notifications
5. ✅ Customize alert rules for your equipment
6. ✅ Review alert history regularly

## Support

For detailed information, see:
- `ALERTS_NOTIFICATIONS_GUIDE.md` - Complete feature documentation
- `ALERTS_IMPLEMENTATION_SUMMARY.md` - Technical implementation details

---

**Ready to Start**: Navigate to Alert Management in the application!
