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

export const apiPost = async <T, U = unknown>(path: string, body: U): Promise<T> => {
  const res = await fetch(`${API_V1}${path}`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message = error?.message || "Request failed";
    throw new Error(message);
  }
  const payload = await res.json();
  return payload?.data as T;
};

export const apiPut = async <T, U = unknown>(path: string, body: U): Promise<T> => {
  const res = await fetch(`${API_V1}${path}`, {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message = error?.message || "Request failed";
    throw new Error(message);
  }
  const payload = await res.json();
  return payload?.data as T;
};

export const apiDownload = async (path: string, filename: string) => {
  const res = await fetch(`${API_V1}${path}`, {
    headers: buildHeaders(),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const message = error?.message || "Download failed";
    throw new Error(message);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
