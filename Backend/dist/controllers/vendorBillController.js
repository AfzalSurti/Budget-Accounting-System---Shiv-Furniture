import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { resolveAnalyticAccountId } from "../services/autoAnalyticService.js";
import { calculatePaymentStatus } from "../services/paymentService.js";
export const createVendorBill = async (data) => {
    return prisma.$transaction(async (tx) => {
        let totalAmount = 0;
        const bill = await tx.vendorBill.create({
            data: {
                companyId: data.companyId,
                vendorId: data.vendorId,
                billNo: data.billNo,
                billDate: new Date(data.billDate),
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                status: data.status,
                currency: data.currency ?? "INR",
                poId: data.poId ?? null,
                paymentState: "Not Paid",
            },
        });
        for (const line of data.lines) {
            let categoryId = null;
            if (line.productId) {
                const product = await tx.product.findUnique({ where: { id: line.productId } });
                categoryId = product?.categoryId ?? null;
            }
            const resolvedAnalytic = line.analyticAccountId ??
                (await resolveAnalyticAccountId({
                    companyId: data.companyId,
                    docType: "vendor_bill",
                    productId: line.productId ?? null,
                    categoryId,
                    contactId: data.vendorId,
                }));
            const taxRate = line.taxRate ?? 0;
            const lineTotal = line.qty * line.unitPrice * (1 + taxRate / 100);
            totalAmount += lineTotal;
            await tx.vendorBillLine.create({
                data: {
                    vendorBillId: bill.id,
                    productId: line.productId ?? null,
                    analyticAccountId: resolvedAnalytic ?? null,
                    glAccountId: line.glAccountId ?? null,
                    description: line.description ?? null,
                    qty: line.qty,
                    unitPrice: line.unitPrice,
                    taxRate,
                    lineTotal,
                },
            });
        }
        return tx.vendorBill.update({
            where: { id: bill.id },
            data: {
                totalAmount,
                paymentState: calculatePaymentStatus(0, totalAmount),
            },
        });
    });
};
export const createVendorBillFromPO = async (poId, billNo, billDate) => {
    return prisma.$transaction(async (tx) => {
        const po = await tx.purchaseOrder.findUnique({
            where: { id: poId },
            include: { lines: true },
        });
        if (!po) {
            throw new ApiError(404, "Purchase order not found");
        }
        const bill = await tx.vendorBill.create({
            data: {
                companyId: po.companyId,
                vendorId: po.vendorId,
                billNo,
                billDate: new Date(billDate),
                status: "draft",
                currency: po.currency,
                poId: po.id,
                paymentState: "Not Paid",
            },
        });
        let totalAmount = 0;
        for (const line of po.lines) {
            totalAmount += Number(line.lineTotal);
            await tx.vendorBillLine.create({
                data: {
                    vendorBillId: bill.id,
                    productId: line.productId,
                    analyticAccountId: line.analyticAccountId,
                    description: line.description,
                    qty: Number(line.qty),
                    unitPrice: Number(line.unitPrice),
                    taxRate: Number(line.taxRate),
                    lineTotal: Number(line.lineTotal),
                },
            });
        }
        return tx.vendorBill.update({
            where: { id: bill.id },
            data: {
                totalAmount,
                paymentState: calculatePaymentStatus(0, totalAmount),
            },
        });
    });
};
export const listVendorBills = async (companyId) => {
    return prisma.vendorBill.findMany({
        where: { companyId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const getVendorBill = async (id) => {
    const bill = await prisma.vendorBill.findUnique({
        where: { id },
        include: { lines: true },
    });
    if (!bill) {
        throw new ApiError(404, "Vendor bill not found");
    }
    return bill;
};
export const updateVendorBill = async (id, data) => {
    try {
        return await prisma.vendorBill.update({ where: { id }, data });
    }
    catch (error) {
        throw new ApiError(404, "Vendor bill not found", error);
    }
};
//# sourceMappingURL=vendorBillController.js.map