# CivicResolve - AI-Based Civic Issue Resolution System

A modern full-stack web application for reporting, tracking, and resolving civic issues (potholes, garbage, streetlights, etc.) in municipalities.

## 🚀 Quick Start

Get the app running in 5 minutes:

```bash
# Setup backend
cd backend
npm install
npm run db:setup
npm run dev

# In another terminal, setup frontend
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

**For detailed instructions, see [QUICK_START.md](./QUICK_START.md)**

## 📋 Features

### User Management
- ✅ User registration and authentication
- ✅ JWT-based secure sessions
- ✅ User profile management
- ✅ User data export

### Complaint Management
- ✅ Report civic issues with title, description, and location
- ✅ Attach images to complaints (up to 3 files, 5MB each)
- ✅ Track complaint status (Pending → In Progress → Resolved)
- ✅ View all personal complaints
- ✅ Filter by category or status

### Categories
- ✅ Pre-defined issue categories (Potholes, Garbage, Streetlights, etc.)
- ✅ Category statistics
- ✅ Dynamic category loading from database

### Security
- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Rate limiting on auth endpoints
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Security headers (Helmet.js)
- ✅ SQL injection prevention (Prisma ORM)

## 📁 Project Structure

```
AI-Civic-Issue-Resolution-System/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth, validation, etc.
│   │   ├── services/           # Business logic
│   │   ├── config/             # Configuration
│   │   └── app.js              # Express app
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.js             # Sample data
│   ├── scripts/                # Testing & utilities
│   └── package.json
├── src/                        # React frontend
│   ├── pages/                  # Page components
│   ├── api.js                  # API client
│   ├── App.jsx                 # Main component
│   └── main.jsx                # Entry point
├── QUICK_START.md              # 5-minute setup
├── DEMO_GUIDE.md               # Complete guide
├── INTEGRATION_TESTS.md        # Testing guide
├── TESTING_SUMMARY.md          # Test summary
└── README.md                   # This file
```

## 🛠️ Tech Stack

### Frontend
- **React 19.2.8** - UI library
- **React Router 7.18.4** - Client routing
- **Vite 8.3.0** - Build tool
- **CSS3** - Styling

### Backend
- **Node.js 18+** - Runtime
- **Express 4.18.2** - Web framework
- **PostgreSQL 12+** - Database
- **Prisma 5.6.0** - ORM
- **JWT** - Authentication
- **Multer** - File uploads
- **Helmet** - Security headers
- **Express-validator** - Input validation

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** - Complete setup and feature walkthrough
- **[INTEGRATION_TESTS.md](./INTEGRATION_TESTS.md)** - Testing guide and verification
- **[TESTING_SUMMARY.md](./TESTING_SUMMARY.md)** - Test results and status
- **[backend/docs/](./backend/docs/)** - API and database documentation

## 🧪 Testing

### Run All Tests
```bash
cd backend
node scripts/test-all-endpoints.js
```

### Run Specific Tests
```bash
cd backend

# Test authentication
node scripts/test-auth.js

# Test complaints
node scripts/test-complaints.js

# Test categories
node scripts/test-categories.js

# Test file uploads
node scripts/test-upload.js

# Test security
node scripts/test-security.js
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login user
POST   /api/auth/refresh         # Refresh token
POST   /api/auth/logout          # Logout user
```

### Users
```
GET    /api/users/me             # Get profile
PUT    /api/users/me             # Update profile
DELETE /api/users/me             # Delete account
GET    /api/users/me/stats       # Get stats
GET    /api/users/me/export      # Export data
```

### Categories
```
GET    /api/categories           # List categories
GET    /api/categories/:id       # Get category
GET    /api/categories/stats     # Get stats
```

### Complaints
```
POST   /api/complaints           # Submit complaint
GET    /api/complaints/:id       # Get complaint
GET    /api/complaints/user/:id  # Get user complaints
GET    /api/complaints/stats     # Get stats
POST   /api/complaints/:id/images      # Add image
DELETE /api/complaints/images/:id      # Delete image
PATCH  /api/complaints/:id/status      # Update status
```

See [DEMO_GUIDE.md](./DEMO_GUIDE.md) for detailed API documentation.

## 🚀 Deployment

### Prerequisites for Deployment
- PostgreSQL database on production server
- Node.js runtime
- HTTPS/SSL certificate
- Environment variables configured

### Pre-deployment Checklist
- [ ] Change JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Enable HTTPS
- [ ] Setup monitoring and logging
- [ ] Configure email service
- [ ] Test all endpoints
- [ ] Security audit

See [DEMO_GUIDE.md](./DEMO_GUIDE.md#deployment-checklist) for detailed deployment instructions.

## 📊 API Status

**26 Endpoints Tested ✅**

- Health check: ✅
- Authentication (4): ✅
- Categories (3): ✅
- Users (5): ✅
- Complaints (9): ✅
- Security: ✅
- Rate limiting: ✅

## 🔐 Security Features

- ✅ JWT authentication
- ✅ Password hashing (bcryptjs)
- ✅ Rate limiting
- ✅ CORS whitelisting
- ✅ Input validation & sanitization
- ✅ Security headers (Helmet)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Token expiry

## 🆘 Troubleshooting

### Backend won't start?
```bash
# Check PostgreSQL is running
psql -U postgres -c "SELECT 1;"

# Check database exists
createdb -U postgres civicresolve

# Check environment variables
cat backend/.env
```

### Frontend won't connect?
```bash
# Verify backend is running
curl http://localhost:3000/api/health

# Check CORS origin in backend/.env
# Should be: http://localhost:5173
```

### Tests failing?
```bash
# Ensure backend is running first
cd backend && npm run dev

# Then run tests in another terminal
node scripts/test-all-endpoints.js
```

See [DEMO_GUIDE.md](./DEMO_GUIDE.md#troubleshooting) for more troubleshooting tips.

## 🤝 Contributing

1. Follow the existing code structure
2. Add tests for new features
3. Ensure all tests pass
4. Update documentation
5. Submit pull request

## 📝 License

MIT - See LICENSE file for details

## 📞 Support

- Read [DEMO_GUIDE.md](./DEMO_GUIDE.md) for complete documentation
- Check backend logs: `tail -f backend/logs/combined.log`
- Review API docs: `backend/docs/`

## 🎯 Project Status

**✅ Production Ready for Internal Staging**

All features implemented, tested, and documented. Ready for:
- Internal testing
- Staging deployment
- User acceptance testing
- Production deployment

---

**Last Updated:** September 2026  
**Version:** 1.0.0-beta  
**Status:** ✅ Complete and Tested
