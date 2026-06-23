# RealP Estate - Real Estate Management System

A full-stack MERN (MongoDB, Express.js, React.js, Node.js) real estate management platform with role-based access control, property listings, appointments, payments, and analytics.

## Features

- **Authentication**: JWT auth, email verification, password reset, role-based access
- **User Roles**: Admin, Agent, Property Owner, Buyer/Tenant
- **Property Management**: CRUD, image uploads (Cloudinary), approval workflow, featured listings
- **Search & Filters**: Advanced filtering, sorting, pagination, property comparison
- **Appointments**: Book visits, calendar view, approval workflow, SMS reminders
- **Payments**: Stripe & PayPal integration for subscriptions and featured listings
- **Reviews & Ratings**: Property and agent reviews with moderation
- **Notifications**: Email and SMS notifications
- **Reports**: Analytics dashboard with PDF/Excel export
- **UI**: Responsive design, dark mode, interactive maps, charts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, Redux Toolkit |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| File Upload | Multer + Cloudinary |
| Maps | Google Maps API |
| Payments | Stripe, PayPal |
| Email | Nodemailer |
| SMS | Twilio |

## Project Structure

```
RealP/
├── backend/
│   ├── config/          # DB, Cloudinary, PayPal config
│   ├── controllers/     # Route controllers (MVC)
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── seeds/           # Database seed script
│   ├── utils/           # Email, SMS, exports
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios instance
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # Theme context
│   │   ├── pages/       # Route pages
│   │   ├── store/       # Redux slices
│   │   └── utils/       # Helpers
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Optional: Cloudinary, Stripe, PayPal, Twilio, Google Maps API keys

### 1. Clone & Install

```bash
cd RealP

# Backend
cd backend
cp .env.example .env
npm install

# Frontend
cd ../frontend
cp .env.example .env
npm install --legacy-peer-deps
```

### 2. Configure Environment

Edit `backend/.env` with your MongoDB URI and API keys. See `.env.example` for all variables.

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_key
```

### 3. Seed Database

```bash
cd backend
npm run seed
```

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@realp.com | admin123 |
| Agent | agent@realp.com | agent123 |
| Owner | owner@realp.com | owner123 |
| Buyer | buyer@realp.com | buyer123 |

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Forgot password |
| PUT | `/api/auth/reset-password/:token` | Reset password |
| GET | `/api/auth/verify-email/:token` | Verify email |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | List properties (with filters) |
| GET | `/api/properties/:id` | Get property details |
| POST | `/api/properties` | Create property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |
| PUT | `/api/properties/:id/approve` | Approve property (admin) |
| GET | `/api/properties/compare?ids=1,2` | Compare properties |

### Other Modules
- `/api/agents` - Agent profiles and management
- `/api/appointments` - Visit scheduling
- `/api/payments` - Stripe & PayPal payments
- `/api/reviews` - Reviews and ratings
- `/api/favorites` - Saved properties
- `/api/notifications` - User notifications
- `/api/reports` - Analytics and exports
- `/api/admin` - Categories, locations, ads, settings

## Deployment

### Live URLs

| Service | URL |
|---------|-----|
| Backend (Render) | https://realstate-v6vj.onrender.com |
| API base | https://realstate-v6vj.onrender.com/api |
| Frontend (Vercel) | Set `CLIENT_URL` on Render to your Vercel URL |

### Backend (Render)

1. Set environment variables from `backend/.env.example`
2. Required: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`
3. Set `CLIENT_URL` to your **Vercel frontend URL** (for CORS), e.g. `https://your-app.vercel.app`
4. Start command: `npm start`

### Frontend (Vercel)

1. Root directory: `frontend`
2. Build command: `npm run build`
3. Output directory: `dist`
4. `VITE_API_URL` is set in `frontend/.env.production` for production builds

### MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Set `MONGODB_URI` in Render environment variables

### Netlify Full-Stack

`netlify.toml` redirects `/api/*` to the Render backend.

## Security

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Rate limiting (100 req/15min)
- Helmet security headers
- MongoDB injection sanitization
- Role-based access control on all protected routes
- Input validation on all endpoints

## License

ISC
