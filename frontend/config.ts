const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export const API_BASE_URL = rawBase.replace(/\/$/, "");

const normalizedBase = API_BASE_URL.endsWith("/api/v1")
  ? API_BASE_URL.replace(/\/api\/v1$/, "")
  : API_BASE_URL;

export const API_V1 = `${normalizedBase}/api/v1`;

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setStoredToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};
