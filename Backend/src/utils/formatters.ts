export const formatDate = (value?: Date | string | null) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

export const formatCurrency = (amount: number, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export const mapDocStatusToBadge = (
  status: "draft" | "posted" | "cancelled",
  paymentState?: string | null,
) => {
  if (status === "cancelled") return "failed" as const;
  if (paymentState && paymentState.toLowerCase() === "paid")
    return "completed" as const;
  if (status === "draft") return "pending" as const;
  return "pending" as const;
};

export const mapOrderStatusToBadge = (
  status: "draft" | "confirmed" | "cancelled" | "done",
) => {
  if (status === "cancelled") return "failed" as const;
  if (status === "done") return "completed" as const;
  if (status === "confirmed") return "active" as const;
  return "pending" as const;
};

export const mapPaymentStatusToBadge = (
  status: "draft" | "posted" | "void",
) => {
  if (status === "void") return "failed" as const;
  if (status === "posted") return "completed" as const;
  return "pending" as const;
};

export const formatPaymentMethod = (
  method: "cash" | "bank" | "upi" | "card" | "online" | "other",
) => {
  const map: Record<typeof method, string> = {
    cash: "Cash",
    bank: "Bank Transfer",
    upi: "UPI",
    card: "Credit Card",
    online: "Online",
    other: "Other",
  };
  return map[method] ?? method;
};
