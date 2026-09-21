# CivicResolve Backend

Backend API for the CivicResolve civic issue resolution system.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install and setup PostgreSQL:
   - See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for detailed instructions

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials

5. Check database connection:
```bash
npm run db:check
```

6. Setup database (run migrations and seed):
```bash
npm run db:setup
```

7. Start development server:
```bash
npm run dev
```

## API Documentation

The server runs on `http://localhost:3000` by default.

Health check: `GET /api/health`

## Scripts

- `npm run dev` - Start development server with nodemon
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run db:check` - Test database connection
- `npm run db:setup` - Run migrations and seed data
- `npm run prisma:migrate` - Run database migrations only
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with initial data
- `npm run prisma:reset` - Reset database (dev only)

## Database

This project uses PostgreSQL with Prisma ORM. See [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md) for setup instructions.