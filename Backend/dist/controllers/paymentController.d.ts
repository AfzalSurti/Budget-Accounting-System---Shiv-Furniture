export declare const createPayment: (data: {
    companyId: string;
    direction: "inbound" | "outbound";
    contactId: string;
    paymentDate: string;
    method: "cash" | "bank" | "upi" | "card" | "online" | "other";
    reference?: string | null;
    amount: number;
    status: "draft" | "posted" | "void";
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
export declare const listPayments: (companyId: string) => Promise<({
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
export declare const getPayment: (id: string) => Promise<{
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
}>;
//# sourceMappingURL=paymentController.d.ts.map