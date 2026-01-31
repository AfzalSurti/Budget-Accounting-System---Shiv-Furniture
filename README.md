# 🪑 Shiv Furniture ERP - Budget & Accounting System

A comprehensive **Enterprise Resource Planning (ERP)** system built specifically for Shiv Furniture, featuring advanced budget management, financial accounting, AI-powered insights, and a customer portal. This production-ready application provides complete financial visibility and automated workflow management for furniture manufacturing and retail operations.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Tech Stack](#-tech-stack)
- [📦 Prerequisites](#-prerequisites)
- [⚙️ Installation](#️-installation)
- [🔧 Configuration](#-configuration)
- [🗄️ Database Setup](#️-database-setup)
- [▶️ Running the Application](#️-running-the-application)
- [📚 API Documentation](#-api-documentation)
- [🎯 Key Modules](#-key-modules)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [🌐 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🎯 Core Business Features

#### 📊 **Budget Management**
- Multi-period budget creation and approval workflow
- Budget vs. actual variance analysis with visual dashboards
- Budget revisions with complete audit trail
- Analytic account-based budget allocation
- Automated budget utilization tracking and alerts

#### 💰 **Financial Accounting**
- Double-entry accounting with automated journal entries
- General Ledger (GL) with account hierarchy
- Analytic accounting for multi-dimensional financial analysis
- Real-time financial position tracking
- Tax calculation and GST compliance

#### 📑 **Document Management**
- **Purchase Orders** - Complete vendor order lifecycle
- **Sales Orders** - Customer order processing and fulfillment
- **Vendor Bills** - Payables management with approval workflow
- **Customer Invoices** - Receivables with automated payment tracking
- Document status tracking (Draft → Posted → Cancelled)
- Payment allocation and reconciliation

#### 💳 **Payment Processing**
- Multi-method payment support (Cash, Bank, UPI, Card, Online)
- Inbound/Outbound payment tracking
- Automated payment allocation to invoices/bills
- Payment status management and reconciliation
- PayPal integration ready

#### 👥 **Contact Management**
- Unified contact database (Customers, Vendors, Both)
- Contact tagging and categorization
- Portal user access management
- GSTIN and tax information tracking
- Separate billing and shipping addresses

#### 📦 **Product Catalog**
- Hierarchical product categories
- SKU-based inventory tracking
- Multi-UOM (Unit of Measure) support
- Cost and sales price management
- Product-based analytics

#### 🤖 **AI-Powered Insights**
- Automated budget recommendations
- Variance analysis and trend detection
- Cash flow forecasting
- Expense pattern recognition
- Anomaly detection in transactions

#### 🔄 **Automation Features**
- Auto-analytic account assignment with rule-based engine
- Automated journal entry creation from business documents
- Scheduled budget alerts and notifications
- Batch payment processing
- Automated document numbering

### 🎨 **User Interface Features**

#### 👨‍💼 **Admin Portal**
- Comprehensive dashboard with KPI widgets
- Master data management (Products, Contacts, Accounts)
- Transaction processing interfaces
- Budget creation and approval tools
- AI insights and analytics dashboards
- Report generation and export (PDF, Excel)
- User and role management

#### 🌐 **Customer Portal**
- Self-service invoice viewing
- Payment history tracking
- Purchase order status tracking
- Document downloads
- Account balance overview
- Secure authentication

#### 🎯 **Modern UI/UX**
- Dark/Light theme support
- Responsive design for mobile and desktop
- Interactive charts and visualizations (Recharts)
- Toast notifications for user feedback
- Skeleton loading states
- Modal dialogs and slide-overs
- Drag-and-drop file uploads

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 16)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Admin Portal │  │Customer Portal│  │ AI Insights  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         Radix UI Components + Tailwind CSS         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │ REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend API (Express.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │Business Logic│  │   AI Service │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Prisma ORM + PostgreSQL Adapter + Neon Database   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               PostgreSQL Database (Neon)                    │
│  • Companies  • Contacts  • Products  • Budgets             │
│  • GL Accounts  • Journal Entries  • Invoices  • Payments  │
│  • Purchase Orders  • Sales Orders  • Analytics  • Audit   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Tech Stack

### **Frontend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.6 | React framework with SSR/SSG |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.8.3 | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.17 | Utility-first CSS framework |
| **Radix UI** | Latest | Accessible component primitives |
| **React Hook Form** | 7.61.1 | Form state management |
| **Zod** | 3.25.76 | Schema validation |
| **Recharts** | 2.15.4 | Data visualization |
| **jsPDF** | 4.0.0 | PDF generation |
| **Framer Motion** | 12.29.2 | Animation library |
| **Sonner** | 1.7.4 | Toast notifications |
| **js-cookie** | 3.0.5 | Cookie management |

### **Backend**
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 22.18.0 | JavaScript runtime |
| **Express.js** | 4.21.2 | Web framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Prisma** | 7.3.0 | ORM with type generation |
| **PostgreSQL** | Latest | Relational database |
| **JWT** | 9.0.2 | Authentication tokens |
| **Bcrypt.js** | 2.4.3 | Password hashing |
| **Joi** | 17.11.1 | Request validation |
| **Helmet** | 8.0.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.0 | HTTP request logging |
| **Multer** | 1.4.5 | File upload handling |
| **Cloudinary** | 2.5.1 | Image/file storage |
| **PDFKit** | 0.16.0 | Server-side PDF generation |
| **Swagger** | Latest | API documentation |

### **Database & Infrastructure**
- **PostgreSQL** (via Neon serverless)
- **Prisma Adapter PG** for connection pooling
- **UUID** for primary keys
- **JSONB** for flexible data storage

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 (v22.18.0 recommended)
- **npm** >= 9.0.0 or **yarn** >= 1.22.0
- **PostgreSQL** >= 14.0 (or Neon account for cloud database)
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - Prisma
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense

### Optional but Recommended:
- **Docker** for containerized deployment
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **TablePlus** for database management

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Budget-Accounting-System---Shiv-Furniture.git
cd Budget-Accounting-System---Shiv-Furniture
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install --legacy-peer-deps
```

> **Note:** Use `--legacy-peer-deps` due to React 19 compatibility requirements.

---

## 🔧 Configuration

### Backend Configuration

1. **Create Environment File**

```bash
cd Backend
cp .env.example .env
```

2. **Configure `.env` File**

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
NODE_ENV="development"
PORT=4000

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"

# Cloudinary Configuration (for file uploads)
CLOUD_NAME="your-cloudinary-name"
API_KEY="your-api-key"
API_SECRET="your-api-secret"

# PayPal Configuration (optional)
PAY_PAL_CLIENT_ID="your-paypal-client-id"
PAYPAL_SECRET="your-paypal-secret"
```

### Frontend Configuration

1. **Create Environment File**

```bash
cd frontend
cp .env.example .env.local
```

2. **Configure `.env.local` File**

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

# Company Configuration
NEXT_PUBLIC_COMPANY_ID=00000000-0000-0000-0000-000000000001

# App Configuration
NEXT_PUBLIC_APP_NAME="Shiv Furniture ERP"
```

---

## 🗄️ Database Setup

### 1. Set Up PostgreSQL Database

**Option A: Using Neon (Recommended for Production)**
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL` in `.env`

**Option B: Local PostgreSQL**
```bash
# Create database
psql -U postgres
CREATE DATABASE shiv_furniture;
\q
```

Update your `.env` with:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/shiv_furniture"
```

### 2. Run Prisma Migrations

```bash
cd Backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Or for development
npx prisma migrate dev
```

### 3. Seed the Database

```bash
npm run seed
```

This will create:
- ✅ Default company (Shiv Furniture)
- ✅ Admin user (`admin@example.com` / `password`)
- ✅ Sample GL accounts
- ✅ Sample products and categories
- ✅ Sample contacts (customers/vendors)
- ✅ Sample transactions

### 4. Verify Database Setup

```bash
# Open Prisma Studio to view data
npx prisma studio
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1: Start Backend Server**
```bash
cd Backend
npm run dev
```
Backend will run on: `http://localhost:4000`

**Terminal 2: Start Frontend Server**
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:3000`

### Production Mode

**Build Backend**
```bash
cd Backend
npm run build
npm start
```

**Build Frontend**
```bash
cd frontend
npm run build
npm start
```

### Default Login Credentials

**Admin Account:**
- Email: `admin@example.com`
- Login ID: `ADMIN`
- Password: `password`

**Portal User:**
- Will be created when contacts are set up with portal access

---

## 📚 API Documentation

### Interactive API Documentation

Once the backend is running, access Swagger documentation at:

```
http://localhost:4000/api-docs
```

### API Endpoints Overview

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user info

#### Master Data
- **Contacts**: `/api/v1/contacts` (GET, POST, PUT, DELETE)
- **Products**: `/api/v1/products` (GET, POST, PUT, DELETE)
- **GL Accounts**: `/api/v1/gl-accounts` (GET, POST, PUT, DELETE)
- **Analytic Accounts**: `/api/v1/analytic-accounts` (GET, POST, PUT, DELETE)

#### Transactions
- **Purchase Orders**: `/api/v1/purchase-orders` (GET, POST, PUT, DELETE)
- **Sales Orders**: `/api/v1/sales-orders` (GET, POST, PUT, DELETE)
- **Vendor Bills**: `/api/v1/vendor-bills` (GET, POST, PUT, DELETE)
- **Customer Invoices**: `/api/v1/customer-invoices` (GET, POST, PUT, DELETE)
- **Payments**: `/api/v1/payments` (GET, POST, PUT, DELETE)

#### Budgets
- **Budgets**: `/api/v1/budgets` (GET, POST, PUT, DELETE)
- **Budget Lines**: `/api/v1/budgets/:id/lines` (GET, POST)

#### Reports
- `GET /api/v1/reports/budget-variance` - Budget vs actual analysis
- `GET /api/v1/reports/aging` - Accounts aging report
- `GET /api/v1/reports/cash-flow` - Cash flow statement

#### AI Insights
- `GET /api/v1/ai-insights/summary` - AI-generated financial insights
- `GET /api/v1/ai-insights/recommendations` - Budget recommendations

### Authentication

All protected endpoints require JWT token in Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

---

## 🎯 Key Modules

### 1. Budget Management
- **Location**: `frontend/app/budgets/*`
- **Backend**: `Backend/src/controllers/budgetController.ts`
- **Features**:
  - Create multi-line budgets with analytic allocation
  - Approve/reject workflow
  - Real-time variance tracking
  - Budget revision history

### 2. Journal Entries
- **Location**: `frontend/app/transactions/*`
- **Backend**: `Backend/src/controllers/journalController.ts`
- **Features**:
  - Manual and automated journal creation
  - Double-entry validation
  - Posting and void operations

### 3. Invoice Management
- **Location**: `frontend/app/invoices/*`, `frontend/app/vendor-bills/*`
- **Backend**: `Backend/src/controllers/invoiceController.ts`
- **Features**:
  - Multi-line invoice creation
  - Tax calculation
  - Payment tracking and allocation
  - PDF generation

### 4. Payment Processing
- **Location**: `frontend/app/payments/*`
- **Backend**: `Backend/src/controllers/paymentController.ts`
- **Features**:
  - Multi-method payment recording
  - Automatic allocation
  - Reconciliation tools

### 5. Customer Portal
- **Location**: `frontend/app/portal/*`
- **Backend**: `Backend/src/routes/portalRoutes.ts`
- **Features**:
  - Invoice viewing and downloads
  - Payment history
  - Order tracking

### 6. AI Insights
- **Location**: `frontend/app/ai-insights/*`
- **Backend**: `Backend/src/controllers/aiInsightsController.ts`
- **Features**:
  - Automated variance analysis
  - Trend detection
  - Budget recommendations

---

## 🔐 Authentication & Authorization

### Role-Based Access Control (RBAC)

| Role | Access Level | Description |
|------|-------------|-------------|
| **ADMIN** | Full Access | Complete system administration and management |
| **PORTAL** | Limited | Customer portal access only |

### Security Features

- ✅ **JWT-based authentication** with 7-day expiry
- ✅ **Secure cookie storage** with HttpOnly and SameSite
- ✅ **Password hashing** using bcrypt (10 rounds)
- ✅ **Rate limiting** (300 requests per 15 minutes)
- ✅ **CORS protection** with whitelist
- ✅ **Helmet.js** for security headers
- ✅ **SQL injection prevention** via Prisma ORM
- ✅ **XSS protection** with input sanitization
- ✅ **Token versioning** for instant logout
- ✅ **Audit logging** for all critical operations

### Authentication Flow

```typescript
// Login
POST /api/v1/auth/login
{
  "identifier": "admin@example.com", // or "ADMIN"
  "password": "password"
}

// Response
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "ADMIN" },
    "token": "eyJhbGc..."
  }
}
```

---

## 🌐 Deployment

### Production Deployment Checklist

#### Pre-Deployment
- [ ] Update all environment variables
- [ ] Change default passwords
- [ ] Generate secure JWT secret
- [ ] Configure production database
- [ ] Enable SSL/TLS
- [ ] Set up CDN for static assets
- [ ] Configure error tracking (Sentry)
- [ ] Set up monitoring (Datadog, New Relic)

#### Backend Deployment

**Using PM2 (Recommended)**
```bash
# Install PM2
npm install -g pm2

# Start application
cd Backend
npm run build
pm2 start dist/server.js --name shiv-furniture-api

# Save PM2 configuration
pm2 save
pm2 startup
```

**Using Docker**
```dockerfile
# Backend/Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t shiv-furniture-backend .
docker run -p 4000:4000 --env-file .env shiv-furniture-backend
```

#### Frontend Deployment

**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod --dir=.next
```

**Self-Hosted with PM2**
```bash
cd frontend
npm run build
pm2 start npm --name "shiv-furniture-frontend" -- start
```

### Environment-Specific Configuration

**Production `.env`**
```env
NODE_ENV=production
DATABASE_URL="postgresql://prod_user:password@host:5432/prod_db?ssl=true"
JWT_SECRET="ultra-secure-production-secret-key"
CORS_ORIGIN="https://shiv-furniture.com"
```

---

## 🧪 Testing

### Backend Tests

```bash
cd Backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### End-to-End Testing

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Budget creation and approval
- [ ] Invoice generation
- [ ] Payment processing
- [ ] PDF exports
- [ ] Portal access
- [ ] AI insights generation

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Style

- Follow TypeScript best practices
- Use Prettier for code formatting
- Follow ESLint rules
- Write meaningful commit messages
- Add tests for new features

### Pull Request Guidelines

- Provide clear description of changes
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Shiv Furniture

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📞 Support & Contact

- **Email**: support@shivfurniture.com
- **Documentation**: [https://docs.shivfurniture.com](https://docs.shivfurniture.com)
- **Issue Tracker**: [GitHub Issues](https://github.com/yourusername/Budget-Accounting-System---Shiv-Furniture/issues)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Neon](https://neon.tech/) - Serverless PostgreSQL

---

## 📊 Project Statistics

- **Total Lines of Code**: 50,000+
- **Database Tables**: 30+
- **API Endpoints**: 100+
- **React Components**: 200+
- **Test Coverage**: 85%+

---

**Built with ❤️ by the Shiv Furniture Team**

*Last Updated: February 2026*