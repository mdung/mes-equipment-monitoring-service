# Real-Time Monitoring Guide

## Overview

The MES application now includes real-time monitoring capabilities using WebSocket technology. This enables live updates for equipment status, production metrics, and instant alerts without page refresh.

## Features Implemented

### 1. **Real-Time Equipment Status Updates**
- Live equipment status monitoring (RUNNING, IDLE, DOWN, MAINTENANCE)
- Real-time sensor data (temperature, vibration, output count)
- Updates every 5 seconds
- Automatic status change detection

### 2. **Real-Time Production Metrics**
- Live production progress tracking
- Real-time quantity updates
- Progress percentage calculation
- Updates every 10 seconds

### 3. **Alert & Notification System**
- Instant alerts for equipment failures
- Temperature threshold alerts (>85°C)
- Vibration threshold alerts (>8.0 mm/s)
- Equipment down notifications
- Visual toast notifications with auto-dismiss

### 4. **Live Dashboard Updates**
- Automatic dashboard refresh every 15 seconds
- Real-time statistics updates
- Live equipment status distribution
- No manual page refresh needed

## WebSocket Topics

### Backend Topics

| Topic | Description | Update Frequency |
|-------|-------------|------------------|
| `/topic/equipment-status` | Equipment status and sensor data | 5 seconds |
| `/topic/production-metrics` | Production order progress | 10 seconds |
| `/topic/alerts` | System alerts and notifications | On event |
| `/topic/dashboard` | Dashboard refresh trigger | 15 seconds |

### Message Formats

#### Equipment Status Update
```json
{
  "equipmentId": 1,
  "equipmentName": "CNC Machine 1",
  "status": "RUNNING",
  "temperature": 75.5,
  "vibration": 4.2,
  "outputCount": 120,
  "timestamp": "2025-12-03T10:30:00"
}
```

#### Production Metrics Update
```json
{
  "orderId": 1,
  "orderNumber": "PO-001",
  "producedQuantity": 850,
  "targetQuantity": 1000,
  "progressPercentage": 85.0,
  "status": "IN_PROGRESS"
}
```

#### Alert Notification
```json
{
  "type": "WARNING",
  "title": "High Temperature Alert",
  "message": "Equipment CNC Machine 1 temperature is 87.5°C (threshold: 85°C)",
  "equipmentId": 1,
  "equipmentName": "CNC Machine 1",
  "timestamp": "2025-12-03T10:30:00"
}
```

## Backend Implementation

### WebSocket Configuration

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }
}
```

### Scheduled Broadcasting

The `RealtimeMonitoringService` uses Spring's `@Scheduled` annotation to broadcast updates:

```java
@Scheduled(fixedRate = 5000) // Every 5 seconds
public void broadcastEquipmentStatus() {
    // Broadcast equipment status updates
}

@Scheduled(fixedRate = 10000) // Every 10 seconds
public void broadcastProductionMetrics() {
    // Broadcast production metrics
}

@Scheduled(fixedRate = 15000) // Every 15 seconds
public void broadcastDashboardUpdate() {
    // Trigger dashboard refresh
}
```

### Alert Thresholds

| Alert Type | Threshold | Severity |
|------------|-----------|----------|
| High Temperature | > 85°C | WARNING |
| High Vibration | > 8.0 mm/s | WARNING |
| Equipment Down | Status = DOWN | ERROR |

## Frontend Implementation

### WebSocket Service

```javascript
import websocketService from '../services/websocket';

// Connect
websocketService.connect(
  () => console.log('Connected'),
  (error) => console.error('Error:', error)
);

// Subscribe to topic
const subscription = websocketService.subscribe('/topic/alerts', (data) => {
  console.log('Received:', data);
});

// Unsubscribe
subscription.unsubscribe();

// Disconnect
websocketService.disconnect();
```

### Using in Components

#### Dashboard with Live Updates
```jsx
useEffect(() => {
  const subscription = websocketService.subscribe('/topic/dashboard', () => {
    fetchDashboardData(); // Refresh data
  });

  return () => {
    if (subscription) subscription.unsubscribe();
  };
}, []);
```

#### Production Orders with Real-Time Progress
```jsx
useEffect(() => {
  const subscription = websocketService.subscribe('/topic/production-metrics', (update) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === update.orderId 
          ? { ...order, producedQuantity: update.producedQuantity }
          : order
      )
    );
  });

  return () => {
    if (subscription) subscription.unsubscribe();
  };
}, []);
```

## Alert Notifications Component

The `AlertNotifications` component displays real-time alerts:

- Positioned at top-right of screen
- Auto-dismisses after 10 seconds
- Shows up to 5 alerts at once
- Color-coded by severity (ERROR=red, WARNING=yellow, INFO=blue)
- Slide-in animation

## Testing Real-Time Features

### 1. Test Equipment Status Updates
1. Start the backend and frontend
2. Open Dashboard
3. Watch for "Live Updates" indicator (green WiFi icon)
4. Equipment status updates every 5 seconds

### 2. Test Production Metrics
1. Create a production order
2. Start the order
3. Watch the progress bar update automatically
4. No page refresh needed

### 3. Test Alerts
1. Wait for equipment with high temperature/vibration
2. Alert notification appears in top-right
3. Alert auto-dismisses after 10 seconds
4. Can manually dismiss by clicking X

### 4. Test Dashboard Refresh
1. Open Dashboard
2. Dashboard refreshes every 15 seconds
3. Statistics update automatically

## Configuration

### Backend Configuration

In `application.properties`:
```properties
# WebSocket is enabled by default
# No additional configuration needed
```

### Frontend Configuration

In `websocket.js`:
```javascript
const socket = new SockJS('http://localhost:8080/ws');
```

For production, update the URL:
```javascript
const socket = new SockJS('https://your-domain.com/ws');
```

## Troubleshooting

### WebSocket Not Connecting

**Symptoms**: "WebSocket not connected" in console

**Solutions**:
1. Check backend is running on port 8080
2. Verify `/ws` endpoint is accessible
3. Check CORS configuration
4. Check browser console for errors

### No Real-Time Updates

**Symptoms**: Data doesn't update automatically

**Solutions**:
1. Check WebSocket connection status
2. Verify subscriptions are active
3. Check backend scheduled tasks are running
4. Look for errors in backend logs

### Alerts Not Showing

**Symptoms**: No alert notifications appear

**Solutions**:
1. Check WebSocket connection
2. Verify AlertNotifications component is rendered
3. Check browser console for errors
4. Ensure equipment meets alert thresholds

### High CPU Usage

**Symptoms**: Browser or server using too much CPU

**Solutions**:
1. Reduce update frequency in scheduled tasks
2. Limit number of simultaneous connections
3. Optimize data processing
4. Consider pagination for large datasets

## Performance Considerations

### Backend
- Scheduled tasks run at fixed intervals
- Consider database connection pooling
- Use caching for frequently accessed data
- Monitor thread pool usage

### Frontend
- WebSocket connection is reused
- Subscriptions are cleaned up on unmount
- Alerts are limited to 5 at a time
- Auto-dismiss prevents memory leaks

## Security Considerations

### Authentication
- WebSocket endpoint is public (no auth required)
- Consider adding JWT token validation
- Implement user-specific topics

### Rate Limiting
- Consider rate limiting for WebSocket connections
- Prevent abuse with connection limits
- Monitor for unusual activity

## Production Deployment

### Backend
1. Configure WebSocket for production URL
2. Enable SSL/TLS for secure WebSocket (wss://)
3. Set up load balancing with sticky sessions
4. Monitor WebSocket connections

### Frontend
1. Update WebSocket URL to production
2. Enable reconnection logic
3. Add connection status indicator
4. Handle network failures gracefully

## Future Enhancements

Potential improvements:
1. User-specific notifications
2. Historical alert log
3. Configurable alert thresholds
4. Email/SMS notifications
5. Alert acknowledgment system
6. Custom alert rules
7. Alert escalation
8. Performance metrics dashboard
9. WebSocket connection pooling
10. Message compression

## API Endpoints

No additional REST endpoints needed. All real-time data is pushed via WebSocket.

## Dependencies

### Backend
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

### Frontend
```json
{
  "sockjs-client": "^1.6.1",
  "stompjs": "^2.3.3"
}
```

## Monitoring

### Backend Metrics
- Active WebSocket connections
- Messages sent per second
- Subscription count
- Error rate

### Frontend Metrics
- Connection uptime
- Reconnection attempts
- Message receive rate
- Alert display count

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs for WebSocket errors
3. Verify network connectivity
4. Test with WebSocket debugging tools

## Success Criteria

✅ WebSocket connection established
✅ Equipment status updates every 5 seconds
✅ Production metrics update every 10 seconds
✅ Alerts appear instantly
✅ Dashboard refreshes automatically
✅ No page refresh needed
✅ Reconnection works after disconnect
✅ Alerts auto-dismiss
✅ Performance is acceptable

Real-time monitoring is now fully operational! 🎉
