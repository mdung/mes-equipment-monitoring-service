# Manufacturing Execution System (MES)

A full-stack Manufacturing Execution System for equipment monitoring, production order management, and quality control.

## Tech Stack

### Backend
- Java 17
- Spring Boot 3.2.3
- PostgreSQL 15
- Flyway (Database Migrations)
- Maven

### Frontend
- React 19
- Vite
- React Router
- Recharts (Data Visualization)
- Tailwind CSS
- Axios

## Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (ADMIN, SUPERVISOR, OPERATOR, VIEWER)
- User management
- Secure password encryption
- Refresh token support
- Protected routes

### Equipment Management
- CRUD operations for equipment
- Real-time status tracking (RUNNING, IDLE, DOWN, MAINTENANCE)
- Equipment logs (temperature, vibration, output count)
- Downtime event tracking
- OEE (Overall Equipment Effectiveness) calculation

### Production Orders
- Create and manage production orders
- Track production progress
- Start/Complete/Cancel orders
- Equipment assignment
- Real-time quantity tracking

### Quality Control
- Record quality checks per production order
- Track passed/rejected counts
- Calculate pass rates
- Quality metrics visualization

### Maintenance Management
- **Calendar View**: Visual monthly calendar of all maintenance activities
- **Preventive Scheduler**: Create recurring maintenance schedules (daily, weekly, monthly, quarterly, yearly)
- **Task Checklist**: Manage maintenance tasks with status tracking (pending, in progress, completed)
- **Spare Parts Management**: Track inventory, stock levels, and low stock alerts
- **Cost Tracking**: Record and analyze maintenance costs by type (labor, parts, materials, services)
- **Maintenance History**: Complete historical records with filtering and cost breakdown
- User assignment and priority management
- Upcoming maintenance alerts
- Equipment maintenance tracking

### Quality Management
- **Quality Control Plans**: Define quality standards and inspection procedures
- **Inspection Checklists**: Create detailed inspection checklists with acceptance criteria
- **Defect Management**: Record, categorize, and track defects with severity levels
- **Root Cause Analysis**: 5 Whys methodology for systematic problem-solving
- **Quality Trends**: Visualize defect patterns over time with trend charts
- **Pareto Charts**: Identify top defect categories using 80/20 analysis
- **SPC Charts**: Statistical Process Control with control limits and out-of-control detection
- Defect categorization (8 pre-loaded categories)
- Corrective and preventive action tracking
- Real-time quality metrics and statistics

### Reports & Analytics
- **Report Builder Interface**: Create custom reports with interactive builder
- **Pre-Built Templates**: 10 professional report templates (Production, Quality, Maintenance, Equipment)
- **Interactive Charts**: Bar, line, and pie charts with Recharts library
- **Export Functionality**: Export to Excel (.xlsx), CSV (.csv), and PDF (.pdf)
- **Scheduled Reports**: Automate report generation (daily, weekly, monthly)
- **Email Delivery**: Scheduled email report distribution
- Report categories: Production Efficiency, Equipment Utilization, Downtime Analysis, Quality Trends, OEE Performance
- Custom report builder with data source selection
- Report execution history and tracking

### Alerts & Notifications
- **Notification Center/Inbox**: Centralized notification management with unread badges
- **Real-Time Toast Notifications**: WebSocket-powered instant notifications with auto-dismiss
- **Alert Configuration UI**: Create and manage alert rules with condition builder
- **Alert History Viewer**: Complete alert lifecycle tracking (acknowledge, resolve)
- **Notification Preferences**: Per-type delivery method configuration (Web, Email, SMS, Push)
- 5 notification types: ALERT, SYSTEM, REPORT, MAINTENANCE, QUALITY
- Severity levels: INFO, WARNING, ERROR, CRITICAL
- Bulk actions: Mark all as read, archive, delete
- Severity filtering and quiet hours support
- Real-time WebSocket integration for instant updates

### Dashboard
- Real-time equipment statistics
- Equipment status distribution
- Average OEE metrics
- Visual charts and graphs

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+ (installed locally)
- Maven

### Database Setup

1. Create PostgreSQL database and user:

```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create database and user
CREATE DATABASE mes_db;
CREATE USER mes_user WITH PASSWORD 'mes_password';
GRANT ALL PRIVILEGES ON DATABASE mes_db TO mes_user;

-- Connect to the new database
\c mes_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO mes_user;
```

Database configuration:
- Database: `mes_db`
- User: `mes_user`
- Password: `mes_password`
- Port: `5432`

**Note**: Flyway will automatically create all tables when you first run the backend application.

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

**Important**: On first run, Flyway will automatically:
- Create all database tables
- Set up indexes
- Initialize the schema

The backend will start on `http://localhost:8080`

API Documentation available at: `http://localhost:8080/swagger-ui.html`

### Verifying Database Migration

After starting the backend, you can verify the tables were created:

```sql
psql -U mes_user -d mes_db

-- List all tables
\dt

-- You should see:
-- equipment
-- production_order
-- equipment_log
-- downtime_event
-- quality_check
-- flyway_schema_history
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## First Login

Navigate to `http://localhost:5173` and you'll be redirected to the login page.

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for all default users and detailed authentication documentation.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### User Management (ADMIN only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/change-password` - Change password

### Equipment
- `GET /api/equipment` - Get all equipment
- `GET /api/equipment/{id}` - Get equipment by ID
- `POST /api/equipment` - Create equipment
- `PUT /api/equipment/{id}` - Update equipment
- `DELETE /api/equipment/{id}` - Delete equipment
- `GET /api/equipment/{id}/oee` - Get equipment OEE

### Production Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order
- `PUT /api/orders/{id}/start` - Start order
- `PUT /api/orders/{id}/complete` - Complete order
- `PUT /api/orders/{id}/cancel` - Cancel order
- `PUT /api/orders/{id}/update-quantity` - Update produced quantity

### Quality Checks
- `GET /api/quality/order/{orderId}` - Get checks by order
- `POST /api/quality` - Record quality check

### Equipment Logs
- `GET /api/equipment-logs/equipment/{equipmentId}` - Get logs by equipment
- `GET /api/equipment-logs/equipment/{equipmentId}/latest` - Get latest log
- `POST /api/equipment-logs` - Create log

### Downtime Events
- `GET /api/downtime/equipment/{equipmentId}` - Get downtime by equipment
- `POST /api/downtime` - Record downtime
- `PUT /api/downtime/{id}/end` - End downtime

### Maintenance Management
- `GET /api/maintenance/schedules` - Get all maintenance schedules
- `GET /api/maintenance/schedules/{id}` - Get schedule by ID
- `GET /api/maintenance/schedules/equipment/{equipmentId}` - Get schedules by equipment
- `GET /api/maintenance/schedules/upcoming` - Get upcoming schedules (within 7 days)
- `POST /api/maintenance/schedules` - Create maintenance schedule
- `PUT /api/maintenance/schedules/{id}` - Update schedule
- `DELETE /api/maintenance/schedules/{id}` - Delete schedule
- `GET /api/maintenance/tasks` - Get all maintenance tasks
- `GET /api/maintenance/tasks/{id}` - Get task by ID
- `GET /api/maintenance/tasks/equipment/{equipmentId}` - Get tasks by equipment
- `GET /api/maintenance/tasks/user/{userId}` - Get tasks by assigned user
- `GET /api/maintenance/tasks/status/{status}` - Get tasks by status
- `POST /api/maintenance/tasks` - Create maintenance task
- `PUT /api/maintenance/tasks/{id}` - Update task
- `PUT /api/maintenance/tasks/{id}/start` - Start task
- `PUT /api/maintenance/tasks/{id}/complete` - Complete task
- `GET /api/maintenance/spare-parts` - Get all spare parts
- `GET /api/maintenance/spare-parts/low-stock` - Get low stock parts
- `POST /api/maintenance/spare-parts` - Create spare part
- `PUT /api/maintenance/spare-parts/{id}` - Update spare part
- `GET /api/maintenance/costs/task/{taskId}` - Get costs by task
- `GET /api/maintenance/costs/task/{taskId}/total` - Get total cost for task
- `POST /api/maintenance/costs` - Add maintenance cost

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/equipment-status-distribution` - Get status distribution

## Database Schema

- `equipment` - Equipment master data
- `production_order` - Production orders
- `equipment_log` - Equipment sensor logs
- `downtime_event` - Equipment downtime tracking
- `quality_check` - Quality inspection records
- `maintenance_schedules` - Recurring maintenance schedules
- `maintenance_tasks` - Individual maintenance tasks
- `spare_parts` - Spare parts inventory
- `maintenance_costs` - Maintenance cost records
- `maintenance_task_parts` - Parts used in maintenance tasks

## Development

### Backend
- Uses Lombok for boilerplate reduction
- Flyway manages database migrations
- Spring Data JPA for database access
- CORS enabled for frontend integration

### Frontend
- Component-based architecture
- Reusable Modal and Toast components
- Real-time data updates
- Responsive design with Tailwind CSS

## License

MIT
