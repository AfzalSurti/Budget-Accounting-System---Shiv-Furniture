export declare const createSalesOrder: (data: {
    companyId: string;
    customerId: string;
    soNo: string;
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
    orderDate: Date;
    deliveryDate: Date | null;
    notes: string | null;
    soNo: string;
    customerId: string;
}>;
export declare const listSalesOrders: (companyId: string) => Promise<({
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
export declare const listSalesOrdersTable: (companyId: string) => Promise<{
    id: string;
    recordId: string;
    customer: string;
    amount: string;
    date: string;
    deliveryDate: string;
    status: "failed" | "completed" | "pending" | "active";
    statusLabel: string;
}[]>;
export declare const getSalesOrder: (id: string) => Promise<{
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
}>;
export declare const updateSalesOrder: (id: string, data: Partial<Record<string, unknown>>) => Promise<{
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
}>;
export declare const deleteSalesOrder: (id: string) => Promise<{
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
}>;
//# sourceMappingURL=salesOrderController.d.ts.map