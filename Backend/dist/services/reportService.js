import { prisma } from "../config/prisma.js";
const toKey = (analyticAccountId) => analyticAccountId ?? "unassigned";
export const budgetVsActual = async (companyId, start, end) => {
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
    const budgetMap = new Map();
    for (const budget of budgets) {
        const latest = budget.revisions[0];
        if (!latest)
            continue;
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
    const actualMap = new Map();
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
export const budgetDashboardSummary = async (companyId, start, end) => {
    const rows = await budgetVsActual(companyId, start, end);
    const totals = rows.reduce((acc, row) => {
        acc.budgeted += row.budgetedAmount;
        acc.actual += row.actualAmount;
        return acc;
    }, { budgeted: 0, actual: 0 });
    const variance = totals.budgeted - totals.actual;
    const achievementPercentage = totals.budgeted === 0 ? 0 : (totals.actual / totals.budgeted) * 100;
    return { ...totals, variance, achievementPercentage };
};
export const budgetTopOverUnder = async (companyId, start, end, limit, direction) => {
    const rows = await budgetVsActual(companyId, start, end);
    const sorted = rows.sort((a, b) => direction === "over" ? b.actualAmount - a.actualAmount : b.remainingBalance - a.remainingBalance);
    return sorted.slice(0, limit);
};
export const budgetTrend = async (companyId, start, end) => {
    const toKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const addMonth = (date) => {
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
    const byMonth = new Map();
    const addActual = (date, amount) => {
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
        if (!latest)
            continue;
        const total = latest.lines.reduce((sum, line) => sum + Number(line.amount), 0);
        if (total === 0)
            continue;
        const periodStart = new Date(budget.periodStart);
        const periodEnd = new Date(budget.periodEnd);
        const months = [];
        for (let cursor = new Date(periodStart); cursor <= periodEnd; cursor = addMonth(cursor)) {
            months.push(new Date(cursor));
        }
        const allocation = total / Math.max(months.length, 1);
        for (const month of months) {
            if (month < start || month > end)
                continue;
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
//# sourceMappingURL=reportService.js.map