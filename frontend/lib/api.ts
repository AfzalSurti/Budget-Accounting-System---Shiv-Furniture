import { API_V1, getStoredToken } from "@/config";

const buildHeaders = (init?: HeadersInit) => {
  const token = getStoredToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init ?? {}),
  };
  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const apiGet = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${API_V1}${path}`, {
    headers: buildHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message = error?.message || "Request failed";
    throw new Error(message);
  }
  const payload = await res.json();
  return payload?.data as T;
};
