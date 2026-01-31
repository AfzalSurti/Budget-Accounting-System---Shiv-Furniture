export declare const listPortalInvoices: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        glAccountId: string | null;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
        productId: string | null;
        customerInvoiceId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.DocStatus;
    currency: string;
    customerId: string;
    dueDate: Date | null;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    paidAmount: import("@prisma/client-runtime-utils").Decimal;
    paymentState: string;
    invoiceNo: string;
    invoiceDate: Date;
    soId: string | null;
    portalVisible: boolean;
})[]>;
export declare const listPortalBills: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        glAccountId: string | null;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
        productId: string | null;
        vendorBillId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.DocStatus;
    currency: string;
    vendorId: string;
    billNo: string;
    billDate: Date;
    dueDate: Date | null;
    poId: string | null;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    paidAmount: import("@prisma/client-runtime-utils").Decimal;
    paymentState: string;
})[]>;
export declare const listPortalSalesOrders: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
        productId: string;
        salesOrderId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.OrderStatus;
    orderDate: Date;
    currency: string;
    notes: string | null;
    soNo: string;
    customerId: string;
})[]>;
export declare const listPortalPurchaseOrders: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
        purchaseOrderId: string;
        productId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.OrderStatus;
    poNo: string;
    orderDate: Date;
    currency: string;
    notes: string | null;
    vendorId: string;
})[]>;
export declare const listPortalPayments: (contactId: string) => Promise<({
    allocations: {
        id: string;
        amount: import("@prisma/client-runtime-utils").Decimal;
        paymentId: string;
        targetType: import("../generated/prisma/index.js").$Enums.AllocationTargetType;
        targetId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    contactId: string;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.PaymentStatus;
    amount: import("@prisma/client-runtime-utils").Decimal;
    direction: import("../generated/prisma/index.js").$Enums.PaymentDirection;
    paymentDate: Date;
    method: import("../generated/prisma/index.js").$Enums.PaymentMethod;
    reference: string | null;
})[]>;
export declare const downloadInvoicePdf: (invoiceId: string, contactId: string) => Promise<{
    invoiceId: string;
    downloadUrl: string;
}>;
export declare const downloadBillPdf: (billId: string, contactId: string) => Promise<{
    billId: string;
    downloadUrl: string;
}>;
export declare const makePortalPayment: (payload: {
    companyId: string;
    contactId: string;
    paymentDate: string;
    method: "cash" | "bank" | "upi" | "card" | "online" | "other";
    reference?: string | null;
    amount: number;
    allocations: Array<{
        targetType: "customer_invoice" | "vendor_bill";
        targetId: string;
        amount: number;
    }>;
}) => Promise<{
    id: string;
    createdAt: Date;
    contactId: string;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.PaymentStatus;
    amount: import("@prisma/client-runtime-utils").Decimal;
    direction: import("../generated/prisma/index.js").$Enums.PaymentDirection;
    paymentDate: Date;
    method: import("../generated/prisma/index.js").$Enums.PaymentMethod;
    reference: string | null;
}>;
//# sourceMappingURL=portalController.d.ts.map