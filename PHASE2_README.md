# Phase 2: Authentication & Database Setup

## Overview
Phase 2 adds user authentication and database integration to the VIN Decoder application.

## Features Added
- ✅ Email & Password Authentication (Signup/Login/Logout)
- ✅ JWT Session Handling
- ✅ Cloudflare D1 Database Integration
- ✅ VIN Request Tracking

## Database Schema

### Tables
1. **users**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - `email` (TEXT, UNIQUE, NOT NULL)
   - `password_hash` (TEXT, NOT NULL)
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

2. **vin_requests**
   - `id` (INTEGER, PRIMARY KEY, AUTOINCREMENT)
   - `user_id` (INTEGER, NOT NULL, FOREIGN KEY)
   - `vin_number` (TEXT, NOT NULL)
   - `status` (TEXT, NOT NULL, DEFAULT 'pending') - Values: pending, paid, completed
   - `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP)

## API Routes

### Authentication
- `POST /api/signup` - Create new user account
- `POST /api/login` - Authenticate and create session
- `POST /api/logout` - Clear session

### VIN Management
- `POST /api/save-vin` - Save VIN request to database (requires auth)

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create `.env.local`:
```
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```

**Note:** In development mode, the app works in "mock mode" without a database. API routes return mock data when the database is not available.

## Cloudflare Deployment

### 1. Create D1 Database
```bash
wrangler d1 create vindecoder-db
```

Copy the `database_id` from the output.

### 2. Update wrangler.toml
Replace `your-database-id-here` with your actual database ID:
```toml
[[d1_databases]]
binding = "DB"
database_name = "vindecoder-db"
database_id = "your-actual-database-id"
```

### 3. Run Migrations
```bash
wrangler d1 execute vindecoder-db --file=./schema.sql
```

### 4. Set Environment Variables in Cloudflare Pages
In your Cloudflare Pages dashboard:
- Go to Settings → Environment Variables
- Add `JWT_SECRET` with a strong random value

### 5. Deploy
```bash
npm run pages:build
```

Then push to your Git repository connected to Cloudflare Pages.

## Testing

### Mock Mode (Local Development)
The application works without a database in development:
1. Visit `http://localhost:3000`
2. Click "Sign Up" - mock authentication will work
3. Submit a VIN - it will be validated and stored in localStorage
4. View the report simulation

### With Database (Production)
After deploying to Cloudflare Pages with D1:
1. Users can sign up with real accounts
2. VINs are saved to the database
3. JWT sessions are managed via HTTP-only cookies

## User Flow

1. **Guest User** → Enters VIN → Redirected to Login/Signup
2. **Authenticated User** → Enters VIN → VIN saved to DB → Report page
3. **Payment** (Phase 3) → Status updated from 'pending' to 'paid'
4. **Report Generation** (Phase 3) → Status updated to 'completed'

## Security Notes

- Passwords are hashed using bcryptjs (salt rounds: 10)
- JWT tokens are signed with HS256
- Auth tokens are stored in HTTP-only cookies
- Tokens expire after 7 days
- All API routes use Edge runtime for performance
