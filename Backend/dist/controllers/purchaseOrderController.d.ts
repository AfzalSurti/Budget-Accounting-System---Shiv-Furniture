export declare const createPurchaseOrder: (data: {
    companyId: string;
    vendorId: string;
    poNo: string;
    orderDate: string;
    deliveryDate?: string | null;
    status: "draft" | "confirmed" | "cancelled" | "done";
    currency?: string;
    notes?: string | null;
    lines: Array<{
        productId: string;
        analyticAccountId?: string | null;
        description?: string | null;
        qty: number;
        unitPrice: number;
        taxRate?: number;
    }>;
}) => Promise<{
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
}>;
export declare const listPurchaseOrders: (companyId: string) => Promise<({
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
export declare const listPurchaseOrdersTable: (companyId: string) => Promise<{
    id: string;
    recordId: string;
    vendor: string;
    amount: string;
    date: string;
    deliveryDate: string;
    status: "failed" | "completed" | "pending" | "active";
    statusLabel: string;
}[]>;
export declare const getPurchaseOrder: (id: string) => Promise<{
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
}>;
export declare const updatePurchaseOrder: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
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
}>;
export declare const deletePurchaseOrder: (id: string) => Promise<{
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
}>;
//# sourceMappingURL=purchaseOrderController.d.ts.map