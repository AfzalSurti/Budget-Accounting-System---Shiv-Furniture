import Cookies from 'js-cookie';

const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export const API_BASE_URL = rawBase.replace(/\/$/, "");

const normalizedBase = API_BASE_URL.endsWith("/api/v1")
  ? API_BASE_URL.replace(/\/api\/v1$/, "")
  : API_BASE_URL;

export const API_V1 = `${normalizedBase}/api/v1`;

export const DEFAULT_COMPANY_ID =
  process.env.NEXT_PUBLIC_COMPANY_ID || "00000000-0000-0000-0000-000000000001";

// Cookie-based token storage with fallback to localStorage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  
  // Try cookie first (more secure)
  const cookieToken = Cookies.get(TOKEN_KEY);
  if (cookieToken) return cookieToken;
  
  // Fallback to localStorage
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  
  if (token) {
    // Store in cookie with security options
    Cookies.set(TOKEN_KEY, token, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      path: '/'
    });
    // Also store in localStorage as backup
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    // Remove from both
    Cookies.remove(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setStoredUser = (user: any) => {
  if (typeof window === "undefined") return;
  
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
};

export const clearAuth = () => {
  if (typeof window === "undefined") return;
  
  // Clear cookie
  Cookies.remove(TOKEN_KEY);
  // Clear localStorage
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

