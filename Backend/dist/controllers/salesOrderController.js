import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { resolveAnalyticAccountId } from "../services/autoAnalyticService.js";
export const createSalesOrder = async (data) => {
    return prisma.$transaction(async (tx) => {
        const salesOrder = await tx.salesOrder.create({
            data: {
                companyId: data.companyId,
                customerId: data.customerId,
                soNo: data.soNo,
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
                    docType: "sales_order",
                    productId: line.productId,
                    categoryId: product.categoryId ?? null,
                    contactId: data.customerId,
                }));
            const taxRate = line.taxRate ?? 0;
            const lineTotal = line.qty * line.unitPrice * (1 + taxRate / 100);
            await tx.salesOrderLine.create({
                data: {
                    salesOrderId: salesOrder.id,
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
        return salesOrder;
    });
};
export const listSalesOrders = async (companyId) => {
    return prisma.salesOrder.findMany({
        where: { companyId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const getSalesOrder = async (id) => {
    const so = await prisma.salesOrder.findUnique({
        where: { id },
        include: { lines: true },
    });
    if (!so) {
        throw new ApiError(404, "Sales order not found");
    }
    return so;
};
export const updateSalesOrder = async (id, data) => {
    try {
        return await prisma.salesOrder.update({ where: { id }, data });
    }
    catch (error) {
        throw new ApiError(404, "Sales order not found", error);
    }
};
export const deleteSalesOrder = async (id) => {
    try {
        return await prisma.salesOrder.delete({ where: { id } });
    }
    catch (error) {
        throw new ApiError(404, "Sales order not found", error);
    }
};
//# sourceMappingURL=salesOrderController.js.map