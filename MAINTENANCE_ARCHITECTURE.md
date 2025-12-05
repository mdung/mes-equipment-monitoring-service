# Maintenance Module - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Maintenance.jsx (Main Page)                  │  │
│  │                   Tab Navigation                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐            │
│         │                    │                    │             │
│    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐        │
│    │Calendar │         │Scheduler│         │  Tasks  │         │
│    │  View   │         │         │         │Checklist│         │
│    └─────────┘         └─────────┘         └─────────┘         │
│         │                    │                    │             │
│    ┌────▼────┐         ┌────▼────┐         ┌────▼────┐        │
│    │  Spare  │         │  Cost   │         │ History │         │
│    │  Parts  │         │Tracking │         │         │         │
│    └─────────┘         └─────────┘         └─────────┘         │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Shared Components                            │  │
│  │         Modal, Toast, Icons (Lucide React)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌──────────────────────────▼───────────────────────────────┐  │
│  │                    API Service (Axios)                    │  │
│  │              JWT Auth, Token Refresh                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    BACKEND (Spring Boot)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           MaintenanceController.java                      │  │
│  │              REST API Endpoints                           │  │
│  │   /schedules, /tasks, /spare-parts, /costs               │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │           MaintenanceService.java                         │  │
│  │              Business Logic Layer                         │  │
│  │   - Schedule Management                                   │  │
│  │   - Task Lifecycle                                        │  │
│  │   - Parts Inventory                                       │  │
│  │   - Cost Calculations                                     │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │              Repository Layer (JPA)                       │  │
│  │   - MaintenanceScheduleRepository                         │  │
│  │   - MaintenanceTaskRepository                             │  │
│  │   - SparePartRepository                                   │  │
│  │   - MaintenanceCostRepository                             │  │
│  │   - MaintenanceTaskPartRepository                         │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                      │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │                  Entity Models                            │  │
│  │   - MaintenanceSchedule                                   │  │
│  │   - MaintenanceTask                                       │  │
│  │   - SparePart                                             │  │
│  │   - MaintenanceCost                                       │  │
│  │   - MaintenanceTaskPart                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ JDBC
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ maintenance_     │  │ maintenance_     │                     │
│  │   schedules      │  │    tasks         │                     │
│  └────────┬─────────┘  └────────┬─────────┘                    │
│           │                     │                                │
│  ┌────────▼─────────┐  ┌───────▼──────────┐                    │
│  │   spare_parts    │  │ maintenance_     │                     │
│  │                  │  │    costs         │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         maintenance_task_parts (Junction Table)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Flyway Migrations                            │  │
│  │   V4__Add_Maintenance_Management.sql                      │  │
│  │   V9__Add_Maintenance_Cost_Quantity.sql                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Maintenance (Main Page)
│
├── MaintenanceCalendar
│   ├── Calendar Grid
│   ├── Date Details Modal
│   └── Task/Schedule Display
│
├── PreventiveScheduler
│   ├── Schedule List Table
│   ├── Create/Edit Modal
│   ├── Upcoming Alerts
│   └── Delete Confirmation
│
├── TaskChecklist
│   ├── Statistics Cards
│   ├── Task List Table
│   ├── Status Filter
│   ├── Create/Edit Modal
│   └── Complete Task Modal
│
├── SparePartsManagement
│   ├── Statistics Cards
│   ├── Low Stock Alerts
│   ├── Parts List Table
│   ├── Stock Filter
│   └── Create/Edit Modal
│
├── CostTracking
│   ├── Task Selection
│   ├── Cost Summary Cards
│   ├── Cost Breakdown Table
│   └── Add Cost Modal
│
└── MaintenanceHistory
    ├── Statistics Cards
    ├── Filter Controls
    ├── History Table
    └── Expandable Details
```

## Data Flow

### Creating a Maintenance Schedule

```
User Action (Click "New Schedule")
    ↓
PreventiveScheduler Component
    ↓
Modal Opens with Form
    ↓
User Fills Form & Submits
    ↓
Form Validation
    ↓
API Call: POST /api/maintenance/schedules
    ↓
MaintenanceController.createSchedule()
    ↓
MaintenanceService.createSchedule()
    ↓
Validate Equipment Exists
    ↓
MaintenanceScheduleRepository.save()
    ↓
Database INSERT
    ↓
Return DTO to Frontend
    ↓
Update Component State
    ↓
Show Success Toast
    ↓
Refresh Schedule List
```

### Task Lifecycle Flow

```
PENDING (Created)
    ↓
    │ User clicks "Start"
    ↓
IN_PROGRESS (Working)
    ↓
    │ User clicks "Complete"
    ↓
COMPLETED (Done)
    ↓
    │ Appears in History
    ↓
ARCHIVED (Historical Record)
```

## Database Relationships

```
equipment (1) ──────────── (N) maintenance_schedules
    │
    │
    └──────────────────────── (N) maintenance_tasks
                                    │
                                    ├── (N) maintenance_costs
                                    │
                                    └── (N) maintenance_task_parts ──── (1) spare_parts

users (1) ──────────────────────── (N) maintenance_tasks (assigned_to)
```

## API Request/Response Flow

### Example: Get All Tasks

```
Frontend Request:
GET /api/maintenance/tasks
Headers: Authorization: Bearer <JWT_TOKEN>

    ↓

Backend Processing:
1. AuthTokenFilter validates JWT
2. MaintenanceController.getAllTasks()
3. MaintenanceService.getAllTasks()
4. MaintenanceTaskRepository.findAll()
5. Convert entities to DTOs
6. Return List<MaintenanceTaskDto>

    ↓

Frontend Response:
200 OK
[
  {
    "id": 1,
    "taskTitle": "Oil Change",
    "equipmentName": "CNC Machine 1",
    "status": "PENDING",
    ...
  }
]

    ↓

Component Updates:
- State updated with tasks
- Table re-renders
- Statistics recalculated
```

## State Management

### Component State Pattern

```javascript
// Each component manages its own state
const [data, setData] = useState([]);        // Main data
const [showModal, setShowModal] = useState(false);  // UI state
const [editingItem, setEditingItem] = useState(null); // Edit mode
const [toast, setToast] = useState(null);    // Notifications
const [formData, setFormData] = useState({}); // Form state
```

### Data Fetching Pattern

```javascript
useEffect(() => {
  fetchData();  // Load on mount
}, []);

const fetchData = async () => {
  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (error) {
    setToast({ message: 'Error', type: 'error' });
  }
};
```

## Security Architecture

```
Request Flow with Security:

User Request
    ↓
API Service (Axios)
    ↓
Add JWT Token from localStorage
    ↓
Send to Backend
    ↓
AuthTokenFilter (Spring Security)
    ↓
Validate JWT Token
    ↓
Extract User Details
    ↓
Check Permissions (if needed)
    ↓
Allow/Deny Request
    ↓
Controller → Service → Repository
    ↓
Response with Data
```

## Error Handling Flow

```
API Call Fails
    ↓
Catch Block in Component
    ↓
Check Error Type:
    │
    ├── 401 Unauthorized
    │   ↓
    │   Try Token Refresh
    │   ↓
    │   Retry Request or Redirect to Login
    │
    ├── 404 Not Found
    │   ↓
    │   Show "Resource not found" toast
    │
    ├── 500 Server Error
    │   ↓
    │   Show "Server error" toast
    │
    └── Network Error
        ↓
        Show "Connection error" toast
    ↓
Log Error to Console
    ↓
User Sees Toast Notification
```

## Performance Considerations

### Frontend Optimizations
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Debouncing**: Search/filter inputs debounced
- **Pagination**: Large lists paginated (future enhancement)

### Backend Optimizations
- **Database Indexes**: On foreign keys and frequently queried columns
- **DTO Pattern**: Only send necessary data
- **Query Optimization**: Efficient JPA queries
- **Connection Pooling**: Database connection reuse

### Database Optimizations
- **Indexes**: On equipment_id, status, dates
- **Foreign Keys**: Proper relationships
- **Cascade Operations**: Automatic cleanup
- **Constraints**: Data integrity

## Scalability Considerations

### Horizontal Scaling
- Stateless backend (JWT tokens)
- Database connection pooling
- Load balancer ready

### Vertical Scaling
- Efficient queries
- Proper indexing
- Caching strategy (future)

### Data Growth
- Archive old completed tasks
- Implement data retention policies
- Partition large tables (future)

## Monitoring & Logging

### Frontend
- Console errors logged
- API call failures tracked
- User actions logged (optional)

### Backend
- Spring Boot logging
- API endpoint access logs
- Error stack traces
- Performance metrics (future)

### Database
- Query performance monitoring
- Connection pool metrics
- Table size monitoring

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│         Load Balancer (Optional)        │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌───────▼──────┐
│   Frontend   │  │   Frontend   │
│   (Nginx)    │  │   (Nginx)    │
└──────────────┘  └──────────────┘
        │                 │
        └────────┬────────┘
                 │
┌────────────────▼────────────────────────┐
│      Backend API (Spring Boot)          │
│         Multiple Instances              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      PostgreSQL Database                │
│      (Primary + Replica)                │
└─────────────────────────────────────────┘
```

## Technology Stack Summary

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State**: React Hooks (useState, useEffect)

### Backend
- **Framework**: Spring Boot 3.2.3
- **Language**: Java 17
- **ORM**: Spring Data JPA
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL 15
- **Migrations**: Flyway
- **Build**: Maven

### Infrastructure
- **Database**: PostgreSQL 15
- **Web Server**: Embedded Tomcat (Spring Boot)
- **Development**: Hot reload (Vite + Spring DevTools)

## Future Architecture Enhancements

1. **Caching Layer**: Redis for frequently accessed data
2. **Message Queue**: RabbitMQ for async tasks
3. **File Storage**: S3 for maintenance photos/documents
4. **Real-time Updates**: WebSocket for live notifications
5. **Microservices**: Split into smaller services
6. **API Gateway**: Centralized API management
7. **Service Mesh**: For microservices communication
8. **Monitoring**: Prometheus + Grafana
9. **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
10. **CI/CD**: Automated deployment pipeline
