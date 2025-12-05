# Real-Time Features Implementation

This document describes the real-time features implemented for the MES Equipment Monitoring Service.

## Features Implemented

### 1. Live Equipment Status Indicators ✅

**Location**: `frontend/src/components/realtime/LiveEquipmentStatus.jsx`

**Features**:
- **Real-Time Updates**: Live equipment status updates via WebSocket
- **Status Indicators**: Color-coded status with pulsing animation for running equipment
- **Sensor Data**: Real-time temperature, vibration, and output count
- **Connection Status**: Visual indicator for WebSocket connection
- **Last Update Time**: Shows timestamp of last update
- **Status Colors**:
  - Green (RUNNING): Equipment is running
  - Yellow (IDLE): Equipment is idle
  - Red (DOWN): Equipment is down
  - Blue (MAINTENANCE): Equipment in maintenance

**Usage**:
```jsx
<LiveEquipmentStatus 
  equipmentId={1} 
  equipmentName="CNC Machine 1" 
/>
```

**WebSocket Topic**: `/topic/equipment-status`

### 2. Real-Time Production Counters ✅

**Location**: `frontend/src/components/realtime/RealTimeProductionCounter.jsx`

**Features**:
- **Live Quantity Updates**: Real-time production quantity tracking
- **Progress Visualization**: Visual progress bar with percentage
- **Trend Indicators**: Shows positive/negative changes with animation
- **Target Tracking**: Displays produced, target, and remaining quantities
- **Connection Status**: Live connection indicator
- **Update Timestamps**: Shows last update time

**Usage**:
```jsx
<RealTimeProductionCounter
  orderId={1}
  initialQuantity={850}
  targetQuantity={1000}
/>
```

**WebSocket Topic**: `/topic/production-metrics`

**Features**:
- Animated trend indicators when quantity changes
- Progress percentage calculation
- Remaining quantity display
- Live update timestamps

### 3. Live Chat for Shift Handover ✅

**Location**: `frontend/src/components/realtime/ShiftHandoverChat.jsx`

**Features**:
- **Real-Time Messaging**: Instant message delivery via WebSocket
- **User Presence**: Shows online users count
- **Message History**: Loads and displays message history
- **User Identification**: Shows sender name and timestamp
- **Connection Status**: Visual connection indicator
- **Auto-Scroll**: Automatically scrolls to latest messages
- **Message Formatting**: Distinguishes own messages from others

**Usage**:
```jsx
<ShiftHandoverChat 
  shiftId={1} 
  currentShift={shiftData} 
/>
```

**WebSocket Topics**:
- `/topic/shift-chat/{shiftId}` - Chat messages
- `/topic/shift-users/{shiftId}` - Online users
- `/app/shift-chat/{shiftId}` - Send messages

**Features**:
- Real-time message broadcasting
- User presence tracking
- Message timestamps
- Connection status monitoring
- Auto-reconnection support

### 4. Collaborative Notes ✅

**Location**: `frontend/src/components/realtime/CollaborativeNotes.jsx`

**Features**:
- **Real-Time Sync**: Notes sync in real-time across all users
- **Multi-User Editing**: Multiple users can view and edit notes
- **Typing Indicators**: Shows when other users are typing
- **Note Management**: Create, edit, and delete notes
- **User Attribution**: Shows who created/edited each note
- **Connection Status**: Live connection indicator
- **Active Users**: Shows number of users viewing notes

**Usage**:
```jsx
// For orders
<CollaborativeNotes 
  orderId={1} 
  noteType="ORDER" 
/>

// For equipment
<CollaborativeNotes 
  equipmentId={1} 
  noteType="EQUIPMENT" 
/>
```

**WebSocket Topics**:
- `/topic/notes/order/{orderId}` - Order notes
- `/topic/notes/equipment/{equipmentId}` - Equipment notes
- `/app/topic/notes/{type}/{id}/typing` - Typing indicators

**Features**:
- Real-time note synchronization
- Typing indicators
- Edit/delete permissions (own notes only)
- Timestamp tracking
- Multi-user collaboration

### 5. Activity Feed ✅

**Location**: `frontend/src/components/realtime/ActivityFeed.jsx`

**Features**:
- **Real-Time Updates**: Live activity stream
- **Activity Types**: Equipment, Production, Alerts, Quality, Maintenance
- **Color Coding**: Different colors for different activity types
- **Time Formatting**: Smart time display (just now, minutes ago, etc.)
- **User Attribution**: Shows who performed the activity
- **Status Icons**: Visual icons for different activity types
- **Filtering**: Filter by activity type
- **Connection Status**: Live connection indicator

**Usage**:
```jsx
<ActivityFeed 
  filter="ALL"  // or "EQUIPMENT", "PRODUCTION", "ALERT", etc.
  limit={50} 
/>
```

**WebSocket Topic**: `/topic/activities`

**Activity Types**:
- EQUIPMENT: Equipment status changes, sensor updates
- PRODUCTION: Order updates, quantity changes
- ALERT: System alerts and notifications
- QUALITY: Quality check results
- MAINTENANCE: Maintenance activities

## Integration Points

### WebSocket Service

The existing WebSocket service (`frontend/src/services/websocket.js`) is used for all real-time features:

```javascript
import websocketService from '../services/websocket';

// Subscribe to updates
const subscription = websocketService.subscribe('/topic/updates', (data) => {
  // Handle update
});

// Check connection
const isConnected = websocketService.isConnected();
```

### Backend API Endpoints (Expected)

The frontend expects these API endpoints:

- `GET /shifts/{shiftId}/messages` - Get chat messages
- `POST /shifts/{shiftId}/messages` - Send message
- `GET /orders/{orderId}/notes` - Get order notes
- `POST /orders/{orderId}/notes` - Create order note
- `PUT /orders/{orderId}/notes/{noteId}` - Update note
- `DELETE /orders/{orderId}/notes/{noteId}` - Delete note
- `GET /equipment/{equipmentId}/notes` - Get equipment notes
- `POST /equipment/{equipmentId}/notes` - Create equipment note
- `GET /activities` - Get activity feed

### WebSocket Topics (Backend)

Expected WebSocket topics for backend to broadcast:

- `/topic/equipment-status` - Equipment status updates
- `/topic/production-metrics` - Production counter updates
- `/topic/shift-chat/{shiftId}` - Shift chat messages
- `/topic/shift-users/{shiftId}` - Online users in shift
- `/topic/notes/order/{orderId}` - Order note updates
- `/topic/notes/equipment/{equipmentId}` - Equipment note updates
- `/topic/activities` - Activity feed updates

## Real-Time Monitoring Page

**Location**: `frontend/src/pages/RealtimeMonitoring.jsx`

A dedicated page showcasing all real-time features:
- Activity feed at the top
- Live equipment status panel
- Real-time production counters
- Shift handover chat
- Collaborative notes

**Route**: `/realtime`

## Component Usage Examples

### Equipment Details Page
```jsx
import LiveEquipmentStatus from '../components/realtime/LiveEquipmentStatus';

<LiveEquipmentStatus 
  equipmentId={equipment.id} 
  equipmentName={equipment.name} 
/>
```

### Production Orders Page
```jsx
import RealTimeProductionCounter from '../components/realtime/RealTimeProductionCounter';

<RealTimeProductionCounter
  orderId={order.id}
  initialQuantity={order.producedQuantity}
  targetQuantity={order.targetQuantity}
/>
```

### Shift Management Page
```jsx
import ShiftHandoverChat from '../components/realtime/ShiftHandoverChat';

<ShiftHandoverChat 
  shiftId={currentShift.id} 
  currentShift={currentShift} 
/>
```

### Order Details Modal
```jsx
import CollaborativeNotes from '../components/realtime/CollaborativeNotes';

<CollaborativeNotes 
  orderId={order.id} 
  noteType="ORDER" 
/>
```

### Dashboard
```jsx
import ActivityFeed from '../components/realtime/ActivityFeed';

<ActivityFeed filter="ALL" limit={20} />
```

## Real-Time Update Frequencies

- **Equipment Status**: Every 5 seconds
- **Production Metrics**: Every 10 seconds
- **Chat Messages**: Instant (on send)
- **Notes**: Instant (on create/update/delete)
- **Activities**: Instant (on event)
- **Dashboard**: Every 15 seconds

## Connection Management

All components:
- Check WebSocket connection status
- Display connection indicators
- Handle reconnection automatically
- Show offline/online status
- Gracefully handle connection loss

## Visual Indicators

- **Green Pulse**: Connected and receiving updates
- **Red Dot**: Disconnected
- **Animated Pulse**: Active/live data
- **Trend Arrows**: Positive/negative changes
- **Status Colors**: Color-coded by status/type

## Performance Considerations

- Components unsubscribe on unmount
- Efficient re-rendering with React hooks
- Connection status checked every second
- Automatic cleanup of intervals
- Optimized WebSocket subscriptions

## Future Enhancements

Potential improvements:
- Message read receipts
- File sharing in chat
- Rich text editing in notes
- Activity feed filtering UI
- Real-time notifications
- Presence indicators
- Typing indicators improvements
- Message search
- Note versioning
- Activity feed export

## Notes

- All features use the existing WebSocket infrastructure
- Components are fully responsive
- Dark mode supported
- i18n ready (translation keys can be added)
- Connection status is monitored and displayed
- Automatic reconnection on disconnect
- Efficient subscription management

