# Prisma + Neon Setup Guide

This guide explains how to set up and use Prisma with Neon PostgreSQL in this project.

## What's Included

- Prisma ORM for database access
- Neon PostgreSQL as the database provider
- NextAuth.js for authentication
- User authentication (login, signup, password reset)

## Setup Instructions

### 1. Create a Neon PostgreSQL Database

1. Sign up for a free account at [Neon](https://neon.tech/)
2. Create a new project
3. Create a new database
4. Get your connection string from the dashboard

### 2. Configure Environment Variables

Update the `.env` file with your Neon PostgreSQL connection string:

```
# For production with Neon PostgreSQL (uncomment and update)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET="your-nextauth-secret-key"
```

Replace the placeholder values with your actual Neon PostgreSQL credentials.

### 3. Generate Prisma Client

Run the following command to generate the Prisma client:

```bash
pnpm prisma:generate
```

### 4. Push the Schema to Your Database

Run the following command to push the schema to your database:

```bash
pnpm prisma:push
```

## Database Schema

The database schema includes the following models:

- `User`: Stores user information
- `Account`: Stores OAuth account information
- `Session`: Stores user sessions
- `VerificationToken`: Stores verification tokens for email verification

## Authentication Flow

1. **Sign Up**: Users can create an account with email and password
2. **Login**: Users can log in with email and password
3. **Password Reset**: Users can request a password reset link

## API Endpoints

- `/api/auth/[...nextauth]`: NextAuth.js authentication endpoints
- `/api/register`: User registration endpoint
- `/api/user`: User profile management endpoint

## Useful Commands

- `pnpm prisma:generate`: Generate Prisma client
- `pnpm prisma:migrate`: Run migrations in development
- `pnpm prisma:studio`: Open Prisma Studio to view and edit data
- `pnpm prisma:push`: Push schema changes to the database

## Troubleshooting

### Connection Issues

If you encounter connection issues with Neon PostgreSQL:

1. Verify your connection string is correct
2. Ensure your IP is allowed in Neon's IP restrictions
3. Check that SSL is properly configured (`sslmode=require`)

### Prisma Client Generation

If you encounter issues with Prisma client generation:

1. Delete the `node_modules/.prisma` folder
2. Run `pnpm prisma generate` again

## Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Neon Documentation](https://neon.tech/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)