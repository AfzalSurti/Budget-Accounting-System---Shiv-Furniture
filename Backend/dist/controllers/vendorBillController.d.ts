export declare const createVendorBill: (data: {
    companyId: string;
    vendorId: string;
    billNo: string;
    billDate: string;
    dueDate?: string | null;
    status: "draft" | "posted" | "cancelled";
    currency?: string;
    poId?: string | null;
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
    vendorId: string;
    billNo: string;
    billDate: Date;
    dueDate: Date | null;
    poId: string | null;
    totalAmount: import("@prisma/client-runtime-utils").Decimal;
    paidAmount: import("@prisma/client-runtime-utils").Decimal;
    paymentState: string;
}>;
export declare const createVendorBillFromPO: (poId: string, billNo: string, billDate: string) => Promise<{
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
}>;
export declare const listVendorBills: (companyId: string) => Promise<({
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
export declare const listVendorBillsTable: (companyId: string) => Promise<{
    id: string;
    recordId: string;
    vendor: string;
    amount: string;
    dueDate: string | null;
    date: string | null;
    status: "failed" | "completed" | "pending";
}[]>;
export declare const getVendorBill: (id: string) => Promise<{
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
}>;
export declare const updateVendorBill: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
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
}>;
//# sourceMappingURL=vendorBillController.d.ts.map