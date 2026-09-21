# Security Hardening Documentation

## Overview

This document outlines all security measures implemented in the CivicResolve backend API.

## 1. Input Validation & Sanitization

### XSS Prevention
- **HTML Sanitization**: All user input is sanitized using DOMPurify to remove potentially dangerous HTML/JavaScript
- **Input Validation**: Custom validators check for XSS patterns before processing
- **Content Security Policy**: CSP headers prevent execution of inline scripts

### SQL Injection Prevention
- **Parameterized Queries**: Prisma ORM uses parameterized queries by default
- **Input Pattern Detection**: Detects SQL keywords and dangerous patterns in user input
- **Field Validation**: Type and format validation prevents malicious data

### Implementation Details
```javascript
// XSS detection
if (containsXssPatterns(input)) {
  throw new Error('Potentially dangerous content detected');
}

// SQL injection detection
if (containsSqlInjectionPatterns(input)) {
  throw new Error('Potentially dangerous SQL patterns detected');
}

// Input sanitization
const clean = sanitizeInput(userInput);
```

## 2. Authentication & Authorization

### Password Security
- **Minimum Length**: 12 characters (increased from 8)
- **Complexity Requirements**:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character (@$!%*?&)
- **Common Pattern Detection**: Blocks passwords containing common patterns (password, qwerty, admin, etc.)
- **Bcrypt Hashing**: Passwords hashed with bcrypt using 12 rounds (takes ~250ms per hash)

### JWT Token Security
- **Token Validation**: Structure validation before processing
- **Algorithm Specificity**: Explicitly set HS256 algorithm
- **Issued At (iat) Claim**: Timestamp included to prevent old token replay
- **Short Expiry**: Access tokens expire in 15 minutes
- **Refresh Token Rotation**: New refresh tokens generated on login/refresh
- **Token Blacklisting Ready**: Infrastructure in place for token revocation

### Brute Force Protection
- **Progressive Delays**: Authentication delays increase with each failed attempt
- **Rate Limiting**: 10 auth attempts per 15 minutes per IP
- **Failed Attempt Tracking**: Logs and monitors failed login attempts
- **Account Lockout**: Automatic temporary lockout after 5 failed attempts

### Session Security
- **HTTPS Only**: Cookies marked as Secure (in production)
- **HttpOnly Flag**: Prevents JavaScript access to tokens
- **SameSite Protection**: CSRF protection via SameSite cookie attribute
- **Session Activity Validation**: Checks for impossible travel and unusual patterns

## 3. Rate Limiting & DDoS Protection

### Rate Limiters Implemented

| Limiter | Limit | Window | Purpose |
|---------|-------|--------|---------|
| General | 100 requests | 15 minutes | Overall API protection |
| Auth | 10 requests | 15 minutes | Authentication endpoints |
| Upload | 5 uploads | 1 hour | File upload protection |
| Complaint | 10 submissions | 24 hours | Complaint spam prevention |
| Search | 30 requests | 1 minute | Search abuse prevention |
| Strict | 5 requests | 1 hour | Sensitive operations |

### Implementation
```javascript
// Complaint submission limiter
router.post(
  '/',
  authenticate,
  complaintSubmitLimiter, // 10 per day per user
  uploadLimiter,
  validateComplaintSubmission,
  ComplaintController.submitComplaint
);
```

## 4. Security Headers

### Helmet.js Configuration

**Content Security Policy (CSP)**
```
default-src 'self'
style-src 'self' 'unsafe-inline'
script-src 'self'
img-src 'self' data: https:
connect-src 'self'
object-src 'none'
frame-src 'none'
```

**Other Headers**
- `X-Content-Type-Options: nosniff` - Prevent MIME type sniffing
- `X-Frame-Options: DENY` - Prevent clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS filter
- `Strict-Transport-Security: max-age=31536000` - HTTPS enforcement (1 year)
- `Referrer-Policy: strict-origin-when-cross-origin` - Referrer control
- `Permissions-Policy: geolocation=(), microphone=(), camera=()` - Feature control

## 5. Request & Response Security

### Request Size Limits
- JSON body: 1MB maximum
- URL-encoded body: 1MB maximum
- Query parameters: Maximum 50 parameters
- File uploads: 5MB per file, max 3 files per complaint

### CORS Configuration
- Whitelist specific origins (not *)
- Credentials: true (when needed)
- Methods: GET, POST, PUT, PATCH, DELETE
- Expose rate limit headers
- Max age: 24 hours

### Error Handling
- **Sensitive Data Masking**: Stack traces and detailed errors only in development
- **Generic Messages**: Production returns generic error messages
- **No Information Leakage**: Doesn't reveal whether email exists or password was wrong
- **Detailed Logging**: Full error details logged server-side

## 6. Database Security

### Prisma ORM Benefits
- Built-in SQL injection prevention via parameterized queries
- Type-safe database operations
- Automatic escaping of all inputs

### Best Practices Implemented
- Migrations tracked and versioned
- No raw SQL queries (all through ORM)
- Sensitive data not logged (passwords, tokens masked)
- Database connection pooling

## 7. File Upload Security

### Validation
- **MIME Type Checking**: Validates image/jpeg, image/png, image/webp
- **File Extension Validation**: Only .jpg, .jpeg, .png, .webp allowed
- **Size Limits**: 5MB per file, 3 files per complaint
- **Filename Sanitization**: Removes path traversal attempts, special characters

### Storage Security
- Files stored outside web root (not directly accessible)
- Unique filenames via UUID (prevents enumeration)
- No execution permissions on upload directory
- Served via static middleware with proper headers

## 8. Logging & Monitoring

### Security Events Logged
- Failed login attempts
- Successful authentications
- Failed authorization checks
- Rate limit violations
- Validation failures
- Unusual patterns detected

### Log Security
- Sensitive data masked (passwords, tokens, email partial masking)
- IP addresses logged for security events
- User agents logged for session monitoring
- Error details logged server-side only

### Log Format
```json
{
  "level": "warn",
  "eventType": "failed_login",
  "email": "us**@example.com",
  "ip": "192.168.1.1",
  "timestamp": "2026-09-21T10:00:00Z"
}
```

## 9. Environment Variables

### Critical Variables
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=<strong-random-string-32+-chars>
JWT_REFRESH_SECRET=<strong-random-string-32+-chars>
STORAGE_PROVIDER=local|supabase
```

### Validation
- All required env vars checked at startup
- Invalid configs prevent server start
- No defaults for sensitive values

## 10. API Security Best Practices

### Authentication Flow
```
1. User registers → Password validated → Hashed with bcrypt
2. User logs in → Credentials verified → JWT tokens issued
3. API requests → Token validated → User identified
4. Token expires → Refresh token used → New access token issued
5. User logs out → Refresh token deleted → Session terminated
```

### Authorization
- Role-based access control (RBAC)
- Citizen: Read own data, submit complaints
- Authority: Read/update complaints in municipality
- Admin: Full system access
- Ownership validation for user-specific resources

## 11. CSRF Protection

### Implementation
- SameSite cookie attribute set to 'strict'
- Origin header validation
- CORS properly configured
- Token generation available for protected forms

## 12. Dependency Security

### Critical Dependencies
- `express`: Web framework
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT tokens
- `isomorphic-dompurify`: XSS prevention
- `express-rate-limit`: Rate limiting
- `helmet`: Security headers
- `@prisma/client`: Database ORM

### Maintenance
- Regular dependency updates
- Security audit with npm audit
- Lock file committed for reproducibility

## 13. Security Checklist

### Implemented ✅
- [x] Password hashing with bcrypt
- [x] JWT token validation
- [x] Rate limiting (multiple levels)
- [x] XSS prevention (input sanitization + CSP)
- [x] SQL injection prevention (ORM + validation)
- [x] CSRF protection
- [x] Security headers (Helmet.js)
- [x] CORS configuration
- [x] File upload validation
- [x] Error handling (no info leakage)
- [x] Logging and monitoring
- [x] Authentication flow
- [x] Authorization checks
- [x] Input validation
- [x] Brute force protection

### Not Implemented (Future)
- [ ] Redis for session management
- [ ] IP whitelisting/blacklisting
- [ ] 2FA/MFA support
- [ ] OAuth2/SSO integration
- [ ] API key authentication
- [ ] Request signing
- [ ] End-to-end encryption
- [ ] Audit trail for sensitive operations

## 14. Deployment Security

### Production Checklist
- [ ] HTTPS/TLS enabled
- [ ] HSTS header set
- [ ] Database encrypted at rest
- [ ] Backups encrypted
- [ ] Firewall rules configured
- [ ] WAF (Web Application Firewall) enabled
- [ ] DDoS protection active
- [ ] Logging aggregated and retained
- [ ] Regular security audits scheduled
- [ ] Incident response plan in place

## 15. Testing Security

### Manual Testing
```bash
# Test XSS prevention
curl -X POST http://localhost:3000/api/complaints \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(1)</script>",
    "description": "Test",
    "locationText": "Test",
    "categoryId": "uuid"
  }'
# Should be sanitized or rejected

# Test SQL injection detection
curl -X POST http://localhost:3000/api/complaints \
  -H "Authorization: Bearer <token>" \
  -d 'title=Title&description=Test; DROP TABLE users;'
# Should be rejected

# Test rate limiting
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# 11th request should get 429 Too Many Requests
```

### Automated Testing
- Unit tests for validation functions
- Integration tests for auth flow
- Security regression tests
- Rate limit verification tests

## 16. Security Updates & Patches

### Procedure
1. Monitor security advisories (npm, GitHub, OWASP)
2. Test patches in development
3. Deploy patches quickly
4. Monitor for issues
5. Document changes

### Contact
For security issues, please report privately to: security@civicresolve.local

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/sp800-63b.html)

## Conclusion

This API implements defense-in-depth security with multiple layers of protection. However, security is an ongoing process. Regular audits, updates, and monitoring are essential for maintaining a secure system.