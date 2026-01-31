import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { getContactTagIds, resolveAnalyticAccountId } from "../services/autoAnalyticService.js";
import { calculatePaymentStatus } from "../services/paymentService.js";
import {
  formatBadgeLabel,
  formatCurrency,
  formatDate,
  mapDocStatusToBadge,
} from "../utils/formatters.js";
import { assertDocStatusTransition } from "../utils/workflow.js";

export const createInvoice = async (data: {
  companyId: string;
  customerId: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate?: string | null;
  status: "draft" | "posted" | "cancelled";
  currency?: string;
  soId?: string | null;
  lines: Array<{
    productId?: string | null;
    analyticAccountId?: string | null;
    glAccountId?: string | null;
    description?: string | null;
    qty: number;
    unitPrice: number;
    taxRate?: number;
  }>;
}) => {
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const contactTagIds = await getContactTagIds(data.customerId);
    const invoice = await tx.customerInvoice.create({
      data: {
        companyId: data.companyId,
        customerId: data.customerId,
        invoiceNo: data.invoiceNo,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status,
        currency: data.currency ?? "INR",
        soId: data.soId ?? null,
        paymentState: "not_paid",
      },
    });

    for (const line of data.lines) {
      let categoryId: string | null = null;
      if (line.productId) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
        });
        categoryId = product?.categoryId ?? null;
      }

      const resolvedAnalytic = line.analyticAccountId
        ? null
        : await resolveAnalyticAccountId({
            companyId: data.companyId,
            docType: "customer_invoice",
            productId: line.productId ?? null,
            categoryId,
            contactId: data.customerId,
            contactTagIds,
          });

      const taxRate = line.taxRate ?? 0;
      const lineTotal = line.qty * line.unitPrice * (1 + taxRate / 100);
      totalAmount += lineTotal;

      await tx.customerInvoiceLine.create({
        data: {
          customerInvoiceId: invoice.id,
          productId: line.productId ?? null,
          analyticAccountId: line.analyticAccountId ?? resolvedAnalytic?.analyticAccountId ?? null,
          autoAnalyticModelId: resolvedAnalytic?.modelId ?? null,
          autoAnalyticRuleId: resolvedAnalytic?.ruleId ?? null,
          matchedFieldsCount: resolvedAnalytic?.matchedFieldsCount ?? null,
          glAccountId: line.glAccountId ?? null,
          description: line.description ?? null,
          qty: line.qty,
          unitPrice: line.unitPrice,
          taxRate,
          lineTotal,
        },
      });
    }

    return tx.customerInvoice.update({
      where: { id: invoice.id },
      data: {
        totalAmount,
        paymentState: calculatePaymentStatus(0, totalAmount),
      },
    });
  });
};

export const createInvoiceFromSO = async (
  soId: string,
  invoiceNo: string,
  invoiceDate: string,
) => {
  return prisma.$transaction(async (tx) => {
    const so = await tx.salesOrder.findUnique({
      where: { id: soId },
      include: { lines: true },
    });
    if (!so) {
      throw new ApiError(404, "Sales order not found");
    }

    const invoice = await tx.customerInvoice.create({
      data: {
        companyId: so.companyId,
        customerId: so.customerId,
        invoiceNo,
        invoiceDate: new Date(invoiceDate),
        status: "draft",
        currency: so.currency,
        soId: so.id,
        paymentState: "not_paid",
      },
    });

    let totalAmount = 0;
    for (const line of so.lines) {
      totalAmount += Number(line.lineTotal);
      await tx.customerInvoiceLine.create({
        data: {
          customerInvoiceId: invoice.id,
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

    return tx.customerInvoice.update({
      where: { id: invoice.id },
      data: {
        totalAmount,
        paymentState: calculatePaymentStatus(0, totalAmount),
      },
    });
  });
};

export const listInvoices = async (companyId: string) => {
  return prisma.customerInvoice.findMany({
    where: { companyId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listInvoicesTable = async (companyId: string) => {
  const invoices = await prisma.customerInvoice.findMany({
    where: { companyId },
    select: {
      id: true,
      invoiceNo: true,
      invoiceDate: true,
      dueDate: true,
      totalAmount: true,
      currency: true,
      status: true,
      paymentState: true,
      customer: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return invoices.map((invoice) => ({
    id: invoice.invoiceNo,
    recordId: invoice.id,
    customer: invoice.customer.displayName,
    amount: formatCurrency(Number(invoice.totalAmount), invoice.currency),
    dueDate: formatDate(invoice.dueDate) ?? "",
    issueDate: formatDate(invoice.invoiceDate) ?? "",
    status: mapDocStatusToBadge(invoice.status, invoice.paymentState),
    statusLabel: formatBadgeLabel(
      mapDocStatusToBadge(invoice.status, invoice.paymentState),
    ),
  }));
};

export const getInvoice = async (id: string) => {
  const invoice = await prisma.customerInvoice.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }
  return invoice;
};

export const updateInvoice = async (
  id: string,
  data: Partial<Record<string, unknown>>,
) => {
  try {
    const current = await prisma.customerInvoice.findUnique({ where: { id } });
    if (!current) {
      throw new ApiError(404, "Invoice not found");
    }
    if (data.status) {
      assertDocStatusTransition(current.status, data.status as any);
    }
    const { totalAmount, paidAmount, paymentState, ...rest } = data as Record<string, unknown>;
    return await prisma.customerInvoice.update({ where: { id }, data: rest });
  } catch (error) {
    throw new ApiError(404, "Invoice not found", error);
  }
};
