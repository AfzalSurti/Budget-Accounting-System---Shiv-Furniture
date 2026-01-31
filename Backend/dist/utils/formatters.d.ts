export declare const formatDate: (value?: Date | string | null) => string | null;
export declare const formatCurrency: (amount: number, currency?: string) => string;
export declare const mapDocStatusToBadge: (status: "draft" | "posted" | "cancelled", paymentState?: string | null) => "failed" | "completed" | "pending";
export declare const mapOrderStatusToBadge: (status: "draft" | "confirmed" | "cancelled" | "done") => "failed" | "completed" | "pending" | "active";
export declare const mapPaymentStatusToBadge: (status: "draft" | "posted" | "void") => "failed" | "completed" | "pending";
export declare const formatPaymentMethod: (method: "cash" | "bank" | "upi" | "card" | "online" | "other") => string;
//# sourceMappingURL=formatters.d.ts.map