export declare const listPortalInvoices: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        glAccountId: string | null;
        productId: string | null;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
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
export declare const listPortalInvoicesTable: (contactId: string) => Promise<{
    id: string;
    recordId: string;
    amount: string;
    dueDate: string | null;
    issueDate: string | null;
    status: "failed" | "completed" | "pending";
}[]>;
export declare const listPortalBills: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        glAccountId: string | null;
        productId: string | null;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
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
export declare const listPortalBillsTable: (contactId: string) => Promise<{
    id: string;
    recordId: string;
    vendor: string;
    amount: string;
    dueDate: string | null;
    issueDate: string | null;
    status: "failed" | "completed" | "pending";
}[]>;
export declare const listPortalSalesOrders: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        productId: string;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
        salesOrderId: string;
    }[];
} & {
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.OrderStatus;
    currency: string;
    orderDate: Date;
    deliveryDate: Date | null;
    notes: string | null;
    soNo: string;
    customerId: string;
})[]>;
export declare const listPortalSalesOrdersTable: (contactId: string) => Promise<{
    id: string;
    recordId: string;
    customer: string;
    amount: string;
    issueDate: string | null;
    deliveryDate: string | null;
    status: "failed" | "completed" | "pending" | "active";
}[]>;
export declare const listPortalPurchaseOrders: (contactId: string) => Promise<({
    lines: {
        id: string;
        analyticAccountId: string | null;
        purchaseOrderId: string;
        productId: string;
        description: string | null;
        qty: import("@prisma/client-runtime-utils").Decimal;
        unitPrice: import("@prisma/client-runtime-utils").Decimal;
        taxRate: import("@prisma/client-runtime-utils").Decimal;
        lineTotal: import("@prisma/client-runtime-utils").Decimal;
    }[];
} & {
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.OrderStatus;
    currency: string;
    poNo: string;
    orderDate: Date;
    deliveryDate: Date | null;
    notes: string | null;
    vendorId: string;
})[]>;
export declare const listPortalPurchaseOrdersTable: (contactId: string) => Promise<{
    id: string;
    recordId: string;
    vendor: string;
    amount: string;
    issueDate: string | null;
    deliveryDate: string | null;
    status: "failed" | "completed" | "pending" | "active";
}[]>;
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
export declare const listPortalPaymentsTable: (contactId: string) => Promise<{
    id: string;
    recordId: string;
    description: string;
    amount: string;
    date: string | null;
    method: string;
    status: "failed" | "completed" | "pending";
}[]>;
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