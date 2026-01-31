import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { getContactTagIds, resolveAnalyticAccountId } from "../services/autoAnalyticService.js";
import { formatBadgeLabel, formatCurrency, formatDate, mapOrderStatusToBadge, } from "../utils/formatters.js";
import { assertOrderStatusTransition } from "../utils/workflow.js";
export const createSalesOrder = async (data) => {
    return prisma.$transaction(async (tx) => {
        const contactTagIds = await getContactTagIds(data.customerId);
        const salesOrder = await tx.salesOrder.create({
            data: {
                companyId: data.companyId,
                customerId: data.customerId,
                soNo: data.soNo,
                orderDate: new Date(data.orderDate),
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
                status: data.status,
                currency: data.currency ?? "INR",
                notes: data.notes ?? null,
            },
        });
        for (const line of data.lines) {
            const product = await tx.product.findUnique({
                where: { id: line.productId },
            });
            if (!product) {
                throw new ApiError(400, "Invalid product");
            }
            const resolvedAnalytic = line.analyticAccountId
                ? null
                : await resolveAnalyticAccountId({
                    companyId: data.companyId,
                    docType: "sales_order",
                    productId: line.productId,
                    categoryId: product.categoryId ?? null,
                    contactId: data.customerId,
                    contactTagIds,
                });
            const taxRate = line.taxRate ?? 0;
            const lineTotal = line.qty * line.unitPrice * (1 + taxRate / 100);
            await tx.salesOrderLine.create({
                data: {
                    salesOrderId: salesOrder.id,
                    productId: line.productId,
                    analyticAccountId: line.analyticAccountId ?? resolvedAnalytic?.analyticAccountId ?? null,
                    autoAnalyticModelId: resolvedAnalytic?.modelId ?? null,
                    autoAnalyticRuleId: resolvedAnalytic?.ruleId ?? null,
                    matchedFieldsCount: resolvedAnalytic?.matchedFieldsCount ?? null,
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
export const listSalesOrdersTable = async (companyId) => {
    const orders = await prisma.salesOrder.findMany({
        where: { companyId },
        select: {
            id: true,
            soNo: true,
            orderDate: true,
            deliveryDate: true,
            currency: true,
            status: true,
            lines: { select: { lineTotal: true } },
            customer: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
    });
    return orders.map((order) => {
        const totalAmount = order.lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
        return {
            id: order.soNo,
            recordId: order.id,
            customer: order.customer.displayName,
            amount: formatCurrency(totalAmount, order.currency),
            date: formatDate(order.orderDate) ?? "",
            deliveryDate: formatDate(order.deliveryDate) ?? "",
            status: mapOrderStatusToBadge(order.status),
            statusLabel: formatBadgeLabel(mapOrderStatusToBadge(order.status)),
        };
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
        const current = await prisma.salesOrder.findUnique({ where: { id } });
        if (!current) {
            throw new ApiError(404, "Sales order not found");
        }
        if (data.status) {
            assertOrderStatusTransition(current.status, data.status);
        }
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