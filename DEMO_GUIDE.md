# CivicResolve - Full Stack Demonstration Guide

This guide explains how to run the complete CivicResolve system (Frontend + Backend) and demonstrates all features.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Database Setup](#database-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Running the Full Application](#running-the-full-application)
7. [Testing the Endpoints](#testing-the-endpoints)
8. [Feature Walkthrough](#feature-walkthrough)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** (comes with Node.js)
- **PostgreSQL** (v12 or higher) running locally
- **Git** (for version control)
- A code editor (VS Code recommended)

### Verify Installation

```bash
node --version      # Should be v18+
npm --version       # Should be v9+
psql --version      # Should show PostgreSQL version
```

---

## Project Structure

```
AI-Civic-Issue-Resolution-System/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── services/           # Business logic
│   │   ├── config/             # Configuration files
│   │   └── app.js              # Main Express app
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Database seeding script
│   ├── scripts/                # Testing scripts
│   ├── .env                    # Backend environment variables
│   └── package.json
├── src/                        # React frontend
│   ├── pages/                  # Page components (Home, Login, etc.)
│   ├── api.js                  # API client utility
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # Entry point
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite configuration
└── DEMO_GUIDE.md               # This file
```

---

## Database Setup

### Step 1: Create PostgreSQL Database

Open a terminal and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE civicresolve;

# Exit psql
\q
```

Or use a single command:

```bash
createdb -U postgres civicresolve
```

### Step 2: Verify Connection

Test the connection from your backend directory:

```bash
cd backend
npm run db:check
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

The `.env` file is already configured in the backend directory. Verify these settings:

```bash
# Backend/.env
PORT=3000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173

DATABASE_URL=postgresql://postgres:password@localhost:5432/civicresolve

JWT_ACCESS_SECRET=dev-jwt-access-secret-change-in-production-12345678901234567890
JWT_REFRESH_SECRET=dev-jwt-refresh-secret-change-in-production-09876543210987654321
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=5
MAX_FILES_PER_COMPLAINT=3
STORAGE_PROVIDER=local
```

**⚠️ Important:** Change the JWT secrets in production!

### Step 3: Setup Database and Seed Data

```bash
cd backend

# Run migrations and create tables
npm run prisma:migrate

# Seed the database with sample categories
npm run prisma:seed
```

You should see output like:
```
✓ Migrations executed
✓ Seeded categories (6 records)
✓ Database ready for development
```

### Step 4: Start the Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 3000
📍 Environment: development
🌐 CORS origin: http://localhost:5173
📁 Uploads served at: /uploads
🔒 Security headers enabled
```

The backend is now running at **http://localhost:3000**

---

## Frontend Setup

### Step 1: Install Dependencies

Open a new terminal (keep backend running):

```bash
cd <project-root>
npm install
```

### Step 2: Run the Frontend Development Server

```bash
cd <project-root>
npm run dev
```

You should see output like:
```
VITE v8.3.0  ready in 123 ms

➜  Local:   http://localhost:5173/
➜  Press h + enter to show help
```

The frontend is now running at **http://localhost:5173**

---

## Running the Full Application

### Quick Start (Terminal Commands)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Both should be running:
- Backend: http://localhost:3000
- Frontend: http://localhost:5173

### Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the CivicResolve home page with:
- Navigation bar (Home, Report Issue, My Complaints, Login)
- Hero section with call-to-action buttons
- Categories section showing issue types
- How it works section
- Footer

---

## Testing the Endpoints

### Option 1: Automatic Testing Script

Run the comprehensive endpoint test suite:

```bash
cd backend
node scripts/test-all-endpoints.js
```

This tests:
- ✓ Health check
- ✓ User registration
- ✓ User login
- ✓ Token refresh
- ✓ Categories listing
- ✓ User profile management
- ✓ Complaint submission
- ✓ Image upload
- ✓ Authentication & security
- ✓ Rate limiting

Expected output:
```
🧪 Starting Comprehensive Endpoint Tests

✓ [1] GET /api/health - Server is running
✓ [2] POST /api/auth/register - User registered successfully
✓ [3] POST /api/auth/login - User logged in successfully
... (more tests)

TEST SUMMARY
============================================================
✓ Passed:  25
✗ Failed:  0
⊘ Skipped: 3
📊 Total:  28
============================================================

✅ ALL TESTS PASSED
```

### Option 2: Manual Testing with cURL

Test individual endpoints:

```bash
# Health check
curl http://localhost:3000/api/health

# Get categories
curl http://localhost:3000/api/categories

# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Option 3: Postman Collection

Import this into Postman for interactive testing:

```json
{
  "info": {
    "name": "CivicResolve API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/health"
      }
    },
    {
      "name": "Get Categories",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/categories"
      }
    }
  ]
}
```

---

## Feature Walkthrough

### 1. User Registration

1. Navigate to http://localhost:5173/login
2. Click "Register" at the bottom
3. Fill in:
   - Full Name: Your name
   - Email: your-email@example.com
   - Password: Strong password (min 8 chars)
4. Click "Register"
5. You'll be redirected to home page (logged in)

**Backend Verification:**
```bash
# Check user in database
cd backend
npm run prisma:studio
# Navigate to User table and find your entry
```

### 2. Reporting an Issue

1. Click "Report Issue" in navigation or hero section
2. Fill in the form:
   - **Issue Title:** e.g., "Pothole on Main Street"
   - **Category:** Select from dropdown (auto-fetched from backend)
   - **Description:** Detailed description
   - **Location:** Specific location
   - **Images:** Upload 1-3 images (optional)
3. Click "Submit Complaint"
4. Success message appears

**What happens behind the scenes:**
- Complaint saved to database
- Images uploaded to `/backend/uploads/`
- Complaint linked to your user ID
- Status set to "PENDING"

### 3. Viewing Complaints

1. Click "My Complaints" in navigation
2. See all your submitted complaints with:
   - Complaint ID
   - Title and description
   - Category and location
   - Submission date
   - Current status (color-coded)

**Status Colors:**
- 🟨 Pending (Yellow)
- 🟦 In Progress (Blue)
- 🟩 Resolved (Green)

### 4. Authentication Features

**Automatic Auth Token:**
- Token stored in browser localStorage
- Sent with every authenticated request
- Automatically attached to "Authorization" header
- Refreshed when needed

**Login/Logout:**
- Click "Logout" in navbar when logged in
- Token removed from localStorage
- Redirected to home page
- Protected routes require re-login

### 5. API Integration

The frontend uses `src/api.js` for all backend communication:

```javascript
// Example: Submit complaint
const response = await apiClient.submitComplaint(
  {
    title: "Issue title",
    description: "Description",
    categoryId: "category-uuid",
    location: "Location"
  },
  [file1, file2] // Images
);

// Example: Get user's complaints
const complaints = await apiClient.getMyComplaints();

// Example: Logout
await apiClient.logout();
```

---

## API Endpoints Summary

### Authentication
```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/refresh           # Refresh token
POST   /api/auth/logout            # Logout user
```

### Users
```
GET    /api/users/me               # Get profile
PUT    /api/users/me               # Update profile
DELETE /api/users/me               # Delete account
GET    /api/users/me/stats         # Get user statistics
GET    /api/users/me/export        # Export user data
```

### Categories
```
GET    /api/categories             # List all categories
GET    /api/categories/:id         # Get specific category
GET    /api/categories/stats       # Get category statistics
```

### Complaints
```
POST   /api/complaints             # Submit new complaint
GET    /api/complaints/:id         # Get complaint by ID
GET    /api/complaints/user/:userId # Get user's complaints
GET    /api/complaints/stats       # Get complaint statistics
POST   /api/complaints/:id/images  # Add image to complaint
DELETE /api/complaints/images/:id  # Delete complaint image
PATCH  /api/complaints/:id/status  # Update complaint status (admin only)
```

---

## Backend Scripts

Helpful scripts available in the `backend` directory:

```bash
# Database
npm run db:check               # Check database connection
npm run db:setup               # Run migrations and seed

# Prisma
npm run prisma:migrate         # Run pending migrations
npm run prisma:studio          # Open Prisma Studio (visual DB browser)
npm run prisma:seed            # Seed database with sample data
npm run prisma:reset           # Reset database (⚠️ deletes all data)

# Testing
node scripts/test-all-endpoints.js      # Full test suite
node scripts/test-auth.js                # Authentication tests
node scripts/test-complaints.js          # Complaint endpoints
node scripts/test-categories.js          # Category endpoints
node scripts/test-user-endpoints.js      # User profile tests
node scripts/test-upload.js              # File upload tests
node scripts/test-security.js            # Security measures
```

---

## Troubleshooting

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Verify database exists
psql -U postgres -l | grep civicresolve

# Check DATABASE_URL in backend/.env
# Format: postgresql://username:password@localhost:5432/civicresolve
```

### Issue: Frontend can't connect to backend

**Solution:**
```bash
# Check backend is running
curl http://localhost:3000/api/health

# Verify FRONTEND_ORIGIN in backend/.env
# Should be: http://localhost:5173

# Check CORS headers
curl -H "Origin: http://localhost:5173" -v http://localhost:3000/api/health
```

### Issue: Token expired / "Unauthorized" errors

**Solution:**
```bash
# Clear browser localStorage
# In browser console:
localStorage.clear()

# Then logout and login again
```

### Issue: Cannot upload images

**Solution:**
```bash
# Ensure uploads directory exists
mkdir -p backend/uploads

# Check file permissions
chmod 755 backend/uploads

# Verify MAX_FILE_SIZE_MB in backend/.env (default: 5MB)
```

### Issue: Rate limiting blocking requests

**Solution:**
```bash
# Wait 15 minutes or restart the server
npm run dev  # in backend directory

# Rate limits reset on server restart
```

### Issue: "EADDRINUSE" - Port already in use

**Solution:**
```bash
# Kill process on port 3000 (backend)
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>

# Or use different ports in .env and vite.config.js
```

---

## Common Use Cases

### Create Test Data Quickly

```bash
cd backend
node -e "
const http = require('http');
const data = JSON.stringify({
  email: 'test@test.com',
  password: 'Test123!',
  name: 'Test User'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => { responseData += chunk; });
  res.on('end', () => console.log(JSON.parse(responseData)));
});

req.write(data);
req.end();
"
```

### Reset Database to Fresh State

```bash
cd backend

# Back up current database (optional)
pg_dump civicresolve > backup.sql

# Reset database
npm run prisma:reset
```

### Check Server Logs

```bash
# Backend logs written to backend/logs/
tail -f backend/logs/combined.log    # All logs
tail -f backend/logs/error.log       # Errors only
```

---

## Performance Monitoring

### Monitor Backend Performance

```bash
# Check memory and CPU usage
# Windows PowerShell
Get-Process node

# Mac/Linux
ps aux | grep "node src/app.js"
```

### Check Database Performance

```bash
cd backend
npm run prisma:studio
# Opens http://localhost:5555 with visual query tool
```

---

## Deployment Checklist

When ready to deploy to production:

- [ ] Change JWT_ACCESS_SECRET and JWT_REFRESH_SECRET in .env
- [ ] Set NODE_ENV=production
- [ ] Update FRONTEND_ORIGIN to production domain
- [ ] Use production PostgreSQL database
- [ ] Enable HTTPS/SSL
- [ ] Set up environment variables on server
- [ ] Run database migrations on production
- [ ] Setup automated backups
- [ ] Enable monitoring and logging
- [ ] Configure firewall rules
- [ ] Test all endpoints on production

---

## Support & Documentation

- Backend API Docs: `backend/docs/`
- Database Schema: `backend/prisma/schema.prisma`
- Security Info: `backend/docs/SECURITY.md`
- Database Setup: `backend/docs/DATABASE_SETUP.md`

---

## Next Steps

After running the demo:

1. **Explore the Code:** Review `src/api.js` and backend controllers
2. **Test More Features:** Try registering multiple users and complaints
3. **Review Security:** Check `backend/docs/SECURITY.md`
4. **Customize:** Modify UI in `src/pages/`, adjust backend logic in `backend/src/`
5. **Deploy:** Follow deployment checklist above

---

## Need Help?

1. Check logs: `tail -f backend/logs/combined.log`
2. Read error messages carefully
3. Verify environment variables
4. Ensure all services are running
5. Check database connection
6. Review API response status codes

Good luck! 🚀
