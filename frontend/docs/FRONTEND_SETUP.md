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
- ✅ **Seamless light/dark transitions**

## 🎨 Color Palette (MANDATORY)

```
Primary / Brand Dark:   #03045E  (App shell, headers)
Primary Blue:           #0077B6  (Buttons, active states)
Accent Cyan:            #00B4D8  (Highlights, charts)
Soft Surface Blue:      #90E0EF  (Cards, surfaces)
Light Background:       #CAF0F8  (Page backgrounds)
```

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts 2.12
- **Dates**: Day.js 1.11
- **Theme**: next-themes 1.0
- **Icons**: lucide-react 0.404
- **UI Primitives**: Radix UI
- **Notifications**: Sonner 1.7
- **Forms**: React Hook Form

## 📁 Project Structure

```
app/
├── layout.tsx                 # Root layout with theme provider
├── page.tsx                   # Landing page
├── globals.css               # Global styles + custom utilities
├── auth/
│   ├── login/page.tsx       # Login page
│   └── signup/page.tsx      # Signup page
├── dashboard/page.tsx        # Financial dashboard
├── transactions/page.tsx     # Transaction management
├── budgets/page.tsx         # Budget management
├── ai-insights/page.tsx     # AI insights page
├── reports/page.tsx         # Financial reports
├── contacts/page.tsx        # Customer/vendor contacts
├── invoices/page.tsx        # Customer invoices
├── vendor-bills/page.tsx    # Vendor bills
├── purchase-orders/page.tsx # Purchase orders
├── sales-orders/page.tsx    # Sales orders
├── payments/page.tsx        # Payment management
├── master-data/page.tsx     # Master data management
└── portal/
    ├── page.tsx
    ├── invoices/page.tsx
    ├── bills/page.tsx
    ├── purchase-orders/page.tsx
    └── payments/page.tsx

components/
├── layout/
│   └── app-layout.tsx           # Main app layout wrapper
├── navigation/
│   ├── top-navigation.tsx       # Top nav (NO sidebar)
│   └── theme-toggle.tsx         # Light/dark toggle
├── theme-provider.tsx            # Next-themes wrapper
└── ui/
    ├── data-table.tsx            # Reusable data table
    └── status-badge.tsx          # Status badge component

lib/
├── cn.ts                         # Tailwind merge utility

styles/
└── globals.css                  # Global styles + custom layers

```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (with npm/yarn/pnpm)
- Modern browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

3. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## 📄 Pages Overview

### Public Pages
- `/` - Landing page with features & CTA
- `/auth/login` - Login form
- `/auth/signup` - Signup form

### Admin Pages (Protected)
- `/dashboard` - Financial dashboard with KPIs & charts
- `/transactions` - Transaction management & history
- `/budgets` - Budget creation & monitoring
- `/ai-insights` - AI-powered financial insights
- `/reports` - Financial reports & analysis
- `/contacts` - Customer/vendor management
- `/master-data` - Master data configuration
- `/invoices` - Customer invoice management
- `/vendor-bills` - Vendor bill tracking
- `/purchase-orders` - PO management
- `/sales-orders` - Sales order management
- `/payments` - Payment tracking

### Customer/Vendor Portal
- `/portal` - Portal dashboard
- `/portal/invoices` - View invoices (downloadable)
- `/portal/bills` - Pay vendor bills
- `/portal/purchase-orders` - Track POs
- `/portal/payments` - Payment history

## 🎯 Key Features

### 1. Top-Based Navigation
- Horizontal primary navigation (Dashboard, Transactions, Budgets, AI Insights, Reports, Portal)
- Responsive mobile menu
- Logo & theme toggle in header
- Profile menu placeholder

### 2. Light/Dark Theme
- Automatic theme detection
- User preference persistence
- Smooth transitions (no flash)
- All colors adapt properly

### 3. Premium UI Components
- **Data Tables** with sorting, hover effects, status badges
- **Status Badges** (active, pending, completed, failed, warning)
- **Cards** with soft shadows and hover lift
- **Charts** using Recharts with brand colors
- **Forms** with proper validation styling

### 4. AI Insights Page
- Risk detection & alerts
- Opportunity identification
- Anomaly detection
- Confidence scoring
- Impact level indicators

### 5. Financial Dashboard
- Key metrics (Budget, Utilization, Spend, Remaining)
- Budget vs Actual charts
- Cost center distribution
- Recent transactions
- AI insights feed

## 🎨 Customization

### Changing Colors
Edit `tailwind.config.ts` in the `brand` color object:
```typescript
colors: {
  brand: {
    dark: "#03045E",
    primary: "#0077B6",
    accent: "#00B4D8",
    light: "#90E0EF",
    lighter: "#CAF0F8",
  },
}
```

### Adding New Pages
1. Create folder in `app/` directory
2. Add `page.tsx` with AppLayout wrapper
3. Update `top-navigation.tsx` if adding to primary nav

### Creating New Components
Place reusable components in `components/` with proper TypeScript types.

## 📊 Data Visualization

All charts use **Recharts** with the brand color palette:
- **Line Charts** - for trends (budget vs actual)
- **Bar Charts** - for comparisons (cost centers)
- **Pie Charts** - for distribution (cost allocation)
- **Trend Indicators** - for KPIs

Dates are handled with **Day.js** for consistency.

## 🔒 Theme System

Implemented with `next-themes` for:
- Automatic light/dark detection
- User preference persistence
- No flash on page load
- System preference fallback

CSS variables defined in `globals.css`:
```css
:root {
  --background: 255 255 255;
  --foreground: 3 4 94;
  /* Brand colors... */
}

.dark {
  --background: 15 23 42;
  --foreground: 241 245 249;
  /* Dark theme colors... */
}
```

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables
```
NEXT_PUBLIC_API_URL=https://api.example.com
```

## 📈 Performance

- Next.js Server-Side Rendering (SSR)
- Image optimization
- Code splitting per route
- Lazy loading for charts
- CSS-in-JS (Tailwind) for minimal bundle

## ✅ Best Practices

1. **Use AppLayout wrapper** for all admin pages
2. **Import components** from `@/components/*`
3. **Leverage Tailwind** utilities (no custom CSS)
4. **Use cn() utility** for conditional classes
5. **Implement loading states** for async operations
6. **Validate forms** with React Hook Form
7. **Handle errors gracefully** with Sonner toasts

## 🐛 Common Issues

### Theme not switching?
- Ensure `ThemeProvider` wraps `children` in `layout.tsx`
- Check browser console for errors
- Clear cache and hard refresh

### Components not showing?
- Verify import paths use `@/` alias
- Check component exports are default
- Ensure Tailwind content paths include component files

### Charts not displaying?
- Verify Recharts is installed (`npm install recharts`)
- Check data structure matches chart requirements
- Ensure ResponsiveContainer has parent with width

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
- [Day.js](https://day.js.org/)
- [Radix UI](https://radix-ui.com/)

## 📝 License

Proprietary - Shiv Furniture © 2026

## 🤝 Support

For issues or feature requests, contact the development team.

---

**Built with ❤️ for Shiv Furniture**
