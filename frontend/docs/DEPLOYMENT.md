# 🚀 Deployment & Configuration Guide

## Environment Setup

### Development Environment
```bash
# Install dependencies
npm install

# Run development server (hot reload)
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

### Production Build
```bash
# Build optimized bundle
npm run build

# Start production server
npm start
```

## Environment Variables

Create `.env.local` in the frontend root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=Shiv Furniture ERP

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_INSIGHTS=true
```

**Note**: `NEXT_PUBLIC_*` variables are exposed to the browser.

## Deployment Options

### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel deploy

# Production deployment
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### 2. Docker

**Dockerfile**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build
COPY . .
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]
```

**Build & Run**:
```bash
docker build -t shiv-furniture-erp .
docker run -p 3000:3000 shiv-furniture-erp
```

### 3. AWS (EC2/ECS)

1. Build Docker image
2. Push to ECR
3. Create ECS task definition
4. Deploy with ALB
5. Configure SSL with ACM

### 4. Self-Hosted (Linux/Ubuntu)

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repository>
cd frontend
npm install
npm run build

# Use PM2 for process management
npm i -g pm2
pm2 start npm --name "shiv-erp" -- start
pm2 startup
pm2 save
```

## Performance Optimization

### Image Optimization
Images are automatically optimized by Next.js. Ensure:
- Use `.next/static/images/` for static assets
- Use `<Image>` component for dynamic images
- Set proper width/height attributes

### Code Splitting
Next.js automatically code-splits at route boundaries. This is configured out of the box.

### CSS Optimization
- Tailwind CSS is minified in production
- Unused styles are purged (configured in tailwind.config.ts)
- CSS-in-JS is optimized

### Font Optimization
Fonts are loaded from Google Fonts CDN in `layout.tsx`. For self-hosted fonts:
```tsx
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter.woff2') format('woff2');
}
```

## Monitoring & Logging

### Web Vitals
Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Error Tracking
Use Sentry for production error tracking:
```bash
npm install @sentry/nextjs
```

Configure `next.config.ts`:
```typescript
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = { /* ... */ };

export default withSentryConfig(nextConfig, {
  org: 'your-org',
  project: 'your-project',
  authToken: process.env.SENTRY_AUTH_TOKEN,
});
```

## Security Checklist

- ✅ HTTPS/SSL enforced in production
- ✅ Content Security Policy headers configured
- ✅ CORS properly configured for API calls
- ✅ Environment variables secured (not in git)
- ✅ Authentication tokens in HTTP-only cookies
- ✅ Regular dependency updates (`npm audit`)
- ✅ Rate limiting on API endpoints (backend)
- ✅ Input validation on forms
- ✅ XSS protection enabled
- ✅ CSRF tokens implemented (if needed)

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Type Check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Deploy
        run: |
          npm install -g vercel
          vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Database Migrations

If using a database, run migrations before deploying:
```bash
# Before deployment
npm run migrate:latest

# Rollback if needed
npm run migrate:rollback
```

## Health Checks

Add health check endpoint in `app/api/health/route.ts`:
```typescript
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
}
```

Configure health checks in deployment:
- Vercel: Automatically configured
- Docker: Add `HEALTHCHECK` instruction
- Kubernetes: Configure liveness probe

## Backup & Recovery

- Version control: All code in Git
- Database: Automated backups (backend)
- Static assets: Stored on CDN (optional)
- Configuration: In environment variables

## Monitoring Dashboard

Monitor with:
- Vercel Analytics
- Google Analytics
- Sentry (errors)
- DataDog / New Relic (APM)

## DNS Configuration

Point domain to deployment:
```
Vercel: DNS records provided in dashboard
AWS: CloudFront or ALB endpoint
Self-hosted: A record to server IP
```

## SSL/TLS Certificate

- Vercel: Auto-issued by Let's Encrypt
- AWS: Use AWS Certificate Manager
- Self-hosted: Use Let's Encrypt with Certbot
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

## Scaling Considerations

- **Serverless** (Vercel): Auto-scales, no configuration
- **Docker**: Use orchestration (Kubernetes, Docker Swarm)
- **Self-hosted**: Load balancer + multiple instances
- **Database**: Connection pooling, read replicas

## Rollback Strategy

```bash
# Vercel rollback
vercel --prod --commit <commit-hash>

# Docker rollback
docker pull registry/image:previous-tag
docker run -p 3000:3000 registry/image:previous-tag

# Git rollback (if needed)
git revert <commit-hash>
git push origin main
```

## Support & Documentation

- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs
- Docker: https://docs.docker.com
- AWS: https://docs.aws.amazon.com

---

**Remember**: Always test deployments in staging before production!
