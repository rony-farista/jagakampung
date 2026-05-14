# Environment Configuration Guide

## Backend (`backend/.env`)

Salin file `.env.example` ke `.env` dan isi dengan data yang sesuai:

```bash
cp .env.example .env
```

### Konfigurasi Wajib

```env
# PostgreSQL Database
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/rt_app_db?schema=public"

# JWT Secret (ganti dengan string acak yang panjang dan kuat)
JWT_SECRET="ganti-ini-dengan-string-sangat-panjang-dan-acak-min-32-karakter"
JWT_EXPIRE="7d"

# Port server
PORT=5000
NODE_ENV=development
```

### Konfigurasi Cloudinary (untuk upload foto)
Daftar gratis di https://cloudinary.com

```env
CLOUDINARY_CLOUD_NAME="nama_cloud_anda"
CLOUDINARY_API_KEY="api_key_anda"
CLOUDINARY_API_SECRET="api_secret_anda"
```

### CORS
```env
CLIENT_URL="http://localhost:8081"
```

---

## Setup Database PostgreSQL

### Opsi 1: Lokal (development)
1. Install PostgreSQL: https://www.postgresql.org/download/
2. Buat database:
```sql
CREATE DATABASE rt_app_db;
```
3. Set `DATABASE_URL` di `.env`

### Opsi 2: Supabase (cloud gratis - Recommended)
1. Daftar di https://supabase.com
2. Buat project baru
3. Pergi ke Settings → Database → Connection String
4. Salin URI dan masukkan ke `DATABASE_URL`

### Opsi 3: Neon (cloud gratis)
1. Daftar di https://neon.tech
2. Buat project dan database
3. Salin connection string ke `DATABASE_URL`

### Opsi 4: Railway
1. Daftar di https://railway.app
2. New Project → Add PostgreSQL
3. Salin `DATABASE_URL` dari Variables tab

---

## Jalankan Migrasi & Seed

```bash
cd backend

# 1. Generate Prisma Client
npx prisma generate

# 2. Buat tabel di database
npx prisma migrate dev --name init

# 3. Isi data awal (admin, warga contoh, jenis iuran)
npm run prisma:seed
```

### Akun Default (setelah seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rt.com | admin123 |
| Bendahara | bendahara@rt.com | bendahara123 |
| Warga | budi@gmail.com | warga123 |

---

## Mobile App - API URL

Edit file `mobile/services/api.ts`:

```typescript
// Development (emulator Android)
const API_URL = 'http://10.0.2.2:5000/api';

// Development (iOS simulator / Web)
const API_URL = 'http://localhost:5000/api';

// Production
const API_URL = 'https://your-backend-domain.com/api';
```

---

## Production Deployment

### Backend ke Railway
1. Push code ke GitHub
2. Buat project di Railway, connect repo
3. Tambah environment variables
4. Railway otomatis deploy

### Backend ke VPS/Server
```bash
# Install Node.js & PM2
npm install -g pm2

# Clone & setup
git clone <repo>
cd backend
npm install
cp .env.example .env  # Edit .env
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed

# Start dengan PM2
pm2 start server.js --name rt-app-backend
pm2 save
pm2 startup
```

### Mobile Web ke Vercel
```bash
cd mobile
npx expo export --platform web
# Upload folder dist/ ke Vercel
```

### Android APK (Expo EAS)
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

### iOS IPA (Expo EAS - butuh Apple Developer Account)
```bash
eas build --platform ios --profile preview
```
