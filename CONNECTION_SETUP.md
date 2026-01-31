# Frontend-Backend Connection Setup Guide

## Current Configuration

### Backend (Port 4000)
- **Server**: Running on `http://localhost:4000`
- **API Base**: `http://localhost:4000/api/v1`
- **CORS**: Configured to accept requests from `http://localhost:3000` and `http://localhost:3001`
- **Health Check**: `GET http://localhost:4000/health`

### Frontend (Port 3000)
- **App**: Running on `http://localhost:3000`
- **API Base URL**: `http://localhost:4000` (configured in `.env.local`)
- **Auth Endpoint**: Uses `${API_V1}/auth/*` endpoints

## Environment Files Created

### Backend `.env`
```
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://... (Neon DB)
JWT_SECRET=afzalmysecretkey
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=Shiv Furniture ERP
NEXT_PUBLIC_ENABLE_AI_INSIGHTS=true
```

## How They Connect

1. **Frontend** (Next.js on port 3000) sends API requests to `http://localhost:4000/api/v1/...`
2. **Backend** (Express on port 4000) receives requests and processes them
3. **CORS** is configured to allow cross-origin requests between frontend and backend
4. **Authentication** uses JWT tokens stored in localStorage

## Starting Both Services

### Terminal 1: Backend
```bash
cd Backend
npm run dev
```

### Terminal 2: Frontend
```bash
cd frontend
npm run dev
```

## Testing Connection

1. Open browser to `http://localhost:3000`
2. Try to login/register
3. Check browser console for any errors
4. Check backend terminal for incoming requests

## API Routes

- `/api/v1/auth/login` - Login endpoint
- `/api/v1/auth/register` - Register endpoint
- `/api/v1/auth/me` - Get current user
- `/health` - Health check endpoint

## Troubleshooting

If connection still fails:
1. Ensure backend is running on port 4000
2. Check CORS_ORIGIN in `.env` includes frontend URL
3. Verify NEXT_PUBLIC_API_URL in frontend `.env.local`
4. Clear browser cache and localStorage
5. Check browser console for CORS errors
