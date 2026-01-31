import { prisma } from "../config/prisma.js";
import { budgetVsActual } from "../services/reportService.js";
import { formatCurrency, formatDate } from "../utils/formatters.js";

const clampConfidence = (value: number) => Math.max(0.1, Math.min(0.99, value));

export const listRiskInsights = async (
  companyId: string,
  start: Date,
  end: Date,
) => {
  const now = new Date();

  const overdueInvoices = await prisma.customerInvoice.findMany({
    where: {
      companyId,
      status: "posted",
      invoiceDate: { gte: start, lte: end },
      dueDate: { lt: now },
      paymentState: { not: "Paid" },
    },
    select: {
      id: true,
      invoiceNo: true,
      dueDate: true,
      totalAmount: true,
      currency: true,
      customer: { select: { displayName: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const overdueBills = await prisma.vendorBill.findMany({
    where: {
      companyId,
      status: "posted",
      billDate: { gte: start, lte: end },
      dueDate: { lt: now },
      paymentState: { not: "Paid" },
    },
    select: {
      id: true,
      billNo: true,
      dueDate: true,
      totalAmount: true,
      currency: true,
      vendor: { select: { displayName: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const riskItems = [
    ...overdueInvoices.map((invoice) => {
      const daysOverdue = invoice.dueDate
        ? Math.max(
            0,
            Math.ceil(
              (now.getTime() - invoice.dueDate.getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 0;
      return {
        id: invoice.id,
        type: "invoice" as const,
        title: `Overdue invoice ${invoice.invoiceNo}`,
        counterparty: invoice.customer.displayName,
        amount: formatCurrency(Number(invoice.totalAmount), invoice.currency),
        dueDate: formatDate(invoice.dueDate),
        confidence: clampConfidence(0.6 + daysOverdue / 60),
      };
    }),
    ...overdueBills.map((bill) => {
      const daysOverdue = bill.dueDate
        ? Math.max(
            0,
            Math.ceil(
              (now.getTime() - bill.dueDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          )
        : 0;
      return {
        id: bill.id,
        type: "vendor_bill" as const,
        title: `Overdue bill ${bill.billNo}`,
        counterparty: bill.vendor.displayName,
        amount: formatCurrency(Number(bill.totalAmount), bill.currency),
        dueDate: formatDate(bill.dueDate),
        confidence: clampConfidence(0.55 + daysOverdue / 60),
      };
    }),
  ];

  return riskItems;
};

export const listOpportunityInsights = async (
  companyId: string,
  start: Date,
  end: Date,
) => {
  const rows = await budgetVsActual(companyId, start, end);

  const opportunities = rows
    .filter((row) => row.remainingBalance > 0)
    .sort((a, b) => b.remainingBalance - a.remainingBalance)
    .slice(0, 6)
    .map((row) => {
      const utilization =
        row.budgetedAmount === 0 ? 0 : row.actualAmount / row.budgetedAmount;
      return {
        id: row.analyticAccountId ?? "unassigned",
        title: "Reallocate unused budget",
        analyticAccountId: row.analyticAccountId,
        budgetedAmount: row.budgetedAmount,
        actualAmount: row.actualAmount,
        remainingAmount: row.remainingBalance,
        confidence: clampConfidence(0.4 + (1 - utilization) * 0.6),
      };
    });

  return opportunities;
};

export const listAnomalyInsights = async (
  companyId: string,
  start: Date,
  end: Date,
) => {
  const invoices = await prisma.customerInvoice.findMany({
    where: {
      companyId,
      invoiceDate: { gte: start, lte: end },
      status: "posted",
    },
    select: {
      id: true,
      invoiceNo: true,
      invoiceDate: true,
      totalAmount: true,
      currency: true,
      customer: { select: { displayName: true } },
    },
  });

  const payments = await prisma.payment.findMany({
    where: {
      companyId,
      paymentDate: { gte: start, lte: end },
      status: "posted",
    },
    select: {
      id: true,
      paymentDate: true,
      amount: true,
      method: true,
      contact: { select: { displayName: true } },
    },
  });

  const invoiceAvg = invoices.length
    ? invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0) /
      invoices.length
    : 0;
  const paymentAvg = payments.length
    ? payments.reduce((sum, payment) => sum + Number(payment.amount), 0) /
      payments.length
    : 0;

  const anomalies = [
    ...invoices
      .filter(
        (invoice) =>
          invoiceAvg > 0 && Number(invoice.totalAmount) > invoiceAvg * 1.8,
      )
      .map((invoice) => ({
        id: invoice.id,
        type: "invoice" as const,
        title: `Unusually large invoice ${invoice.invoiceNo}`,
        counterparty: invoice.customer.displayName,
        amount: formatCurrency(Number(invoice.totalAmount), invoice.currency),
        date: formatDate(invoice.invoiceDate),
        confidence: clampConfidence(
          0.5 + (Number(invoice.totalAmount) / invoiceAvg - 1) * 0.25,
        ),
      })),
    ...payments
      .filter(
        (payment) =>
          paymentAvg > 0 && Number(payment.amount) > paymentAvg * 1.8,
      )
      .map((payment) => ({
        id: payment.id,
        type: "payment" as const,
        title: "Unusually large payment",
        counterparty: payment.contact.displayName,
        amount: formatCurrency(Number(payment.amount)),
        date: formatDate(payment.paymentDate),
        confidence: clampConfidence(
          0.5 + (Number(payment.amount) / paymentAvg - 1) * 0.25,
        ),
      })),
  ];

  return anomalies;
};
