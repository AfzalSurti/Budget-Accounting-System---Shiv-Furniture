# Shiv Furniture ERP Frontend

Premium, modern, enterprise-grade ERP frontend for Shiv Furniture Budget Accounting System built with Next.js (App Router).

## 🎨 Design Philosophy

This is a **serious financial + AI intelligence product**, not a generic admin dashboard.

### Core Design Principles
- ✅ **Top-based modular navigation** (NO sidebar)
- ✅ **Premium blue-cyan color palette** exclusively
- ✅ **Dark/Light theme support** with persistence
- ✅ **AI-first architecture** for financial insights
- ✅ **Enterprise-grade UI/UX** with premium spacing & typography
- ✅ **Chart-driven analytics** using Recharts + Day.js

## 🎨 Color Palette

```
Primary Dark:      #03045E  (App shell, headers)
Primary Blue:      #0077B6  (Buttons, active states)
Accent Cyan:       #00B4D8  (Highlights, charts)
Surface Blue:      #90E0EF  (Cards, surfaces)
Background:        #CAF0F8  (Page backgrounds)
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.12
- **Dates**: Day.js 1.11
- **Theme**: next-themes 1.0
- **Icons**: lucide-react 0.404
- **Language**: TypeScript 5.6

## 🚀 Quick Start

```bash
# Install
npm install

# Run dev server
npm run dev

# Open browser
http://localhost:3000
```

## 📁 Project Structure

```
app/                     # Pages (Next.js App Router)
├── layout.tsx          # Root layout + theme provider
├── page.tsx            # Landing page
├── globals.css         # Global styles
├── auth/               # Authentication pages
├── dashboard/          # Financial dashboard
├── transactions/       # Transaction management
├── budgets/           # Budget management
├── ai-insights/       # AI insights (Risks, Opportunities, Anomalies)
├── reports/           # Financial reports
├── contacts/          # Customer/vendor contacts
├── invoices/          # Customer invoices
├── vendor-bills/      # Vendor bills
├── purchase-orders/   # Purchase orders
├── sales-orders/      # Sales orders
├── payments/          # Payments
├── master-data/       # Master data management
└── portal/            # Customer/vendor portal

components/            # Reusable components
├── layout/           # Layout components
├── navigation/       # Navigation components
├── theme-provider.tsx
└── ui/              # UI components

lib/                   # Utilities
styles/               # Global styles
public/               # Static assets
```

## 📄 Pages

### Public
- `/` - Landing page
- `/auth/login` - Login
- `/auth/signup` - Signup

### Admin (18+ pages)
- `/dashboard` - Financial overview
- `/transactions` - Transaction management
- `/budgets` - Budget monitoring
- `/ai-insights` - AI-powered insights ⭐
- `/reports` - Reports & analysis
- `/contacts` - Contacts management
- `/master-data` - Configuration
- `/invoices`, `/vendor-bills`, `/purchase-orders`
- `/sales-orders`, `/payments`

### Portal
- `/portal` - Portal dashboard
- `/portal/invoices` - View invoices
- `/portal/bills` - Vendor bills
- `/portal/purchase-orders` - PO tracking
- `/portal/payments` - Payment history

## ✨ Key Features

✅ **No Sidebar** - Top-based navigation only
✅ **AI Insights** - Risk, Opportunity, Anomaly detection
✅ **Charts** - Recharts visualizations
✅ **Themes** - Light & Dark mode
✅ **Responsive** - Mobile-friendly
✅ **Type-Safe** - Full TypeScript
✅ **Tables** - Sortable, interactive

## 📊 Components

- `AppLayout` - Main layout wrapper
- `TopNavigation` - Premium top nav
- `DataTable` - Reusable data tables
- `StatusBadge` - Status indicators
- `ThemeToggle` - Theme switcher

## 🔧 Commands

```bash
npm run dev         # Development
npm run build       # Build for production
npm start           # Start production
npm run lint        # ESLint
npm run type-check  # TypeScript check
```

## 🎨 Customization

Edit `tailwind.config.ts` to change colors, fonts, spacing.

## 🚀 Deployment

### Vercel
```bash
vercel deploy --prod
```

### Docker
```bash
docker build -t shiv-erp .
docker run -p 3000:3000 shiv-erp
```

### Next.js
```bash
npm run build
npm start
```

## 📚 Documentation

- `QUICKSTART.md` - 3-step setup guide
- `FRONTEND_README.md` - Complete setup guide
- `IMPLEMENTATION_SUMMARY.md` - What was built
- `DEPLOYMENT.md` - Deployment options
- `COMPLETE_CHECKLIST.md` - Full verification

## ✅ Status

**PRODUCTION-READY** - All 18+ pages implemented, tested, and documented.

---

**Built with ❤️ for Shiv Furniture**
