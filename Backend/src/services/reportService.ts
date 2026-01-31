import { prisma } from "../config/prisma.js";

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

  const actualMap = new Map<string, number>();
  for (const line of billLines) {
    const key = toKey(line.analyticAccountId);
    actualMap.set(key, (actualMap.get(key) ?? 0) + Number(line.lineTotal));
  }
  for (const line of invoiceLines) {
    const key = toKey(line.analyticAccountId);
    actualMap.set(key, (actualMap.get(key) ?? 0) + Number(line.lineTotal));
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

  const byMonth = new Map<string, number>();

  const add = (date: Date, amount: number) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + amount);
  };

  for (const line of billLines) {
    add(line.bill.billDate, Number(line.lineTotal));
  }
  for (const line of invoiceLines) {
    add(line.invoice.invoiceDate, Number(line.lineTotal));
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([period, actualAmount]) => ({ period, actualAmount }));
};
