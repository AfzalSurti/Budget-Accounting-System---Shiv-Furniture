import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import {
  getContactTagIds,
  resolveAnalyticAccountId,
} from "../services/autoAnalyticService.js";
import { calculatePaymentStatus } from "../services/paymentService.js";
import {
  formatBadgeLabel,
  formatCurrency,
  formatDate,
  mapDocStatusToBadge,
} from "../utils/formatters.js";
import { assertDocStatusTransition } from "../utils/workflow.js";
import { renderDocumentPdf } from "../utils/pdf.js";
import { createBillJournalEntry } from "../services/journalService.js";

export const createVendorBill = async (data: {
  companyId: string;
  vendorId: string;
  billNo: string;
  billDate: string;
  dueDate?: string | null;
  status: "draft" | "posted" | "cancelled";
  currency?: string;
  poId?: string | null;
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
  return prisma.$transaction(
    async (tx) => {
      let totalAmount = 0;
      const contactTagIds = await getContactTagIds(data.vendorId);
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
          paymentState: "not_paid",
        },
      });

      const productIds = Array.from(
        new Set(data.lines.map((line) => line.productId).filter(Boolean))
      ) as string[];
      const products = productIds.length
        ? await tx.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, categoryId: true },
          })
        : [];
      const productMap = new Map(products.map((product) => [product.id, product]));
      for (const line of data.lines) {
        const categoryId = line.productId
          ? productMap.get(line.productId)?.categoryId ?? null
          : null;

        const resolvedAnalytic = line.analyticAccountId
          ? null
          : await resolveAnalyticAccountId({
              companyId: data.companyId,
              docType: "vendor_bill",
              productId: line.productId ?? null,
              categoryId,
              contactId: data.vendorId,
              contactTagIds,
            });

        const analyticAccountId =
          line.analyticAccountId ?? resolvedAnalytic?.analyticAccountId ?? null;
        const autoAnalyticModelId = resolvedAnalytic?.modelId ?? null;
        const autoAnalyticRuleId = resolvedAnalytic?.ruleId ?? null;

        const taxRate = line.taxRate ?? 0;
        const lineTotal = line.qty * line.unitPrice * (1 + taxRate / 100);
        totalAmount += lineTotal;

        await tx.vendorBillLine.create({
          data: {
            vendorBillId: bill.id,
            productId: line.productId ?? null,
            analyticAccountId,
            autoAnalyticModelId,
            autoAnalyticRuleId,
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

      const updated = await tx.vendorBill.update({
        where: { id: bill.id },
        data: {
          totalAmount,
          paymentState: calculatePaymentStatus(0, totalAmount),
        },
      });
      if (data.status === "posted") {
        await createBillJournalEntry(tx, {
          companyId: data.companyId,
          billId: updated.id,
          billDate: new Date(data.billDate),
          vendorId: data.vendorId,
          lines: data.lines.map((line) => ({
            lineTotal: line.qty * line.unitPrice * (1 + (line.taxRate ?? 0) / 100),
            analyticAccountId: line.analyticAccountId ?? null,
            productId: line.productId ?? null,
            description: line.description ?? null,
            glAccountId: line.glAccountId ?? null,
          })),
        });
      }
      return updated;
    },
    { timeout: 15000 },
  );
};

export const createVendorBillFromPO = async (
  poId: string,
  billNo: string,
  billDate: string,
) => {
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
        paymentState: "not_paid",
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

    const updated = await tx.vendorBill.update({
      where: { id: bill.id },
      data: {
        totalAmount,
        paymentState: calculatePaymentStatus(0, totalAmount),
      },
    });
    if (updated.status === "posted") {
      await createBillJournalEntry(tx, {
        companyId: updated.companyId,
        billId: updated.id,
        billDate: updated.billDate,
        vendorId: updated.vendorId,
        lines: po.lines.map((line) => ({
          lineTotal: Number(line.lineTotal),
          analyticAccountId: line.analyticAccountId ?? null,
          productId: line.productId ?? null,
          description: line.description ?? null,
          glAccountId: null,
        })),
      });
    }
    return updated;
  });
};

export const listVendorBills = async (companyId: string) => {
  return prisma.vendorBill.findMany({
    where: { companyId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listVendorBillsTable = async (companyId: string) => {
  const bills = await prisma.vendorBill.findMany({
    where: { companyId },
    select: {
      id: true,
      billNo: true,
      billDate: true,
      dueDate: true,
      totalAmount: true,
      paidAmount: true,
      currency: true,
      status: true,
      paymentState: true,
      vendor: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return bills.map((bill) => ({
    id: bill.billNo,
    recordId: bill.id,
    rawStatus: bill.status,
    paymentState: bill.paymentState,
    vendor: bill.vendor.displayName,
    totalAmount: Number(bill.totalAmount),
    paidAmount: Number(bill.paidAmount ?? 0),
    amount: formatCurrency(Number(bill.totalAmount), bill.currency),
    dueDate: formatDate(bill.dueDate) ?? "",
    date: formatDate(bill.billDate) ?? "",
    status: mapDocStatusToBadge(bill.status, bill.paymentState),
    statusLabel: formatBadgeLabel(
      mapDocStatusToBadge(bill.status, bill.paymentState),
    ),
  }));
};

export const getVendorBill = async (id: string) => {
  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: { lines: true },
  });
  if (!bill) {
    throw new ApiError(404, "Vendor bill not found");
  }
  return bill;
};

export const updateVendorBill = async (
  id: string,
  data: Partial<Record<string, unknown>>,
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await tx.vendorBill.findUnique({ where: { id } });
      if (!current) {
        throw new ApiError(404, "Vendor bill not found");
      }
      if (data.status) {
        assertDocStatusTransition(current.status, data.status as any);
      }
      const { totalAmount, paidAmount, paymentState, ...rest } = data as Record<
        string,
        unknown
      >;
      const updated = await tx.vendorBill.update({ where: { id }, data: rest });
      if (current.status !== "posted" && updated.status === "posted") {
        const lines = await tx.vendorBillLine.findMany({
          where: { vendorBillId: id },
        });
        await createBillJournalEntry(tx, {
          companyId: updated.companyId,
          billId: updated.id,
          billDate: updated.billDate,
          vendorId: updated.vendorId,
          lines: lines.map((line) => ({
            lineTotal: Number(line.lineTotal),
            analyticAccountId: line.analyticAccountId ?? null,
            productId: line.productId ?? null,
            description: line.description ?? null,
            glAccountId: line.glAccountId ?? null,
          })),
        });
      }
      return updated;
    });
  } catch (error) {
    throw new ApiError(404, "Vendor bill not found", error);
  }
};

export const getVendorBillPdf = async (id: string) => {
  const bill = await prisma.vendorBill.findUnique({
    where: { id },
    include: {
      company: true,
      vendor: true,
      lines: { include: { product: true } },
    },
  });
  if (!bill) {
    throw new ApiError(404, "Vendor bill not found");
  }

  const lines = bill.lines.map((line) => {
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

  const subtotal = lines.reduce(
    (sum, line) => sum + line.qty * line.unitPrice,
    0,
  );
  const grandTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const taxTotal = grandTotal - subtotal;

  const statusLabel = formatBadgeLabel(
    mapDocStatusToBadge(bill.status, bill.paymentState),
  );

  const buffer = await renderDocumentPdf(
    {
      title: "Vendor Bill",
      companyName: bill.company.name,
      docNo: bill.billNo,
      docDate: formatDate(bill.billDate) ?? "",
      contactLabel: "Vendor",
      contactName: bill.vendor.displayName,
      statusLabel,
      currency: bill.currency,
      paymentStatus: bill.paymentState,
    },
    lines,
    { subtotal, taxTotal, grandTotal },
  );

  return {
    buffer,
    filename: `${bill.billNo}.pdf`,
  };
};
