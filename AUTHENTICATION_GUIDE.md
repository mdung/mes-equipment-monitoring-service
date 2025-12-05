# Authentication & Authorization Guide

## Overview

The MES application now includes a complete JWT-based authentication system with role-based access control (RBAC).

## Features

✅ JWT-based authentication
✅ Refresh token support
✅ Role-based access control (ADMIN, SUPERVISOR, OPERATOR, VIEWER)
✅ User management (CRUD operations)
✅ Password change functionality
✅ Automatic token refresh
✅ Protected routes
✅ Login/logout functionality

## User Roles

### ADMIN
- Full access to all features
- Can manage users (create, update, delete)
- Can access all endpoints
- Can view user management page

### SUPERVISOR
- Can manage production orders
- Can view all reports and analytics
- Can record quality checks
- Cannot manage users

### OPERATOR
- Can update production data
- Can record quality checks
- Can view equipment status
- Limited access to reports

### VIEWER
- Read-only access
- Can view dashboards and reports
- Cannot modify any data

## Default Users

After running the database migration, these users will be available:

| Username   | Password  | Role       | Email                |
|------------|-----------|------------|----------------------|
| admin      | admin123  | ADMIN      | admin@mes.com        |
| supervisor | super123  | SUPERVISOR | supervisor@mes.com   |
| operator   | oper123   | OPERATOR   | operator@mes.com     |
| viewer     | view123   | VIEWER     | viewer@mes.com       |

**⚠️ Important**: Change these passwords in production!

## API Endpoints

### Authentication Endpoints (Public)

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "admin",
  "email": "admin@mes.com",
  "fullName": "System Administrator",
  "role": "ADMIN"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

### User Management Endpoints (ADMIN only)

#### Get All Users
```http
GET /api/users
Authorization: Bearer {accessToken}
```

#### Get User by ID
```http
GET /api/users/{id}
Authorization: Bearer {accessToken}
```

#### Create User
```http
POST /api/users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@mes.com",
  "password": "password123",
  "fullName": "New User",
  "role": "OPERATOR"
}
```

#### Update User
```http
PUT /api/users/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "updated@mes.com",
  "fullName": "Updated Name",
  "role": "SUPERVISOR",
  "enabled": true
}
```

#### Delete User
```http
DELETE /api/users/{id}
Authorization: Bearer {accessToken}
```

#### Change Password
```http
POST /api/users/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

## Frontend Usage

### Login Page

Navigate to `/login` to access the login page. Enter username and password to authenticate.

### Protected Routes

All routes except `/login` are protected and require authentication. If not authenticated, users will be redirected to the login page.

### Using Auth Context

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout, hasRole } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return <div>Please login</div>;
  }

  // Check user role
  if (hasRole('ADMIN')) {
    return <div>Admin content</div>;
  }

  // Check multiple roles
  if (hasRole(['ADMIN', 'SUPERVISOR'])) {
    return <div>Admin or Supervisor content</div>;
  }

  return <div>Hello {user.fullName}</div>;
}
```

### Logout

Click on the user profile in the sidebar and select "Logout".

## Security Configuration

### JWT Settings

In `application.properties`:

```properties
# JWT secret key (change in production!)
mes.jwt.secret=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLongForHS256Algorithm

# Access token expiration (24 hours)
mes.jwt.expiration=86400000

# Refresh token expiration (7 days)
mes.jwt.refresh.expiration=604800000
```

### Password Encryption

Passwords are encrypted using BCrypt with strength 10.

### Token Storage

- Access tokens are stored in localStorage
- Refresh tokens are stored in localStorage
- Tokens are automatically included in API requests

## Access Control

### Backend (Spring Security)

Routes are protected using Spring Security:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/users/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

### Frontend (React)

Routes are protected using the `ProtectedRoute` component:

```jsx
<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
  <Route path="users" element={<UserManagement />} />
</Route>
```

## Token Refresh Flow

1. User logs in and receives access token (24h) and refresh token (7 days)
2. Access token is included in all API requests
3. When access token expires (401 response), frontend automatically:
   - Calls `/api/auth/refresh` with refresh token
   - Gets new access token
   - Retries the original request
4. If refresh token is expired, user is redirected to login

## Production Recommendations

### 1. Change Default Passwords

```sql
-- Connect to database
psql -U postgres -d mes_db

-- Update admin password
UPDATE users SET password = '$2a$10$YOUR_NEW_BCRYPT_HASH' WHERE username = 'admin';
```

Generate BCrypt hash:
```java
BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("your-strong-password");
```

### 2. Use Environment Variables

```properties
mes.jwt.secret=${JWT_SECRET:defaultSecretKey}
mes.jwt.expiration=${JWT_EXPIRATION:86400000}
```

### 3. Enable HTTPS

Update CORS configuration to only allow HTTPS origins.

### 4. Implement Rate Limiting

Add rate limiting to login endpoint to prevent brute force attacks.

### 5. Add Account Lockout

Implement account lockout after failed login attempts.

### 6. Enable Audit Logging

Log all authentication attempts and user management actions.

## Troubleshooting

### "Invalid JWT token"
- Token might be expired
- Token might be malformed
- JWT secret might have changed

### "Refresh token was expired"
- User needs to login again
- Refresh token validity is 7 days

### "Access Denied"
- User doesn't have required role
- Check role-based access control settings

### "User not found"
- Username might be incorrect
- User might have been deleted

## Testing Authentication

### Using cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Use token
curl -X GET http://localhost:8080/api/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create a POST request to `/api/auth/login`
2. Add JSON body with username and password
3. Copy the `accessToken` from response
4. For protected endpoints, add header:
   - Key: `Authorization`
   - Value: `Bearer YOUR_ACCESS_TOKEN`

## Database Schema

### users table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### refresh_tokens table
```sql
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Next Steps

Consider implementing:
- Two-factor authentication (2FA)
- OAuth2 integration
- Password reset via email
- Session management
- IP-based access control
- API rate limiting
- Audit logging
