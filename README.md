# Shiv Furniture ERP System

Complete business management solution for furniture manufacturing and retail operations. Handles everything from budgets and accounting to order processing and customer portals.

## What This System Does

This ERP handles the daily operations of Shiv Furniture:
- Track budgets and compare them against actual spending
- Manage customer invoices and vendor bills
- Process purchase orders and sales orders
- Handle payments and reconciliation
- Generate financial reports and analytics
- Provide customer self-service portal

Built with modern web technologies for reliability and performance.

## Table of Contents

- [Core Features](#core-features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)


## Core Features

### Budget Management
Create and track budgets across different time periods. The system compares budgeted amounts against actual spending and shows variance reports. Supports multi-level approval workflows.

### Financial Accounting
Double-entry bookkeeping with automated journal entries. Track all financial transactions in the general ledger. Generate balance sheets and P&L statements.

### Order Management
- **Purchase Orders**: Create POs for vendor orders, track delivery status
- **Sales Orders**: Process customer orders, track fulfillment
- **Vendor Bills**: Record and pay bills from suppliers
- **Customer Invoices**: Generate invoices, track payments

### Payment Processing
Record payments via cash, bank transfer, UPI, cards, or online methods. Automatically allocate payments to outstanding invoices. Track inbound and outbound payments with reconciliation tools.

### Customer Portal
Customers log in to view their invoices, check payment history, download documents, and track order status. No admin intervention needed for basic queries.

### Product & Contact Management
Maintain product catalog with SKUs, pricing, and categories. Store customer and vendor information with billing/shipping addresses.

### AI-Powered Insights
Get automated recommendations for budget planning, detect spending anomalies, and forecast cash flow based on historical data.

### Reports & Analytics
- Budget variance reports
- Aging reports (AR/AP)
- Cash flow statements
- Payment history
- Product sales analysis

## Getting Started

### What You Need

- Node.js 18 or higher (Node.js 22.18.0 recommended)
- PostgreSQL 14+ or a Neon account (free serverless PostgreSQL)
- Basic understanding of React and Node.js

### Quick Start

1. Clone this repo
2. Set up your PostgreSQL database
3. Configure environment variables
4. Install dependencies
5. Run database migrations
6. Start the backend and frontend servers

Detailed instructions below.

## Project Structure

```
Budget-Accounting-System---Shiv-Furniture/
├── Backend/              # Express.js API server
│   ├── prisma/          # Database schema and migrations
│   ├── src/
│   │   ├── controllers/ # Business logic
│   │   ├── routes/      # API routes
│   │   ├── middlewares/ # Auth, validation, errors
│   │   └── utils/       # Helper functions
│   └── dist/            # Compiled TypeScript output
│
└── frontend/            # Next.js application
    ├── app/             # Pages and routes
    │   ├── admin/       # Admin portal pages
    │   ├── portal/      # Customer portal pages
    │   └── auth/        # Login/signup pages
    ├── components/      # Reusable UI components
    └── lib/             # Utilities and API client
```

## Tech Stack

**Frontend**
- Next.js 16 with React 19
- TypeScript for type safety
- Tailwind CSS for styling
- Radix UI for accessible components
- Recharts for data visualization

**Backend**
- Node.js 22 with Express.js
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication

**Infrastructure**
- Neon serverless PostgreSQL
- Cloudinary for file storage
- PayPal API integration

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd Budget-Accounting-System---Shiv-Furniture
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is needed due to React 19 compatibility.

## Configuration

### Backend Environment Variables

Create `Backend/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Authentication
JWT_SECRET="your-secret-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=4000
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Cloudinary (for file uploads)
CLOUD_NAME="your-cloud-name"
API_KEY="your-api-key"
API_SECRET="your-api-secret"

# PayPal (optional)
PAY_PAL_CLIENT_ID="your-client-id"
PAYPAL_SECRET="your-secret"

# Company ID
DEFAULT_COMPANY_ID="00000000-0000-0000-0000-000000000001"
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_COMPANY_ID=00000000-0000-0000-0000-000000000001
```

### Database Setup

#### Option 1: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy the connection string to `DATABASE_URL` in `.env`

#### Option 2: Local PostgreSQL

```bash
psql -U postgres
CREATE DATABASE shiv_furniture;
\q
```

Update `.env` with your local connection string.

### Run Migrations

```bash
cd Backend
npx prisma generate
npx prisma migrate deploy
```

### Seed Initial Data

```bash
npm run seed
```

This creates:
- Default company record
- Admin user account
- Sample GL accounts
- Sample products
- Sample contacts

## Running Locally

### Start Backend

```bash
cd Backend
npm run dev
```

Backend runs on `http://localhost:4000`

### Start Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`

### Login Credentials

**Admin Login:**
- Email: `admin@example.com`
- Password: `password`
- OR Login ID: `ADMIN` / Password: `password`

Change these credentials after first login.

## API Reference

### Authentication

All API requests (except login/register) need a JWT token:

```bash
Authorization: Bearer <your-token>
```

### Key Endpoints

**Auth**
- POST `/api/v1/auth/login` - User login
- POST `/api/v1/auth/register` - Register new user
- GET `/api/v1/auth/me` - Get current user

**Contacts**
- GET `/api/v1/contacts` - List all contacts
- POST `/api/v1/contacts` - Create contact
- PUT `/api/v1/contacts/:id` - Update contact
- DELETE `/api/v1/contacts/:id` - Delete contact

**Products**
- GET `/api/v1/products` - List products
- POST `/api/v1/products` - Create product

**Orders**
- GET `/api/v1/sales-orders` - List sales orders
- POST `/api/v1/sales-orders` - Create sales order
- GET `/api/v1/purchase-orders` - List purchase orders
- POST `/api/v1/purchase-orders` - Create purchase order

**Invoices & Bills**
- GET `/api/v1/customer-invoices` - List invoices
- POST `/api/v1/customer-invoices` - Create invoice
- GET `/api/v1/vendor-bills` - List bills
- POST `/api/v1/vendor-bills` - Create bill

**Payments**
- GET `/api/v1/payments` - List payments
- POST `/api/v1/payments` - Record payment

**Budgets**
- GET `/api/v1/budgets` - List budgets
- POST `/api/v1/budgets` - Create budget
- GET `/api/v1/reports/budget-variance` - Variance analysis

**Portal (Customer access)**
- GET `/api/v1/portal/invoices` - Customer's invoices
- GET `/api/v1/portal/payments` - Customer's payments
- GET `/api/v1/portal/sales-orders` - Customer's orders

### API Documentation

Interactive docs available at `http://localhost:4000/api-docs` when backend is running.

## Deployment

### Backend Deployment

**Using PM2:**

```bash
cd Backend
npm run build
pm2 start dist/server.js --name shiv-furniture-api
pm2 save
```

**Using Docker:**

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

### Frontend Deployment

**Vercel (Easiest):**

```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Other Options:**
- Netlify
- Self-hosted with PM2
- Docker container

### Production Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret
- [ ] Enable SSL/HTTPS
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Set NODE_ENV=production
- [ ] Remove sensitive data from logs
- [ ] Set up monitoring/error tracking

## Troubleshooting

### Port Already in Use

If you see "Port 3000 is in use", either:
- Stop the existing process
- Use a different port: `PORT=3001 npm run dev`

### Database Connection Failed

- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Test connection: `psql <connection-string>`

### Prisma Issues

If migrations fail:
```bash
npx prisma migrate reset
npx prisma generate
npx prisma migrate deploy
```

### Frontend Build Errors

Clear cache and reinstall:
```bash
rm -rf node_modules .next
npm install --legacy-peer-deps
```

### Portal Access Issues

If customers see "Failed to load portal invoices":
- Check user has a valid contactId
- See [PORTAL_USER_FIX.md](PORTAL_USER_FIX.md) for details

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin Portal │  │Customer Portal│  │ AI Insights  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Radix UI + Tailwind CSS                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Express.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth         │  │ Controllers  │  │  Routes      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │        Prisma ORM + PostgreSQL                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               PostgreSQL (Neon Serverless)                  │
│  Companies • Contacts • Products • Budgets • GL Accounts    │
│  Journal Entries • Invoices • Bills • Payments • Analytics  │
└─────────────────────────────────────────────────────────────┘
```

## Security

- JWT tokens with 7-day expiry
- Password hashing with bcrypt
- Rate limiting (300 req/15min)
- CORS configuration
- SQL injection prevention via Prisma
- XSS protection
- Audit logging for critical operations

## User Roles

| Role | Access |
|------|--------|
| ADMIN | Full system access - manage all data and settings |
| PORTAL | Customer portal only - view own invoices and orders |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

---

**Shiv Furniture ERP System**  
Last updated: February 2026