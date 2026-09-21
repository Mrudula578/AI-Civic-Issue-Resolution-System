# Database Setup Guide

This guide explains how to set up the PostgreSQL database for CivicResolve backend.

## Prerequisites

1. PostgreSQL installed and running on your system
2. Database user with CREATE DATABASE privileges

## Setup Steps

### 1. Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Or install via Chocolatey: `choco install postgresql`
- Or install via Scoop: `scoop install postgresql`

**macOS:**
- Install via Homebrew: `brew install postgresql`
- Or download from: https://www.postgresql.org/download/macosx/

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### 2. Start PostgreSQL Service

**Windows:**
- Start via Services app: Search for "Services" → Find "postgresql" → Start
- Or via command line: `net start postgresql-x64-14` (version may vary)

**macOS:**
```bash
brew services start postgresql
```

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3. Create Database and User

Connect to PostgreSQL as superuser:

```bash
# Connect as postgres user
psql -U postgres

# Create database
CREATE DATABASE civicresolve;

# Create user (optional, or use postgres user)
CREATE USER civicuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE civicresolve TO civicuser;

# Exit psql
\q
```

### 4. Update Environment Variables

Update your `.env` file with the correct database connection:

```env
# For postgres user
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/civicresolve

# Or for custom user
DATABASE_URL=postgresql://civicuser:your_password@localhost:5432/civicresolve
```

### 5. Run Migrations and Seed

Once PostgreSQL is running and configured:

```bash
# Run database migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

### 6. Verify Setup

```bash
# Open Prisma Studio to view data
npm run prisma:studio
```

## Troubleshooting

### Connection Issues

1. **Port 5432 already in use:**
   - Check if PostgreSQL is already running on a different port
   - Update DATABASE_URL with correct port

2. **Authentication failed:**
   - Verify username/password in DATABASE_URL
   - Check pg_hba.conf for authentication settings

3. **Database doesn't exist:**
   - Create the database manually as shown above
   - Or run `createdb civicresolve` from command line

### Alternative: Docker PostgreSQL

If you prefer Docker:

```bash
# Run PostgreSQL in Docker
docker run --name postgres-civicresolve \
  -e POSTGRES_DB=civicresolve \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Update .env
DATABASE_URL=postgresql://postgres:password@localhost:5432/civicresolve
```

## Current Schema

The database includes these tables:
- `municipalities` - Municipal authorities
- `users` - System users (citizens, authorities, admins)
- `categories` - Issue categories (Pothole, Garbage, etc.)
- `complaints` - Civic issue reports
- `complaint_images` - Attached images for complaints
- `refresh_tokens` - JWT refresh token storage

## Seed Data

The seed script creates:
- 1 default municipality
- 6 issue categories with icons