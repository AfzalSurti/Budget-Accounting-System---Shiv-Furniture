import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { getContactTagIds, resolveAnalyticAccountId } from "../services/autoAnalyticService.js";
import {
  formatBadgeLabel,
  formatCurrency,
  formatDate,
  mapOrderStatusToBadge,
} from "../utils/formatters.js";
import { assertOrderStatusTransition } from "../utils/workflow.js";
import { renderDocumentPdf } from "../utils/pdf.js";

export const createSalesOrder = async (data: {
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
}) => {
  return prisma.$transaction(
    async (tx) => {
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

      const productIds = Array.from(new Set(data.lines.map((line) => line.productId)));
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, categoryId: true },
      });
      if (products.length !== productIds.length) {
        throw new ApiError(400, "Invalid product");
      }
      const productMap = new Map(products.map((product) => [product.id, product]));

      const linePayloads = await Promise.all(
        data.lines.map(async (line) => {
          const product = productMap.get(line.productId);
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

          return {
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
          };
        }),
      );

      await tx.salesOrderLine.createMany({ data: linePayloads });

      return salesOrder;
    },
    { timeout: 15000 },
  );
};

export const listSalesOrders = async (companyId: string) => {
  return prisma.salesOrder.findMany({
    where: { companyId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listSalesOrdersTable = async (companyId: string) => {
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
    const totalAmount = order.lines.reduce(
      (sum, line) => sum + Number(line.lineTotal),
      0,
    );
    return {
      id: order.soNo,
      recordId: order.id,
      rawStatus: order.status,
      customer: order.customer.displayName,
      amount: formatCurrency(totalAmount, order.currency),
      date: formatDate(order.orderDate) ?? "",
      deliveryDate: formatDate(order.deliveryDate) ?? "",
      status: mapOrderStatusToBadge(order.status),
      statusLabel: formatBadgeLabel(mapOrderStatusToBadge(order.status)),
    };
  });
};

export const getSalesOrder = async (id: string) => {
  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!so) {
    throw new ApiError(404, "Sales order not found");
  }
  return so;
};

export const updateSalesOrder = async (
  id: string,
  data: Partial<Record<string, unknown>>,
) => {
  try {
    const current = await prisma.salesOrder.findUnique({ where: { id } });
    if (!current) {
      throw new ApiError(404, "Sales order not found");
    }
    if (data.status) {
      assertOrderStatusTransition(current.status, data.status as any);
    }
    return await prisma.salesOrder.update({ where: { id }, data });
  } catch (error) {
    throw new ApiError(404, "Sales order not found", error);
  }
};

export const deleteSalesOrder = async (id: string) => {
  try {
    return await prisma.salesOrder.delete({ where: { id } });
  } catch (error) {
    throw new ApiError(404, "Sales order not found", error);
  }
};

export const getSalesOrderPdf = async (id: string) => {
  const so = await prisma.salesOrder.findUnique({
    where: { id },
    include: {
      company: true,
      customer: true,
      lines: { include: { product: true } },
    },
  });
  if (!so) {
    throw new ApiError(404, "Sales order not found");
  }

  const lines = so.lines.map((line) => {
    const qty = Number(line.qty);
    const unit = Number(line.unitPrice);
    const taxRate = Number(line.taxRate);
    return {
      description: line.description ?? line.product?.name ?? "Item",
      qty,
      unitPrice: unit,
      taxRate,
      lineTotal: Number(line.lineTotal),
    };
  });

  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const grandTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const taxTotal = grandTotal - subtotal;

  const buffer = await renderDocumentPdf(
    {
      title: "Sales Order",
      companyName: so.company.name,
      docNo: so.soNo,
      docDate: formatDate(so.orderDate) ?? "",
      contactLabel: "Customer",
      contactName: so.customer.displayName,
      statusLabel: formatBadgeLabel(mapOrderStatusToBadge(so.status)),
      currency: so.currency,
    },
    lines,
    { subtotal, taxTotal, grandTotal },
  );

  return {
    buffer,
    filename: `${so.soNo}.pdf`,
  };
};
