export declare const createSalesOrder: (data: {
    companyId: string;
    customerId: string;
    soNo: string;
    orderDate: string;
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
    orderDate: Date;
    currency: string;
    notes: string | null;
    soNo: string;
    customerId: string;
}>;
export declare const listSalesOrders: (companyId: string) => Promise<({
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
export declare const getSalesOrder: (id: string) => Promise<{
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
}>;
export declare const updateSalesOrder: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.OrderStatus;
    orderDate: Date;
    currency: string;
    notes: string | null;
    soNo: string;
    customerId: string;
}>;
export declare const deleteSalesOrder: (id: string) => Promise<{
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.OrderStatus;
    orderDate: Date;
    currency: string;
    notes: string | null;
    soNo: string;
    customerId: string;
}>;
//# sourceMappingURL=salesOrderController.d.ts.map