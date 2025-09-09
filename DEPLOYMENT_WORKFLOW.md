# Deployment Workflow - Database Schema Sync

## Overview
Proyek ini sekarang menggunakan **Prisma Migrations** untuk memastikan schema database development otomatis tersinkronisasi dengan production saat deploy ke Vercel.

## Workflow Development ke Production

### 1. Development Workflow (Lokal)
```bash
# Saat mengubah schema di prisma/schema.prisma
npx prisma migrate dev --name describe_your_changes

# Atau gunakan script yang sudah ada
pnpm prisma:migrate
```

### 2. Production Deployment (Otomatis)
Saat push ke branch main/production:
1. Vercel akan menjalankan build command
2. Build command otomatis menjalankan:
   - `prisma migrate deploy` - Apply pending migrations ke production DB
   - `prisma generate` - Generate Prisma Client
   - `next build` - Build aplikasi Next.js

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

## Best Practices

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

## Troubleshooting

### Migration Conflict
```bash
# Reset development database
npx prisma migrate reset --force

# Generate new migration
npx prisma migrate dev --name fix_conflict
```

### Production Migration Failed
1. Check Vercel build logs
2. Verify `DATABASE_URL` di environment variables
3. Check migration files di `prisma/migrations/`
4. Manual deploy jika perlu:
   ```bash
   DATABASE_URL="production_url" npx prisma migrate deploy
   ```

## Monitoring
- Vercel build logs akan menunjukkan migration status
- Gunakan `prisma studio` untuk verify schema changes
- Check Neon dashboard untuk database status

---

**Sekarang setiap kali deploy ke Vercel, schema production akan otomatis mengikuti development branch! 🚀**