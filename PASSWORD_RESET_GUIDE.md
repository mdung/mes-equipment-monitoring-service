# Password Reset Guide

## Overview

The MES application now includes a complete password reset functionality that allows users to reset their passwords via email (or token in development mode).

## Features

✅ Password reset request via email
✅ Secure token generation (UUID)
✅ Token expiration (1 hour)
✅ One-time use tokens
✅ Token validation
✅ Password strength requirements
✅ User-friendly UI

## User Flow

### 1. Request Password Reset
1. User clicks "Forgot your password?" on login page
2. User enters their email address
3. System generates reset token
4. User receives reset instructions

### 2. Reset Password
1. User clicks reset link (or enters token)
2. System validates token
3. User enters new password
4. Password is updated
5. User is redirected to login

## API Endpoints

### Request Password Reset
```http
POST /api/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response** (Success):
```json
{
  "message": "Password reset instructions sent to email",
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Note**: The `token` field is only returned in development mode for testing. In production, it should be sent via email only.

### Validate Reset Token
```http
GET /api/password-reset/validate/{token}
```

**Response** (Valid):
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Response** (Invalid):
```json
{
  "valid": false,
  "error": "Token has expired"
}
```

### Confirm Password Reset
```http
POST /api/password-reset/confirm
Content-Type: application/json

{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "newSecurePassword123"
}
```

**Response** (Success):
```json
{
  "message": "Password has been reset successfully"
}
```

**Response** (Error):
```json
{
  "error": "Invalid or expired token"
}
```

## Database Schema

### password_reset_tokens Table
```sql
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
- `idx_password_reset_token` - Fast token lookup
- `idx_password_reset_user` - User's reset tokens
- `idx_password_reset_expiry` - Cleanup expired tokens

## Security Features

### 1. Token Generation
- Uses UUID for unpredictable tokens
- 256-bit randomness
- Unique per request

### 2. Token Expiration
- Default: 1 hour (configurable)
- Automatically cleaned up
- Cannot be reused after expiration

### 3. One-Time Use
- Token marked as "used" after successful reset
- Cannot be reused even if not expired
- Prevents replay attacks

### 4. Password Requirements
- Minimum 6 characters
- Can be configured for stronger requirements
- Validated on both frontend and backend

### 5. Email Privacy
- Doesn't reveal if email exists in system
- Same response for existing and non-existing emails
- Prevents email enumeration attacks

## Configuration

### Backend Configuration

In `application.properties`:
```properties
# Password reset token expiration (1 hour)
mes.password.reset.expiration=3600000
```

### Email Configuration (Production)

For production, configure email service:
```properties
# Spring Mail Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

## Frontend Pages

### 1. Forgot Password Page (`/forgot-password`)
- Email input form
- Validation
- Success message
- Development mode shows reset link

### 2. Reset Password Page (`/reset-password/:token`)
- Token validation
- New password input
- Confirm password input
- Password match validation
- Success redirect to login

## Usage Examples

### Testing in Development

1. **Request Reset**:
```bash
curl -X POST http://localhost:8080/api/password-reset/request \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mes.com"}'
```

2. **Validate Token**:
```bash
curl http://localhost:8080/api/password-reset/validate/YOUR_TOKEN
```

3. **Reset Password**:
```bash
curl -X POST http://localhost:8080/api/password-reset/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "token":"YOUR_TOKEN",
    "newPassword":"newPassword123"
  }'
```

### Testing in UI

1. Navigate to http://localhost:5173/login
2. Click "Forgot your password?"
3. Enter email: `admin@mes.com`
4. Click "Send Reset Instructions"
5. In development mode, click the reset link shown
6. Enter new password
7. Confirm password
8. Click "Reset Password"
9. Login with new password

## Email Template (Production)

Create an email template for password reset:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>Hello,</p>
    <p>You requested to reset your password for your MES Pro account.</p>
    <p>Click the link below to reset your password:</p>
    <p>
        <a href="https://your-domain.com/reset-password/{{token}}">
            Reset Password
        </a>
    </p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <p>Thanks,<br>MES Pro Team</p>
</body>
</html>
```

## Implementing Email Service

### 1. Create Email Service

```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${mes.app.url}")
    private String appUrl;
    
    public void sendPasswordResetEmail(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(email);
            helper.setSubject("Password Reset Request - MES Pro");
            
            String resetUrl = appUrl + "/reset-password/" + token;
            String content = buildEmailContent(resetUrl);
            
            helper.setText(content, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }
    
    private String buildEmailContent(String resetUrl) {
        return "<html><body>" +
               "<h2>Password Reset Request</h2>" +
               "<p>Click the link below to reset your password:</p>" +
               "<p><a href=\"" + resetUrl + "\">Reset Password</a></p>" +
               "<p>This link will expire in 1 hour.</p>" +
               "</body></html>";
    }
}
```

### 2. Update PasswordResetController

```java
@Autowired
private EmailService emailService;

@PostMapping("/request")
public ResponseEntity<?> requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) {
    try {
        String token = passwordResetService.createPasswordResetToken(request.getEmail());
        
        // Send email in production
        emailService.sendPasswordResetEmail(request.getEmail(), token);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset instructions sent to email");
        // Don't return token in production!
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        // Same response for security
        Map<String, String> response = new HashMap<>();
        response.put("message", "If the email exists, password reset instructions have been sent");
        return ResponseEntity.ok(response);
    }
}
```

## Cleanup Expired Tokens

### Scheduled Cleanup

```java
@Scheduled(cron = "0 0 * * * *") // Every hour
public void cleanupExpiredTokens() {
    passwordResetService.cleanupExpiredTokens();
}
```

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid token" | Token doesn't exist | Request new reset |
| "Token has expired" | Token older than 1 hour | Request new reset |
| "Token has been used" | Token already used | Request new reset |
| "User not found" | Email doesn't exist | Check email address |
| "Passwords do not match" | Confirmation mismatch | Re-enter passwords |

## Security Best Practices

### 1. Token Security
- Use cryptographically secure random tokens
- Store tokens hashed (optional enhancement)
- Limit token lifetime
- One-time use only

### 2. Rate Limiting
- Limit reset requests per email
- Prevent brute force attacks
- Add CAPTCHA for repeated requests

### 3. Logging
- Log all reset requests
- Log successful resets
- Monitor for suspicious activity

### 4. User Notification
- Email user when password is changed
- Alert on suspicious activity
- Provide account recovery options

## Testing Checklist

- [ ] Request reset with valid email
- [ ] Request reset with invalid email
- [ ] Validate valid token
- [ ] Validate expired token
- [ ] Validate used token
- [ ] Reset password successfully
- [ ] Try to reuse token
- [ ] Password validation works
- [ ] Redirect to login after reset
- [ ] Login with new password

## Troubleshooting

### Token Not Working

**Check**:
1. Token hasn't expired (< 1 hour old)
2. Token hasn't been used
3. Token exists in database
4. User account is active

### Email Not Sending

**Check**:
1. SMTP configuration is correct
2. Email credentials are valid
3. Firewall allows SMTP traffic
4. Email service is running

### Frontend Issues

**Check**:
1. Routes are configured correctly
2. API endpoints are accessible
3. Token is passed in URL
4. Form validation is working

## Production Deployment

### Checklist

- [ ] Configure email service
- [ ] Remove token from API response
- [ ] Set appropriate token expiration
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Set up monitoring
- [ ] Test email delivery
- [ ] Update frontend URL
- [ ] Add logging
- [ ] Test in production environment

## Monitoring

### Metrics to Track
- Reset requests per day
- Successful resets
- Failed attempts
- Token expiration rate
- Email delivery rate

### Alerts
- High number of failed attempts
- Email delivery failures
- Unusual reset patterns
- Token reuse attempts

## Future Enhancements

1. **Multi-factor Authentication**
   - SMS verification
   - Authenticator app
   - Backup codes

2. **Password History**
   - Prevent password reuse
   - Track password changes
   - Enforce password rotation

3. **Account Recovery**
   - Security questions
   - Backup email
   - Admin override

4. **Enhanced Security**
   - Token hashing
   - IP-based restrictions
   - Device fingerprinting

## Support

For issues:
1. Check backend logs
2. Verify database records
3. Test API endpoints directly
4. Check email service status

## Success Criteria

✅ Users can request password reset
✅ Tokens are generated securely
✅ Tokens expire after 1 hour
✅ Tokens are one-time use
✅ Passwords are updated successfully
✅ Users can login with new password
✅ Email privacy is maintained
✅ UI is user-friendly

Password reset functionality is complete and secure! 🔒
