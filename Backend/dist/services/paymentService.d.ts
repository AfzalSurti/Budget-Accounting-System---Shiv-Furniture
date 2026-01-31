import type { Prisma } from "../generated/prisma/client.js";
type PrismaLike = Prisma.TransactionClient;
export declare const calculatePaymentStatus: (totalPaid: number, totalAmount: number) => "Paid" | "Partially Paid" | "Not Paid";
export declare const applyPaymentToInvoice: (invoiceId: string, amount: number, client?: PrismaLike) => Promise<{
    id: string;
    createdAt: Date;
    companyId: string;
    status: import("../generated/prisma/index.js").$Enums.DocStatus;
    currency: string;
    customerId: string;
    dueDate: Date | null;
    totalAmount: Prisma.Decimal;
    paidAmount: Prisma.Decimal;
    paymentState: string;
    invoiceNo: string;
    invoiceDate: Date;
    soId: string | null;
    portalVisible: boolean;
}>;
export declare const applyPaymentToBill: (billId: string, amount: number, client?: PrismaLike) => Promise<{
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
    totalAmount: Prisma.Decimal;
    paidAmount: Prisma.Decimal;
    paymentState: string;
}>;
export {};
//# sourceMappingURL=paymentService.d.ts.map