# Quick Start - CivicResolve in 5 Minutes

## Prerequisites Check

```bash
node --version      # Should be v18+
npm --version       # Should be v9+
psql --version      # PostgreSQL v12+
```

## Step 1: Create Database (1 minute)

```bash
# Create PostgreSQL database
createdb -U postgres civicresolve
```

## Step 2: Setup Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup database
npm run db:setup

# Start server (leave running)
npm run dev
```

✅ Backend running at http://localhost:3000

## Step 3: Setup Frontend (1 minute)

**Open a NEW terminal while backend keeps running**

```bash
# Navigate to project root
cd ..

# Install dependencies
npm install

# Start dev server
npm run dev
```

✅ Frontend running at http://localhost:5173

## Step 4: Test It! (1 minute)

1. Open http://localhost:5173 in your browser
2. Click "Register" and create an account
3. Fill in the form and submit a complaint
4. Click "My Complaints" to see your submission
5. Try the logout button

## Success! 🎉

Your full-stack civic issue platform is running!

### Next Steps

- Run tests: `cd backend && node scripts/test-all-endpoints.js`
- Read full guide: See `DEMO_GUIDE.md`
- Check logs: `tail -f backend/logs/combined.log`

### Troubleshooting

**Backend won't start?**
- Ensure PostgreSQL is running: `psql -U postgres -c "SELECT 1;"`
- Check port 3000 is free: `netstat -ano | findstr :3000`

**Frontend won't load?**
- Clear browser cache: `Ctrl+Shift+Delete` then reload
- Check console for errors: `F12 → Console tab`

**Database errors?**
- Reset database: `cd backend && npm run prisma:reset`
- Reseed: `npm run prisma:seed`

**Still stuck?**
See DEMO_GUIDE.md Troubleshooting section for more help.
