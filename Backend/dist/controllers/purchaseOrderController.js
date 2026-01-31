import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { resolveAnalyticAccountId } from "../services/autoAnalyticService.js";
export const createPurchaseOrder = async (data) => {
    return prisma.$transaction(async (tx) => {
        const purchaseOrder = await tx.purchaseOrder.create({
            data: {
                companyId: data.companyId,
                vendorId: data.vendorId,
                poNo: data.poNo,
                orderDate: new Date(data.orderDate),
                status: data.status,
                currency: data.currency ?? "INR",
                notes: data.notes ?? null,
            },
        });
        for (const line of data.lines) {
            const product = await tx.product.findUnique({ where: { id: line.productId } });
            if (!product) {
                throw new ApiError(400, "Invalid product");
            }
            const resolvedAnalytic = line.analyticAccountId ??
                (await resolveAnalyticAccountId({
                    companyId: data.companyId,
                    docType: "purchase_order",
                    productId: line.productId,
                    categoryId: product.categoryId ?? null,
                    contactId: data.vendorId,
                }));
            const taxRate = line.taxRate ?? 0;
            const lineTotal = line.qty * line.unitPrice * (1 + taxRate / 100);
            await tx.purchaseOrderLine.create({
                data: {
                    purchaseOrderId: purchaseOrder.id,
                    productId: line.productId,
                    analyticAccountId: resolvedAnalytic ?? null,
                    description: line.description ?? null,
                    qty: line.qty,
                    unitPrice: line.unitPrice,
                    taxRate,
                    lineTotal,
                },
            });
        }
        return purchaseOrder;
    });
};
export const listPurchaseOrders = async (companyId) => {
    return prisma.purchaseOrder.findMany({
        where: { companyId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const getPurchaseOrder = async (id) => {
    const po = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { lines: true },
    });
    if (!po) {
        throw new ApiError(404, "Purchase order not found");
    }
    return po;
};
export const updatePurchaseOrder = async (id, data) => {
    try {
        return await prisma.purchaseOrder.update({ where: { id }, data });
    }
    catch (error) {
        throw new ApiError(404, "Purchase order not found", error);
    }
};
export const deletePurchaseOrder = async (id) => {
    try {
        return await prisma.purchaseOrder.delete({ where: { id } });
    }
    catch (error) {
        throw new ApiError(404, "Purchase order not found", error);
    }
};
//# sourceMappingURL=purchaseOrderController.js.map