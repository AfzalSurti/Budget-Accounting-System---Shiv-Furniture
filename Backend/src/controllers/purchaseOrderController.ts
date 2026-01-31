import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { resolveAnalyticAccountId } from "../services/autoAnalyticService.js";
import {
  formatBadgeLabel,
  formatCurrency,
  formatDate,
  mapOrderStatusToBadge,
} from "../utils/formatters.js";

export const createPurchaseOrder = async (data: {
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
}) => {
  return prisma.$transaction(async (tx) => {
    const purchaseOrder = await tx.purchaseOrder.create({
      data: {
        companyId: data.companyId,
        vendorId: data.vendorId,
        poNo: data.poNo,
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

      const resolvedAnalytic =
        line.analyticAccountId ??
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

export const listPurchaseOrders = async (companyId: string) => {
  return prisma.purchaseOrder.findMany({
    where: { companyId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listPurchaseOrdersTable = async (companyId: string) => {
  const orders = await prisma.purchaseOrder.findMany({
    where: { companyId },
    select: {
      id: true,
      poNo: true,
      orderDate: true,
      deliveryDate: true,
      currency: true,
      status: true,
      lines: { select: { lineTotal: true } },
      vendor: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((order) => {
    const totalAmount = order.lines.reduce(
      (sum, line) => sum + Number(line.lineTotal),
      0,
    );
    return {
      id: order.poNo,
      recordId: order.id,
      vendor: order.vendor.displayName,
      amount: formatCurrency(totalAmount, order.currency),
      date: formatDate(order.orderDate) ?? "",
      deliveryDate: formatDate(order.deliveryDate) ?? "",
      status: mapOrderStatusToBadge(order.status),
      statusLabel: formatBadgeLabel(mapOrderStatusToBadge(order.status)),
    };
  });
};

export const getPurchaseOrder = async (id: string) => {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!po) {
    throw new ApiError(404, "Purchase order not found");
  }
  return po;
};

export const updatePurchaseOrder = async (
  id: string,
  data: Partial<Record<string, unknown>>,
) => {
  try {
    return await prisma.purchaseOrder.update({ where: { id }, data });
  } catch (error) {
    throw new ApiError(404, "Purchase order not found", error);
  }
};

export const deletePurchaseOrder = async (id: string) => {
  try {
    return await prisma.purchaseOrder.delete({ where: { id } });
  } catch (error) {
    throw new ApiError(404, "Purchase order not found", error);
  }
};
