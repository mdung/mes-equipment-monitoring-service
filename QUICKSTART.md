# Quick Start Guide

Get the MES system up and running in 5 minutes!

## Step 1: Setup the Database

Make sure PostgreSQL is installed and running on your system.

Create the database and user:

```sql
psql -U postgres

CREATE DATABASE mes_db;
CREATE USER mes_user WITH PASSWORD 'mes_password';
GRANT ALL PRIVILEGES ON DATABASE mes_db TO mes_user;
\c mes_db
GRANT ALL ON SCHEMA public TO mes_user;
\q
```

## Step 2: Start the Backend

Open a terminal in the project root:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**First Run**: Flyway will automatically create all database tables.

Wait for the message: "Started MesApplication in X seconds"

The backend will be available at: http://localhost:8080

## Step 3: Start the Frontend

Open another terminal in the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: http://localhost:5173

## Step 4: Verify Database Setup (Optional)

Run the verification script to ensure everything is set up correctly:

```bash
psql -U mes_user -d mes_db -f verify-setup.sql
```

This will show you all tables, indexes, and the Flyway migration history.

## Step 5: Access the Application

Open your browser and navigate to: http://localhost:5173

You'll be redirected to the login page.

**Login with default admin account:**
- Username: `admin`
- Password: `admin123`

After login, you'll see the MES Dashboard!

## First Steps in the Application

### 1. Add Equipment
- Click "Equipment" in the sidebar
- Click "Add Equipment" button
- Fill in the form:
  - Name: "CNC Machine 1"
  - Code: "CNC-001"
  - Location: "Factory Floor A"
  - Status: "RUNNING"
- Click "Create"

### 2. Create a Production Order
- Click "Production Orders" in the sidebar
- Click "Create Order" button
- Fill in the form:
  - Order Number: "PO-001"
  - Product Name: "Widget A"
  - Target Quantity: 1000
  - Equipment: Select "CNC Machine 1"
- Click "Create"

### 3. Start the Order
- Find your order in the list
- Click the "Start" button
- The order status will change to "IN_PROGRESS"

### 4. Record Quality Check
- Click "Quality Checks" in the sidebar
- Click "Record Check" button
- Select your order
- Enter passed count: 95
- Enter rejected count: 5
- Click "Record"

### 5. View Dashboard
- Click "Dashboard" in the sidebar
- See your equipment statistics
- View the status distribution chart

## Troubleshooting

### Backend won't start
- Make sure PostgreSQL is running (check your system services)
- Verify database exists: `psql -U mes_user -d mes_db`
- Check if port 8080 is available
- Verify Java 17+ is installed: `java -version`
- Check Maven is installed: `mvn -version`

### Frontend won't start
- Make sure Node.js is installed: `node -v`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 5173 is available

### Database connection error
- Verify PostgreSQL is running on your system
- Check database exists: `psql -U postgres -c "\l" | grep mes_db`
- Verify user has permissions: `psql -U mes_user -d mes_db -c "SELECT 1;"`
- Check database credentials in `backend/src/main/resources/application.properties`
- Review Flyway migration logs in the console output

### API calls failing
- Make sure backend is running on port 8080
- Check browser console for CORS errors
- Verify API base URL in `frontend/src/services/api.js`

## Default Credentials

Database:
- Host: localhost:5432
- Database: mes_db
- Username: mes_user
- Password: mes_password

## API Documentation

Once the backend is running, visit:
http://localhost:8080/swagger-ui.html

This provides interactive API documentation where you can test all endpoints.

## Next Steps

- Explore all features in the navigation menu
- Try creating multiple equipment and orders
- Monitor the dashboard for real-time statistics
- Record quality checks for your orders
- Complete or cancel orders

Enjoy using the MES system!
