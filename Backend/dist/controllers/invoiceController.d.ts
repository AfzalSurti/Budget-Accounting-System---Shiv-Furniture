export declare const createInvoice: (data: {
    companyId: string;
    customerId: string;
    invoiceNo: string;
    invoiceDate: string;
    dueDate?: string | null;
    status: "draft" | "posted" | "cancelled";
    currency?: string;
    soId?: string | null;
    lines: Array<{
        productId?: string | null;
        analyticAccountId?: string | null;
        glAccountId?: string | null;
        description?: string | null;
        qty: number;
        unitPrice: number;
        taxRate?: number;
    }>;
}) => Promise<{
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
}>;
export declare const createInvoiceFromSO: (soId: string, invoiceNo: string, invoiceDate: string) => Promise<{
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
}>;
export declare const listInvoices: (companyId: string) => Promise<({
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
export declare const listInvoicesTable: (companyId: string) => Promise<{
    id: string;
    recordId: string;
    customer: string;
    amount: string;
    dueDate: string;
    issueDate: string;
    status: "failed" | "completed" | "pending";
    statusLabel: string;
}[]>;
export declare const getInvoice: (id: string) => Promise<{
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
}>;
export declare const updateInvoice: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
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
}>;
//# sourceMappingURL=invoiceController.d.ts.map