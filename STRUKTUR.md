# 📂 Struktur Proyek - RT Warga & Iuran App

> Terakhir diupdate: 14 Mei 2026  
> Status: 17/42 todos selesai (40%)

---

## 🗂️ Overview Struktur

```
APP-MOBILE/
├── 📄 README.md                    # Dokumentasi utama proyek
├── 📄 .gitignore
├── 📁 backend/                     # ✅ Node.js + Express API
└── 📁 mobile/                      # 🚧 React Native (Expo) App
```

---

## 🖥️ Backend (`/backend`) — ✅ SELESAI

```
backend/
├── 📄 server.js                    # Entry point, semua routes di-register di sini
├── 📄 package.json                 # Dependencies backend
├── 📄 .env                         # Environment variables (tidak di-commit)
├── 📄 .env.example                 # Template .env untuk setup baru
├── 📄 .gitignore
├── 📄 README.md
│
├── 📁 prisma/
│   └── 📄 schema.prisma            # ✅ Definisi semua model database
│       ├── model User              # Data warga (id, name, nik, kk, address, phone, email, role, photo)
│       ├── model PaymentType       # Jenis iuran (name, amount, frequency)
│       ├── model Payment           # Transaksi iuran (userId, paymentTypeId, amount, month, year, status)
│       └── model Announcement      # Pengumuman RT (title, content, image, isPinned)
│
├── 📁 config/
│   └── 📄 prisma.js                # ✅ Singleton Prisma Client dengan connection handling
│
├── 📁 middleware/
│   ├── 📄 auth.js                  # ✅ JWT verification, attach user ke request
│   └── 📄 roleCheck.js             # ✅ Role-based access (ADMIN, BENDAHARA, USER)
│
├── 📁 utils/
│   └── 📄 jwt.js                   # ✅ generateToken() dan verifyToken()
│
├── 📁 controllers/                 # ✅ Business logic (semua selesai)
│   ├── 📄 authController.js        # Register, Login, GetMe
│   ├── 📄 userController.js        # CRUD users, change password
│   ├── 📄 paymentTypeController.js # CRUD jenis iuran
│   ├── 📄 paymentController.js     # CRUD iuran, stats, unpaid residents
│   └── 📄 announcementController.js # CRUD pengumuman
│
└── 📁 routes/                      # ✅ API routing (semua selesai)
    ├── 📄 auth.js                  # POST /api/auth/register, /login | GET /api/auth/me
    ├── 📄 users.js                 # GET/PUT/DELETE /api/users/:id
    ├── 📄 paymentTypes.js          # GET/POST/PUT/DELETE /api/payment-types
    ├── 📄 payments.js              # GET/POST/PUT/DELETE /api/payments + /stats + /unpaid
    └── 📄 announcements.js         # GET/POST/PUT/DELETE /api/announcements
```

### 📡 API Endpoints

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/api/auth/register` | Public | Register user baru |
| POST | `/api/auth/login` | Public | Login, return JWT token |
| GET | `/api/auth/me` | All roles | Get current user |
| GET | `/api/users` | ADMIN | List semua warga |
| GET | `/api/users/:id` | All roles | Detail user |
| PUT | `/api/users/:id` | All roles | Update profil |
| DELETE | `/api/users/:id` | ADMIN | Hapus user |
| PUT | `/api/users/:id/password` | All roles | Ganti password |
| GET | `/api/payment-types` | All roles | List jenis iuran |
| POST | `/api/payment-types` | ADMIN | Buat jenis iuran |
| PUT | `/api/payment-types/:id` | ADMIN | Update jenis iuran |
| DELETE | `/api/payment-types/:id` | ADMIN | Hapus jenis iuran |
| GET | `/api/payments` | All roles | List transaksi iuran |
| POST | `/api/payments` | ADMIN, BENDAHARA | Catat pembayaran |
| PUT | `/api/payments/:id` | ADMIN, BENDAHARA | Update pembayaran |
| DELETE | `/api/payments/:id` | ADMIN | Hapus pembayaran |
| GET | `/api/payments/stats` | All roles | Statistik iuran |
| GET | `/api/payments/unpaid` | ADMIN, BENDAHARA | Warga belum bayar |
| GET | `/api/payments/user/:userId` | All roles | Riwayat per warga |
| GET | `/api/announcements` | All roles | List pengumuman |
| POST | `/api/announcements` | ADMIN, BENDAHARA | Buat pengumuman |
| PUT | `/api/announcements/:id` | ADMIN, BENDAHARA | Update pengumuman |
| DELETE | `/api/announcements/:id` | ADMIN, BENDAHARA | Hapus pengumuman |

### 🗄️ Database Models (Prisma)

```
User
 ├── id, name, nik (unique), kk, address, phone
 ├── email (unique), password (hashed)
 ├── role: ADMIN | BENDAHARA | USER
 ├── photo (URL), isActive
 └── createdAt, updatedAt

PaymentType
 ├── id, name, amount (Decimal)
 ├── frequency: monthly | yearly | once
 ├── isActive
 └── createdAt, updatedAt

Payment
 ├── id, userId (FK), paymentTypeId (FK)
 ├── amount, month, year, paymentDate
 ├── status: paid | pending
 ├── receivedById (FK ke User)
 ├── notes
 └── createdAt, updatedAt

Announcement
 ├── id, title, content, image (URL)
 ├── createdBy (FK ke User)
 ├── isPinned
 └── createdAt, updatedAt
```

### 📦 Backend Dependencies

```
express          ^4.18.2   — Web framework
@prisma/client   5.22.0    — Database ORM client
prisma           5.22.0    — ORM CLI & schema management
jsonwebtoken     ^9.0.2    — JWT authentication
bcryptjs         ^2.4.3    — Password hashing
cors             ^2.8.5    — Cross-origin requests
dotenv           ^16.3.1   — Environment variables
express-validator^7.0.1    — Input validation
multer           ^1.4.5    — File upload handling
cloudinary       ^1.41.0   — Cloud image storage
pdfkit           ^0.13.0   — PDF report generation
nodemon          (dev)     — Auto restart on file change
```

---

## 📱 Mobile App (`/mobile`) — 🚧 IN PROGRESS

```
mobile/
├── 📄 package.json                 # entry: "expo-router/entry"
├── 📄 app.json                     # Expo configuration
├── 📄 tsconfig.json                # TypeScript config
│
├── 📁 app/                         # Expo Router — File-based routing
│   ├── 📄 _layout.tsx              # ✅ Root layout (AuthProvider + PaperProvider)
│   ├── 📄 index.tsx                # ✅ Splash redirect (→ login atau tabs)
│   │
│   ├── 📁 (auth)/                  # Auth group (no tab bar)
│   │   ├── 📄 _layout.tsx          # ✅ Auth stack layout
│   │   ├── 📄 login.tsx            # ✅ Halaman Login
│   │   └── 📄 register.tsx         # ✅ Halaman Register (+ approval admin)
│   │
│   └── 📁 (tabs)/                  # Main app (dengan tab bar)
│       ├── 📄 _layout.tsx          # ✅ Tab bar layout (role-based tabs)
│       ├── 📄 index.tsx            # ✅ Dashboard + statistik iuran
│       ├── 📄 residents.tsx        # ✅ Data warga + search + toggle aktif
│       ├── 📄 payments.tsx         # ✅ Riwayat iuran + filter status
│       ├── 📄 announcements.tsx    # ✅ List pengumuman + pinned
│       └── 📄 profile.tsx          # ✅ Profil, edit data, logout
│
├── 📁 contexts/
│   └── 📄 AuthContext.tsx          # ✅ State management user (login, logout, loading)
│
├── 📁 services/
│   ├── 📄 api.ts                   # ✅ Axios instance + interceptors (auto-attach JWT)
│   └── 📄 authService.ts           # ✅ login(), register(), getMe(), logout()
│
├── 📁 types/
│   └── 📄 index.ts                 # ✅ TypeScript interfaces: User, Payment, PaymentType, Announcement
│
├── 📁 components/                  # ⏳ Reusable UI components
│   ├── 📄 StatCard.tsx             # Card statistik dashboard
│   ├── 📄 ResidentCard.tsx         # Card data warga
│   ├── 📄 PaymentCard.tsx          # Card riwayat pembayaran
│   └── 📄 AnnouncementCard.tsx     # Card pengumuman
│
└── 📁 assets/                      # Gambar, icon, splash screen
    ├── 🖼️  icon.png
    ├── 🖼️  splash-icon.png
    ├── 🖼️  adaptive-icon.png
    └── 🖼️  favicon.png
```

### 📦 Mobile Dependencies

```
expo             ~54.0.33  — Expo SDK
expo-router      ^55.0.14  — File-based navigation
react-native     0.81.5    — Core framework
react            19.1.0    — UI library
react-native-paper ^5.15.2 — Material Design components
react-native-safe-area-context — Safe area handling
react-native-screens       — Native screen optimization
axios            ^1.16.1   — HTTP client
@react-native-async-storage — Local token storage
react-hook-form  ^7.75.0   — Form state management
expo-linking               — Deep linking
expo-constants             — App constants
expo-status-bar            — Status bar control
typescript       ~5.9.2    — Type safety
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL="postgresql://username:password@localhost:5432/rt_app_db?schema=public"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRE="7d"
PORT=5000
NODE_ENV=development
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
CLIENT_URL="http://localhost:8081"
```

---

## 🚀 Cara Menjalankan

### Backend
```bash
cd backend
npm install
cp .env.example .env        # Edit dengan database credentials
npx prisma generate         # Generate Prisma Client
npx prisma migrate dev      # Buat tabel database
npm run dev                 # Start server (port 5000)
```

### Mobile
```bash
cd mobile
npm install
npx expo start
# w → Web browser
# a → Android emulator
# i → iOS simulator
# QR → Expo Go di HP
```

---

## 📊 Progress Implementasi

| Phase | Deskripsi | Status |
|-------|-----------|--------|
| 1 | Backend Foundation (Setup, Prisma, JWT, Auth API) | ✅ Selesai |
| 2 | Backend Core (User, Payment, Announcement API) | ✅ Selesai |
| 4 | Frontend Auth Screens (Login, Register) | ✅ Selesai |
| 5 | Frontend Dashboard, Payments, Residents, Announcements, Profile | ✅ Selesai |
| 6 | Payment Recording, Export PDF, Seed Data | ✅ Selesai |
| 7 | Role-Based UI, Error Handling, Loading States, Components | ✅ Selesai |
| 8 | Deployment Config (EAS, Railway, Vercel) | ✅ Selesai |
| 7 | Polish, Error Handling, Testing | ⏳ Belum |
| 8 | Deployment (Backend + Mobile + Web) | ⏳ Belum |

---

## 👥 User Roles & Akses

| Fitur | ADMIN | BENDAHARA | USER |
|-------|-------|-----------|------|
| Lihat data warga | ✅ | ✅ | ❌ |
| Tambah/edit/hapus warga | ✅ | ❌ | ❌ |
| Catat pembayaran | ✅ | ✅ | ❌ |
| Lihat statistik | ✅ | ✅ | ✅ |
| Buat pengumuman | ✅ | ✅ | ❌ |
| Lihat riwayat bayar pribadi | ✅ | ✅ | ✅ |
| Kelola jenis iuran | ✅ | ❌ | ❌ |
| Export laporan | ✅ | ✅ | ❌ |
