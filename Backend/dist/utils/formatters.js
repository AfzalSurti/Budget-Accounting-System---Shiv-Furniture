export const formatDate = (value) => {
    if (!value)
        return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime()))
        return null;
    return date.toISOString().slice(0, 10);
};
export const formatCurrency = (amount, currency = "INR") => {
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    }
    catch {
        return `${currency} ${amount.toFixed(2)}`;
    }
};
export const mapDocStatusToBadge = (status, paymentState) => {
    if (status === "cancelled")
        return "failed";
    if (paymentState && paymentState.toLowerCase() === "paid")
        return "completed";
    if (status === "draft")
        return "pending";
    return "pending";
};
export const mapOrderStatusToBadge = (status) => {
    if (status === "cancelled")
        return "failed";
    if (status === "done")
        return "completed";
    if (status === "confirmed")
        return "active";
    return "pending";
};
export const mapPaymentStatusToBadge = (status) => {
    if (status === "void")
        return "failed";
    if (status === "posted")
        return "completed";
    return "pending";
};
export const formatPaymentMethod = (method) => {
    const map = {
        cash: "Cash",
        bank: "Bank Transfer",
        upi: "UPI",
        card: "Credit Card",
        online: "Online",
        other: "Other",
    };
    return map[method] ?? method;
};
//# sourceMappingURL=formatters.js.map