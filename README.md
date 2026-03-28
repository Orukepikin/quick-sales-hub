# Quick Sales Hub

**Post. Sell. Deliver — In Minutes.**

A peer-to-peer classified marketplace platform for Nigeria and similar markets. Built with Next.js, PostgreSQL, and designed for Vercel deployment.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14 (App Router) | Web application + SSR |
| Styling | Tailwind CSS | Utility-first CSS |
| State | Zustand | Client-side state management |
| Backend | Next.js API Routes | Serverless REST API |
| Database | PostgreSQL via Supabase | Data storage + realtime |
| ORM | Prisma | Type-safe database queries |
| Auth | JWT (jsonwebtoken + bcryptjs) | User authentication |
| Payments | Paystack | Nigerian payment processing |
| Images | Cloudinary | Image upload and optimization |
| Validation | Zod | Request/form validation |
| Hosting | Vercel | Deployment + serverless functions |

### Mobile App Strategy

This web app is built mobile-first and can be converted to native apps using **Capacitor** (by Ionic):

- **Same codebase** for web + iOS + Android
- Wrap the Next.js app in a native WebView
- Access native APIs (camera, push notifications, GPS)
- Publish to Play Store and App Store

---

## Features

### User Roles
- **Buyers** — Browse, search, filter, save, chat, purchase
- **Sellers** — Post ads, manage listings, chat, receive payments
- **Admin** — Dashboard, user management, listing moderation, analytics
- **Logistics Drivers** — Accept delivery jobs, track orders

### Core Functionality
- Listing management with images, categories, locations
- Real-time chat between buyers and sellers
- Search with filters (category, price range, location)
- Paystack payment integration with escrow
- Logistics/delivery tracking system
- Ratings and reviews
- Ad promotion (featured/boosted listings)
- Admin dashboard with analytics

---

## Project Structure

```
quick-sales-hub/
├── app/
│   ├── api/
│   │   ├── auth/         # Login, signup, profile
│   │   ├── listings/     # CRUD + save/unsave
│   │   ├── chat/         # Conversations + messages
│   │   ├── orders/       # Order management
│   │   ├── payments/     # Paystack integration
│   │   ├── reviews/      # Ratings system
│   │   ├── logistics/    # Delivery tracking
│   │   ├── admin/        # Admin endpoints
│   │   └── upload/       # Image uploads
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Main app entry
├── components/
│   ├── layout/           # Header, MobileNav, Hero, Profile, Onboarding
│   ├── listings/         # Cards, Grid, Detail, CreateForm, Categories
│   ├── chat/             # ChatView
│   └── admin/            # AdminDashboard
├── lib/
│   ├── prisma.ts         # Database client
│   ├── supabase.ts       # Supabase client
│   ├── auth.ts           # JWT helpers
│   ├── validations.ts    # Zod schemas
│   ├── utils.ts          # Utilities + constants
│   ├── store.ts          # Zustand stores
│   ├── api-client.ts     # Frontend API client
│   ├── paystack.ts       # Payment integration
│   └── cloudinary.ts     # Image upload
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
├── middleware.ts          # Auth middleware
├── tailwind.config.ts
├── next.config.js
├── vercel.json
├── package.json
└── .env.example
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase account (free tier works)
- A Paystack account (for payments)
- A Cloudinary account (for images)

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/quick-sales-hub.git
cd quick-sales-hub
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your credentials in `.env.local`:

- **Supabase**: Create a project at [supabase.com](https://supabase.com), get your URL, anon key, and database URL
- **Paystack**: Get keys from [paystack.com/developers](https://paystack.com/developers)
- **Cloudinary**: Get credentials from [cloudinary.com](https://cloudinary.com)
- **JWT_SECRET**: Generate a random string (e.g., `openssl rand -base64 32`)

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with demo data
npx prisma db seed

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login Credentials (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@quicksaleshub.com | password123 |
| Seller | techzone@example.com | password123 |
| Buyer | john@example.com | password123 |
| Driver | driveking@example.com | password123 |

---

## Deploy to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Quick Sales Hub"
git remote add origin https://github.com/YOUR_USERNAME/quick-sales-hub.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add all environment variables from `.env.local`
3. Vercel will auto-detect Next.js and deploy

### 3. Post-Deployment

- Run `npx prisma db push` against your production database
- Run the seed script if you want demo data
- Configure Paystack webhooks to point to `https://your-domain.com/api/payments/callback`

---

## Converting to Mobile Apps

### Using Capacitor (Recommended)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init "Quick Sales Hub" com.quicksaleshub.app

# Add platforms
npx cap add android
npx cap add ios

# Build and sync
npm run build
npx cap sync

# Open in Android Studio / Xcode
npx cap open android
npx cap open ios
```

This wraps your Next.js web app in native containers for Play Store and App Store distribution.

---

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Browse listings (with filters) |
| POST | `/api/listings` | Create listing |
| GET | `/api/listings/:id` | Get listing detail |
| PATCH | `/api/listings/:id` | Update listing |
| DELETE | `/api/listings/:id` | Delete listing |
| POST | `/api/listings/:id/save` | Save listing |
| DELETE | `/api/listings/:id/save` | Unsave listing |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat` | Get conversations |
| POST | `/api/chat` | Send message |
| GET | `/api/chat/:conversationId` | Get messages |

### Orders & Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get orders |
| POST | `/api/orders` | Create order |
| POST | `/api/payments` | Initialize payment |
| GET | `/api/payments/verify` | Verify payment |

### Reviews & Logistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/reviews` | Get/create reviews |
| GET/POST/PATCH | `/api/logistics` | Manage deliveries |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin` | Dashboard stats |

---

## Monetization

- **Listing Promotions**: Sellers pay to feature/boost listings
- **Transaction Commission**: 1.5% fee on in-app payments
- **Delivery Commission**: Fee on logistics transactions
- **Seller Subscriptions**: Premium seller plans (coming soon)

---

## License

MIT
