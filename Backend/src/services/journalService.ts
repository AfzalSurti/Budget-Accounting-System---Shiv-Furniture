import { prisma } from "../config/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";

const ensureAccount = async (
  tx: Prisma.TransactionClient,
  companyId: string,
  code: string,
  name: string,
  accountType: "asset" | "liability" | "income" | "expense",
) => {
  try {
    return tx.gLAccount.upsert({
      where: { companyId_code: { companyId, code } },
      update: { name, accountType },
      create: { companyId, code, name, accountType, isActive: true },
    });
  } catch (error) {
    console.error(`Failed to ensure account ${code} for company ${companyId}:`, error);
    throw error;
  }
};

export const ensureDefaultAccounts = async (
  tx: Prisma.TransactionClient,
  companyId: string,
) => {
  const [cash, receivable, payable, revenue, expense] = await Promise.all([
    ensureAccount(tx, companyId, "1100", "Cash/Bank", "asset"),
    ensureAccount(tx, companyId, "1200", "Accounts Receivable", "asset"),
    ensureAccount(tx, companyId, "2000", "Accounts Payable", "liability"),
    ensureAccount(tx, companyId, "4000", "Sales Revenue", "income"),
    ensureAccount(tx, companyId, "5000", "Operating Expense", "expense"),
  ]);

  return {
    cashId: cash.id,
    receivableId: receivable.id,
    payableId: payable.id,
    revenueId: revenue.id,
    expenseId: expense.id,
  };
};

const findExisting = async (
  tx: Prisma.TransactionClient,
  companyId: string,
  sourceType:
    | "customer_invoice"
    | "vendor_bill"
    | "payment"
    | "sales_order"
    | "purchase_order"
    | "manual",
  sourceId: string,
) => {
  return tx.journalEntry.findFirst({
    where: { companyId, sourceType, sourceId },
    select: { id: true },
  });
};

export const createInvoiceJournalEntry = async (
  tx: Prisma.TransactionClient,
  payload: {
    companyId: string;
    invoiceId: string;
    invoiceDate: Date;
    customerId: string;
    lines: Array<{
      lineTotal: number;
      analyticAccountId?: string | null;
      productId?: string | null;
      description?: string | null;
      glAccountId?: string | null;
    }>;
  },
) => {
  const existing = await findExisting(tx, payload.companyId, "customer_invoice", payload.invoiceId);
  if (existing) return;

  const defaults = await ensureDefaultAccounts(tx, payload.companyId);
  const total = payload.lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0);
  if (total <= 0) return;

  await tx.journalEntry.create({
    data: {
      companyId: payload.companyId,
      entryDate: payload.invoiceDate,
      status: "posted",
      sourceType: "customer_invoice",
      sourceId: payload.invoiceId,
      memo: `Invoice ${payload.invoiceId}`,
      lines: {
        create: [
          {
            glAccountId: defaults.receivableId,
            contactId: payload.customerId,
            debit: total,
            credit: 0,
          },
          ...payload.lines.map((line) => ({
            glAccountId: line.glAccountId ?? defaults.revenueId,
            analyticAccountId: line.analyticAccountId ?? null,
            productId: line.productId ?? null,
            description: line.description ?? null,
            debit: 0,
            credit: Number(line.lineTotal || 0),
          })),
        ],
      },
    },
  });
};

export const createBillJournalEntry = async (
  tx: Prisma.TransactionClient,
  payload: {
    companyId: string;
    billId: string;
    billDate: Date;
    vendorId: string;
    lines: Array<{
      lineTotal: number;
      analyticAccountId?: string | null;
      productId?: string | null;
      description?: string | null;
      glAccountId?: string | null;
    }>;
  },
) => {
  const existing = await findExisting(tx, payload.companyId, "vendor_bill", payload.billId);
  if (existing) return;

  const defaults = await ensureDefaultAccounts(tx, payload.companyId);
  const total = payload.lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0);
  if (total <= 0) return;

  await tx.journalEntry.create({
    data: {
      companyId: payload.companyId,
      entryDate: payload.billDate,
      status: "posted",
      sourceType: "vendor_bill",
      sourceId: payload.billId,
      memo: `Vendor Bill ${payload.billId}`,
      lines: {
        create: [
          {
            glAccountId: defaults.payableId,
            contactId: payload.vendorId,
            debit: 0,
            credit: total,
          },
          ...payload.lines.map((line) => ({
            glAccountId: line.glAccountId ?? defaults.expenseId,
            analyticAccountId: line.analyticAccountId ?? null,
            productId: line.productId ?? null,
            description: line.description ?? null,
            debit: Number(line.lineTotal || 0),
            credit: 0,
          })),
        ],
      },
    },
  });
};

export const createPaymentJournalEntry = async (
  tx: Prisma.TransactionClient,
  payload: {
    companyId: string;
    paymentId: string;
    paymentDate: Date;
    contactId: string;
    direction: "inbound" | "outbound";
    amount: number;
    memo?: string | null;
  },
) => {
  const existing = await findExisting(tx, payload.companyId, "payment", payload.paymentId);
  if (existing) return;

  const defaults = await ensureDefaultAccounts(tx, payload.companyId);
  if (payload.amount <= 0) return;

  const isInbound = payload.direction === "inbound";
  await tx.journalEntry.create({
    data: {
      companyId: payload.companyId,
      entryDate: payload.paymentDate,
      status: "posted",
      sourceType: "payment",
      sourceId: payload.paymentId,
      memo: payload.memo ?? `Payment ${payload.paymentId}`,
      lines: {
        create: [
          {
            glAccountId: defaults.cashId,
            contactId: payload.contactId,
            debit: isInbound ? payload.amount : 0,
            credit: isInbound ? 0 : payload.amount,
          },
          {
            glAccountId: isInbound ? defaults.receivableId : defaults.payableId,
            contactId: payload.contactId,
            debit: isInbound ? 0 : payload.amount,
            credit: isInbound ? payload.amount : 0,
          },
        ],
      },
    },
  });
};

export const createSalesOrderJournalEntry = async (
  tx: Prisma.TransactionClient,
  payload: {
    companyId: string;
    salesOrderId: string;
    orderDate: Date;
    customerId: string;
    lines: Array<{
      lineTotal: number;
      analyticAccountId?: string | null;
      productId?: string | null;
      description?: string | null;
      glAccountId?: string | null;
    }>;
  },
) => {
  const supportsOrders = await supportsOrderJournalSourceTypes();
  const sourceType = supportsOrders ? "sales_order" : "manual";

  const existing = await findExisting(tx, payload.companyId, sourceType, payload.salesOrderId);
  if (existing) return;

  const defaults = await ensureDefaultAccounts(tx, payload.companyId);
  const total = payload.lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0);
  if (total <= 0) return;

  await tx.journalEntry.create({
    data: {
      companyId: payload.companyId,
      entryDate: payload.orderDate,
      status: "posted",
      sourceType,
      sourceId: payload.salesOrderId,
      memo: `Sales Order ${payload.salesOrderId}`,
      lines: {
        create: [
          {
            glAccountId: defaults.receivableId,
            contactId: payload.customerId,
            debit: total,
            credit: 0,
          },
          ...payload.lines.map((line) => ({
            glAccountId: line.glAccountId ?? defaults.revenueId,
            analyticAccountId: line.analyticAccountId ?? null,
            productId: line.productId ?? null,
            description: line.description ?? null,
            debit: 0,
            credit: Number(line.lineTotal || 0),
          })),
        ],
      },
    },
  });
};

export const createPurchaseOrderJournalEntry = async (
  tx: Prisma.TransactionClient,
  payload: {
    companyId: string;
    purchaseOrderId: string;
    orderDate: Date;
    vendorId: string;
    lines: Array<{
      lineTotal: number;
      analyticAccountId?: string | null;
      productId?: string | null;
      description?: string | null;
      glAccountId?: string | null;
    }>;
  },
) => {
  const supportsOrders = await supportsOrderJournalSourceTypes();
  const sourceType = supportsOrders ? "purchase_order" : "manual";

  const existing = await findExisting(tx, payload.companyId, sourceType, payload.purchaseOrderId);
  if (existing) return;

  const defaults = await ensureDefaultAccounts(tx, payload.companyId);
  const total = payload.lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0);
  if (total <= 0) return;

  await tx.journalEntry.create({
    data: {
      companyId: payload.companyId,
      entryDate: payload.orderDate,
      status: "posted",
      sourceType,
      sourceId: payload.purchaseOrderId,
      memo: `Purchase Order ${payload.purchaseOrderId}`,
      lines: {
        create: [
          {
            glAccountId: defaults.payableId,
            contactId: payload.vendorId,
            debit: 0,
            credit: total,
          },
          ...payload.lines.map((line) => ({
            glAccountId: line.glAccountId ?? defaults.expenseId,
            analyticAccountId: line.analyticAccountId ?? null,
            productId: line.productId ?? null,
            description: line.description ?? null,
            debit: Number(line.lineTotal || 0),
            credit: 0,
          })),
        ],
      },
    },
  });
};

export const supportsOrderJournalSourceTypes = async () => {
  try {
    const rows = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'JournalSourceType'
    `;
    const labels = new Set(rows.map((row) => row.enumlabel));
    return labels.has("sales_order") && labels.has("purchase_order");
  } catch (error) {
    console.error("Failed to inspect JournalSourceType enum:", error);
    return false;
  }
};

export const backfillOrderJournals = async (companyId: string) => {
  const supportsOrders = await supportsOrderJournalSourceTypes();
  const soSourceType = supportsOrders ? "sales_order" : "manual";
  const poSourceType = supportsOrders ? "purchase_order" : "manual";

  const [soEntries, poEntries] = await Promise.all([
    prisma.journalEntry.findMany({
      where: {
        companyId,
        sourceType: soSourceType,
        ...(supportsOrders ? {} : { memo: { startsWith: "Sales Order " } }),
      },
      select: { sourceId: true },
    }),
    prisma.journalEntry.findMany({
      where: {
        companyId,
        sourceType: poSourceType,
        ...(supportsOrders ? {} : { memo: { startsWith: "Purchase Order " } }),
      },
      select: { sourceId: true },
    }),
  ]);

  const existingSo = new Set(soEntries.map((e) => e.sourceId).filter(Boolean));
  const existingPo = new Set(poEntries.map((e) => e.sourceId).filter(Boolean));

  const [salesOrders, purchaseOrders] = await Promise.all([
    prisma.salesOrder.findMany({
      where: { companyId, status: { in: ["confirmed", "done"] } },
      include: { lines: true },
    }),
    prisma.purchaseOrder.findMany({
      where: { companyId, status: { in: ["confirmed", "done"] } },
      include: { lines: true },
    }),
  ]);

  for (const so of salesOrders) {
    if (existingSo.has(so.id)) continue;
    await prisma.$transaction(
      async (tx) => {
      await createSalesOrderJournalEntry(tx, {
        companyId: so.companyId,
        salesOrderId: so.id,
        orderDate: so.orderDate,
        customerId: so.customerId,
        lines: so.lines.map((line) => ({
          lineTotal: Number(line.lineTotal),
          analyticAccountId: line.analyticAccountId ?? null,
          productId: line.productId ?? null,
          description: line.description ?? null,
          glAccountId: null,
        })),
      });
      },
      { timeout: 20000, maxWait: 5000 },
    );
  }

  for (const po of purchaseOrders) {
    if (existingPo.has(po.id)) continue;
    await prisma.$transaction(
      async (tx) => {
      await createPurchaseOrderJournalEntry(tx, {
        companyId: po.companyId,
        purchaseOrderId: po.id,
        orderDate: po.orderDate,
        vendorId: po.vendorId,
        lines: po.lines.map((line) => ({
          lineTotal: Number(line.lineTotal),
          analyticAccountId: line.analyticAccountId ?? null,
          productId: line.productId ?? null,
          description: line.description ?? null,
          glAccountId: null,
        })),
      });
      },
      { timeout: 20000, maxWait: 5000 },
    );
  }
};
