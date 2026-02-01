import { prisma } from "../config/prisma.js";
import { supportsOrderJournalSourceTypes } from "./journalService.js";

const toKey = (analyticAccountId: string | null) => analyticAccountId ?? "unassigned";

export const budgetVsActual = async (companyId: string, start: Date, end: Date) => {
  const budgets = await prisma.budget.findMany({
    where: {
      companyId,
      periodStart: { lte: end },
      periodEnd: { gte: start },
    },
    include: {
      revisions: {
        include: { lines: true },
        orderBy: { revisionNo: "desc" },
        take: 1,
      },
    },
  });

  const budgetMap = new Map<string, number>();
  for (const budget of budgets) {
    const latest = budget.revisions[0];
    if (!latest) continue;
    for (const line of latest.lines) {
      const key = toKey(line.analyticAccountId);
      budgetMap.set(key, (budgetMap.get(key) ?? 0) + Number(line.amount));
    }
  }

  const billLines = await prisma.vendorBillLine.findMany({
    where: {
      analyticAccountId: { not: null },
      bill: {
        companyId,
        status: "posted",
        billDate: { gte: start, lte: end },
      },
    },
    select: { analyticAccountId: true, lineTotal: true },
  });

  const invoiceLines = await prisma.customerInvoiceLine.findMany({
    where: {
      analyticAccountId: { not: null },
      invoice: {
        companyId,
        status: "posted",
        invoiceDate: { gte: start, lte: end },
      },
    },
    select: { analyticAccountId: true, lineTotal: true },
  });

  const includeOrders = await supportsOrderJournalSourceTypes();
  const includeManualOrders = !includeOrders;
  const [postedInvoiceSo, postedBillPo] = includeOrders
    ? await Promise.all([
        prisma.customerInvoice.findMany({
          where: { companyId, status: "posted", soId: { not: null } },
          select: { soId: true },
        }),
        prisma.vendorBill.findMany({
          where: { companyId, status: "posted", poId: { not: null } },
          select: { poId: true },
        }),
      ])
    : [[], []];

  const postedSoIds = new Set(postedInvoiceSo.map((row) => row.soId).filter(Boolean));
  const postedPoIds = new Set(postedBillPo.map((row) => row.poId).filter(Boolean));

  const journalLines = includeOrders || includeManualOrders
    ? await prisma.journalLine.findMany({
        where: {
          analyticAccountId: { not: null },
          entry: {
            companyId,
            status: "posted",
            entryDate: { gte: start, lte: end },
            sourceType: includeOrders ? { in: ["sales_order", "purchase_order"] } : "manual",
            ...(includeManualOrders
              ? {
                  OR: [
                    { memo: { startsWith: "Sales Order " } },
                    { memo: { startsWith: "Purchase Order " } },
                  ],
                }
              : {}),
          },
        },
        select: {
          analyticAccountId: true,
          debit: true,
          credit: true,
          entry: { select: { sourceType: true, sourceId: true, memo: true } },
        },
      })
    : [];

  const actualMap = new Map<string, number>();
  for (const line of billLines) {
    const key = toKey(line.analyticAccountId);
    actualMap.set(key, (actualMap.get(key) ?? 0) + Number(line.lineTotal));
  }
  for (const line of invoiceLines) {
    const key = toKey(line.analyticAccountId);
    actualMap.set(key, (actualMap.get(key) ?? 0) + Number(line.lineTotal));
  }

  for (const line of journalLines) {
    const memo = line.entry.memo ?? "";
    const isSalesOrder = line.entry.sourceType === "sales_order" || memo.startsWith("Sales Order ");
    const isPurchaseOrder = line.entry.sourceType === "purchase_order" || memo.startsWith("Purchase Order ");
    if (isSalesOrder && line.entry.sourceId) {
      if (postedSoIds.has(line.entry.sourceId)) continue;
    }
    if (isPurchaseOrder && line.entry.sourceId) {
      if (postedPoIds.has(line.entry.sourceId)) continue;
    }
    const key = toKey(line.analyticAccountId);
    const amount = Number(line.debit) - Number(line.credit);
    actualMap.set(key, (actualMap.get(key) ?? 0) + amount);
  }

  const keys = new Set([...budgetMap.keys(), ...actualMap.keys()]);
  const results = Array.from(keys).map((key) => {
    const budgetedAmount = budgetMap.get(key) ?? 0;
    const actualAmount = actualMap.get(key) ?? 0;
    const variance = budgetedAmount - actualAmount;
    const achievementPercentage = budgetedAmount === 0 ? 0 : (actualAmount / budgetedAmount) * 100;
    const remainingBalance = budgetedAmount - actualAmount;
    return { analyticAccountId: key === "unassigned" ? null : key, budgetedAmount, actualAmount, variance, achievementPercentage, remainingBalance };
  });

  return results;
};

export const budgetDashboardSummary = async (companyId: string, start: Date, end: Date) => {
  const rows = await budgetVsActual(companyId, start, end);
  const totals = rows.reduce(
    (acc, row) => {
      acc.budgeted += row.budgetedAmount;
      acc.actual += row.actualAmount;
      return acc;
    },
    { budgeted: 0, actual: 0 }
  );
  const variance = totals.budgeted - totals.actual;
  const achievementPercentage = totals.budgeted === 0 ? 0 : (totals.actual / totals.budgeted) * 100;
  return { ...totals, variance, achievementPercentage };
};

export const budgetTopOverUnder = async (
  companyId: string,
  start: Date,
  end: Date,
  limit: number,
  direction: "over" | "under"
) => {
  const rows = await budgetVsActual(companyId, start, end);
  const sorted = rows.sort((a, b) =>
    direction === "over" ? b.actualAmount - a.actualAmount : b.remainingBalance - a.remainingBalance
  );
  return sorted.slice(0, limit);
};

export const budgetTrend = async (companyId: string, start: Date, end: Date) => {
  const toKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const addMonth = (date: Date) => {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return next;
  };

  const billLines = await prisma.vendorBillLine.findMany({
    where: {
      bill: {
        companyId,
        status: "posted",
        billDate: { gte: start, lte: end },
      },
    },
    select: { lineTotal: true, bill: { select: { billDate: true } } },
  });

  const invoiceLines = await prisma.customerInvoiceLine.findMany({
    where: {
      invoice: {
        companyId,
        status: "posted",
        invoiceDate: { gte: start, lte: end },
      },
    },
    select: { lineTotal: true, invoice: { select: { invoiceDate: true } } },
  });

  const includeOrders = await supportsOrderJournalSourceTypes();
  const includeManualOrders = !includeOrders;
  const [postedInvoiceSo, postedBillPo] = includeOrders
    ? await Promise.all([
        prisma.customerInvoice.findMany({
          where: { companyId, status: "posted", soId: { not: null } },
          select: { soId: true },
        }),
        prisma.vendorBill.findMany({
          where: { companyId, status: "posted", poId: { not: null } },
          select: { poId: true },
        }),
      ])
    : [[], []];

  const postedSoIds = new Set(postedInvoiceSo.map((row) => row.soId).filter(Boolean));
  const postedPoIds = new Set(postedBillPo.map((row) => row.poId).filter(Boolean));

  const journalLines = includeOrders || includeManualOrders
    ? await prisma.journalLine.findMany({
        where: {
          entry: {
            companyId,
            status: "posted",
            entryDate: { gte: start, lte: end },
            sourceType: includeOrders ? { in: ["sales_order", "purchase_order"] } : "manual",
            ...(includeManualOrders
              ? {
                  OR: [
                    { memo: { startsWith: "Sales Order " } },
                    { memo: { startsWith: "Purchase Order " } },
                  ],
                }
              : {}),
          },
        },
        select: {
          debit: true,
          credit: true,
          entry: { select: { entryDate: true, sourceType: true, sourceId: true, memo: true } },
        },
      })
    : [];

  const byMonth = new Map<string, { actualAmount: number; budgetedAmount: number }>();

  const addActual = (date: Date, amount: number) => {
    const key = toKey(date);
    const current = byMonth.get(key) ?? { actualAmount: 0, budgetedAmount: 0 };
    current.actualAmount += amount;
    byMonth.set(key, current);
  };

  for (const line of billLines) {
    addActual(line.bill.billDate, Number(line.lineTotal));
  }
  for (const line of invoiceLines) {
    addActual(line.invoice.invoiceDate, Number(line.lineTotal));
  }

  for (const line of journalLines) {
    const sourceId = line.entry.sourceId ?? null;
    const memo = line.entry.memo ?? "";
    const isSalesOrder = line.entry.sourceType === "sales_order" || memo.startsWith("Sales Order ");
    const isPurchaseOrder = line.entry.sourceType === "purchase_order" || memo.startsWith("Purchase Order ");
    if (isSalesOrder && sourceId) {
      if (postedSoIds.has(sourceId)) continue;
    }
    if (isPurchaseOrder && sourceId) {
      if (postedPoIds.has(sourceId)) continue;
    }
    addActual(line.entry.entryDate, Number(line.debit) - Number(line.credit));
  }

  const budgets = await prisma.budget.findMany({
    where: {
      companyId,
      periodStart: { lte: end },
      periodEnd: { gte: start },
      status: { not: "archived" },
    },
    include: {
      revisions: {
        include: { lines: true },
        orderBy: { revisionNo: "desc" },
        take: 1,
      },
    },
  });

  for (const budget of budgets) {
    const latest = budget.revisions[0];
    if (!latest) continue;
    const total = latest.lines.reduce((sum, line) => sum + Number(line.amount), 0);
    if (total === 0) continue;

    const periodStart = new Date(budget.periodStart);
    const periodEnd = new Date(budget.periodEnd);
    const months: Date[] = [];
    for (let cursor = new Date(periodStart); cursor <= periodEnd; cursor = addMonth(cursor)) {
      months.push(new Date(cursor));
    }
    const allocation = total / Math.max(months.length, 1);

    for (const month of months) {
      if (month < start || month > end) continue;
      const key = toKey(month);
      const current = byMonth.get(key) ?? { actualAmount: 0, budgetedAmount: 0 };
      current.budgetedAmount += allocation;
      byMonth.set(key, current);
    }
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([period, values]) => ({
      period,
      actualAmount: values.actualAmount,
      budgetedAmount: values.budgetedAmount,
      forecastAmount: values.budgetedAmount,
    }));
};
