# RT App Backend

Backend API untuk aplikasi manajemen data warga dan iuran RT.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Setup environment:
```bash
cp .env.example .env
# Edit .env dengan database credentials Anda
```

3. Setup database dengan Prisma:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Auth
- POST `/api/auth/register` - Register user baru
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user

### Users
- GET `/api/users` - Get all users (Admin)
- GET `/api/users/:id` - Get user by ID
- PUT `/api/users/:id` - Update user
- DELETE `/api/users/:id` - Delete user

### Payments
- GET `/api/payments` - Get all payments
- POST `/api/payments` - Create payment
- GET `/api/payments/user/:userId` - Get user payments
- GET `/api/payments/stats` - Get statistics

### Payment Types
- GET `/api/payment-types` - Get all payment types
- POST `/api/payment-types` - Create payment type (Admin)

### Announcements
- GET `/api/announcements` - Get all announcements
- POST `/api/announcements` - Create announcement (Admin/Bendahara)
