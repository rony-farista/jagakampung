# RT Warga & Iuran App

Aplikasi manajemen data warga dan iuran RT yang support Android, iOS, dan Web Browser.

## 🚀 Tech Stack

### Frontend
- **React Native (Expo)** - Cross-platform mobile & web
- **Expo Router** - File-based navigation
- **React Native Paper** - UI Components
- **TypeScript** - Type safety

### Backend
- **Node.js + Express** - REST API
- **PostgreSQL** - Database
- **Prisma ORM** - Type-safe database client
- **JWT** - Authentication

## 📁 Project Structure

```
rt-app/
├── backend/          # Node.js API
└── mobile/           # React Native (Expo) App
```

## 🔧 Setup Instructions

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Setup Prisma & Database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Run development server:
```bash
npm run dev
```

Backend will run on: `http://localhost:5000`

### Mobile Setup

1. Navigate to mobile folder:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start Expo:
```bash
npx expo start
```

4. Run on platform:
- Press `w` for web browser
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app for physical device

## 🎯 Features

- ✅ Multi-level authentication (Admin, Bendahara, User)
- ✅ Data warga management (CRUD)
- ✅ Iuran payment tracking
- ✅ Payment history & reports
- ✅ Announcements with notifications
- ✅ Dashboard with statistics
- ✅ Export reports (PDF/Excel)

## 👥 User Roles

- **Admin**: Full access to all features
- **Bendahara**: Manage payments & financial reports
- **User (Warga)**: View personal data & payment history

## 📱 Supported Platforms

- ✅ Android (5.0+)
- ✅ iOS (13.0+)
- ✅ Web Browser (Chrome, Firefox, Safari, Edge)

## 🔐 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
PORT=5000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 📄 License

ISC
