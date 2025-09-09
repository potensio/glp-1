# Database Deployment Workflow

This document outlines the **solid deployment flow** that ensures database schema is automatically updated on every deployment to staging and production.

## Overview

We use **Prisma Migrations** for a consistent, automated database deployment workflow that:
- ✅ Automatically updates database schema on every deployment
- ✅ Maintains schema consistency across all environments
- ✅ Provides rollback capabilities
- ✅ Tracks all database changes with version control
- ✅ Prevents schema drift between environments

## 🚀 Solid Deployment Flow

### Automatic Schema Updates
Setiap deployment (staging atau production) **otomatis mengupdate database schema** melalui build process:

```bash
# Build script di package.json
"build": "prisma migrate deploy && prisma generate && next build"
```

### Development Workflow
1. **Ubah schema** di `prisma/schema.prisma`
2. **Generate migration**: `npm run prisma:migrate` atau `npx prisma migrate dev --name describe_changes`
3. **Test locally**: Migration otomatis dijalankan
4. **Commit & push**: Commit schema + migration files

### Deployment Workflow (Staging & Production)
1. **Push to repository**: Push ke branch yang di-deploy
2. **Vercel triggers build**: Otomatis trigger deployment
3. **🔄 Auto migration**: `prisma migrate deploy` dijalankan otomatis
4. **✅ Schema updated**: Database schema terupdate sesuai migration
5. **🚀 App deployed**: Aplikasi deploy dengan database terbaru

### Flow Guarantee
- ✅ **Zero manual intervention** - Semua otomatis
- ✅ **Schema always in sync** - Development = Staging = Production
- ✅ **Safe deployments** - Migration dijalankan sebelum build
- ✅ **Rollback ready** - Setiap perubahan tracked di migration files

## Scripts yang Tersedia

```json
{
  "prisma:migrate": "prisma migrate dev",           // Development migrations
  "prisma:migrate:deploy": "prisma migrate deploy", // Production migrations
  "prisma:generate": "prisma generate",             // Generate client
  "prisma:studio": "prisma studio",                 // Database GUI
  "prisma:push": "prisma db push"                   // Direct schema push (dev only)
}
```

## Perbedaan Penting

### ❌ Sebelumnya (Tidak Sync)
- Development: `prisma db push` (langsung push schema)
- Production: Hanya `prisma generate` (tidak ada migration)
- **Masalah**: Schema production tidak update otomatis

### ✅ Sekarang (Auto Sync)
- Development: `prisma migrate dev` (buat migration file)
- Production: `prisma migrate deploy` (apply migrations)
- **Solusi**: Schema production selalu sync dengan development

## Environment Variables
Pastikan `DATABASE_URL` di Vercel mengarah ke production database Neon:
```
DATABASE_URL="postgresql://username:password@ep-xxx.c-2.us-east-2.aws.neon.tech/dbname?sslmode=require"
```

## 🛡️ Best Practices untuk Solid Flow

### 1. Development Best Practices
```bash
# ✅ GOOD: Descriptive migration names
npx prisma migrate dev --name add_waitlist_table
npx prisma migrate dev --name update_user_preferences

# ❌ BAD: Generic names
npx prisma migrate dev --name update_schema
npx prisma migrate dev --name fix_db
```

### 2. Pre-Deployment Checklist
- ✅ Migration tested locally
- ✅ Schema changes committed
- ✅ Migration files committed
- ✅ Build script includes `prisma migrate deploy`
- ✅ Environment variables configured

### 3. Deployment Safety
- 🔄 **Automatic migrations** run before app build
- 📊 **Monitor deployment logs** for migration errors
- 🔙 **Rollback ready** - Keep previous deployment available
- 💾 **Database backups** - Neon automatically handles this

### 4. Environment Configuration
```bash
# Development (.env.local)
DATABASE_URL="postgresql://..."

# Production (Vercel Environment Variables)
DATABASE_URL="postgresql://..." # Same Neon database or separate
```

### 5. Migration Management
1. **Selalu buat migration untuk perubahan schema**:
   ```bash
   npx prisma migrate dev --name add_new_field
   ```

2. **Test migration di development dulu**:
   ```bash
   npx prisma migrate reset  # Reset development DB
   npx prisma migrate dev    # Apply all migrations
   ```

3. **Commit migration files**:
   - File di `prisma/migrations/` harus di-commit
   - Jangan edit migration files yang sudah ada

4. **Rollback jika diperlukan**:
   ```bash
   # Development
   npx prisma migrate reset
   
   # Production (manual via Neon Console)
   # Atau buat migration baru untuk revert changes
   ```

## 🔧 Troubleshooting Deployment Issues

### Common Issues & Solutions

#### 1. "Table does not exist" Error
```bash
# Problem: Missing migration file
# Solution: Create migration for missing table
npx prisma migrate dev --name add_missing_table
git add . && git commit -m "Add missing table migration"
git push
```

#### 2. Migration Conflicts
```bash
# Problem: Migration conflicts between developers
# Solution: Reset and reapply migrations
npx prisma migrate reset --force
npx prisma migrate dev --name fix_conflict
```

#### 3. Deployment Build Failures
```bash
# Check Vercel deployment logs for:
# - Migration errors
# - Database connection issues
# - Environment variable problems

# Manual fix if needed:
npx prisma migrate deploy
npx prisma generate
```

#### 4. Schema Drift Detection
```bash
# Check if local schema matches database
npx prisma db pull  # Pull current DB schema
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma --to-schema-datasource prisma/schema.prisma
```

### Emergency Procedures

#### Quick Fix for Production
```bash
# If deployment fails due to migration:
1. Check Vercel logs
2. Fix migration locally
3. Push fix immediately
4. Vercel auto-redeploys
```

#### Database Recovery
```bash
# Neon provides automatic backups
# Contact Neon support for point-in-time recovery if needed
```

## Monitoring
- Vercel build logs akan menunjukkan migration status
- Gunakan `prisma studio` untuk verify schema changes
- Check Neon dashboard untuk database status

---

**Sekarang setiap kali deploy ke Vercel, schema production akan otomatis mengikuti development branch! 🚀**