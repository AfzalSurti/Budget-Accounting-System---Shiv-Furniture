import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { createPayment } from "./paymentController.js";
import { renderDocumentPdf } from "../utils/pdf.js";
import {
  formatBadgeLabel,
  formatCurrency,
  formatDate,
  formatPaymentMethod,
  mapDocStatusToBadge,
  mapOrderStatusToBadge,
  mapPaymentStatusToBadge,
} from "../utils/formatters.js";

export const listPortalInvoices = async (contactId: string) => {
  return prisma.customerInvoice.findMany({
    where: { customerId: contactId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listPortalInvoicesTable = async (contactId: string) => {
  const invoices = await prisma.customerInvoice.findMany({
    where: { customerId: contactId },
    select: {
      id: true,
      invoiceNo: true,
      invoiceDate: true,
      dueDate: true,
      totalAmount: true,
      paidAmount: true,
      currency: true,
      status: true,
      paymentState: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return invoices.map((invoice) => ({
    id: invoice.invoiceNo,
    recordId: invoice.id,
    totalAmount: Number(invoice.totalAmount),
    paidAmount: Number(invoice.paidAmount ?? 0),
    paymentState: invoice.paymentState,
    docStatus: invoice.status,
    amount: formatCurrency(Number(invoice.totalAmount), invoice.currency),
    dueDate: formatDate(invoice.dueDate) ?? "",
    issueDate: formatDate(invoice.invoiceDate) ?? "",
    status:
      invoice.status === "posted" &&
      invoice.paymentState !== "paid" &&
      invoice.paymentState !== "partially_paid"
        ? "active"
        : mapDocStatusToBadge(invoice.status, invoice.paymentState),
    statusLabel:
      invoice.status === "posted" &&
      invoice.paymentState !== "paid" &&
      invoice.paymentState !== "partially_paid"
        ? "Posted"
        : formatBadgeLabel(
            mapDocStatusToBadge(invoice.status, invoice.paymentState),
          ),
  }));
};

export const listPortalBills = async (contactId: string) => {
  return prisma.vendorBill.findMany({
    where: { vendorId: contactId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listPortalBillsTable = async (contactId: string) => {
  const bills = await prisma.vendorBill.findMany({
    where: { vendorId: contactId },
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
    vendor: bill.vendor.displayName,
    totalAmount: Number(bill.totalAmount),
    paidAmount: Number(bill.paidAmount ?? 0),
    paymentState: bill.paymentState,
    amount: formatCurrency(Number(bill.totalAmount), bill.currency),
    dueDate: formatDate(bill.dueDate) ?? "",
    issueDate: formatDate(bill.billDate) ?? "",
    status: mapDocStatusToBadge(bill.status, bill.paymentState),
    statusLabel: formatBadgeLabel(
      mapDocStatusToBadge(bill.status, bill.paymentState),
    ),
  }));
};

export const listPortalSalesOrders = async (contactId: string) => {
  return prisma.salesOrder.findMany({
    where: { customerId: contactId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listPortalSalesOrdersTable = async (contactId: string) => {
  const orders = await prisma.salesOrder.findMany({
    where: { customerId: contactId },
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
      customer: order.customer.displayName,
      amount: formatCurrency(totalAmount, order.currency),
      issueDate: formatDate(order.orderDate) ?? "",
      deliveryDate: formatDate(order.deliveryDate) ?? "",
      status: mapOrderStatusToBadge(order.status),
      statusLabel: formatBadgeLabel(mapOrderStatusToBadge(order.status)),
    };
  });
};

export const listPortalPurchaseOrders = async (contactId: string) => {
  return prisma.purchaseOrder.findMany({
    where: { vendorId: contactId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listPortalPurchaseOrdersTable = async (contactId: string) => {
  const orders = await prisma.purchaseOrder.findMany({
    where: { vendorId: contactId },
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
      issueDate: formatDate(order.orderDate) ?? "",
      deliveryDate: formatDate(order.deliveryDate) ?? "",
      status: mapOrderStatusToBadge(order.status),
      statusLabel: formatBadgeLabel(mapOrderStatusToBadge(order.status)),
    };
  });
};

export const listPortalPayments = async (contactId: string) => {
  return prisma.payment.findMany({
    where: { contactId },
    include: { allocations: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listPortalPaymentsTable = async (contactId: string) => {
  const payments = await prisma.payment.findMany({
    where: { contactId },
    select: {
      id: true,
      paymentDate: true,
      method: true,
      amount: true,
      status: true,
      reference: true,
      direction: true,
      contact: { select: { displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((payment) => {
    const description = payment.reference
      ? payment.reference
      : payment.direction === "inbound"
        ? `Invoice Payment - ${payment.contact.displayName}`
        : `Vendor Payment - ${payment.contact.displayName}`;

    return {
      id: payment.reference ?? payment.id,
      recordId: payment.id,
      description,
      amount: formatCurrency(Number(payment.amount)),
      date: formatDate(payment.paymentDate) ?? "",
      method: formatPaymentMethod(payment.method),
      status: mapPaymentStatusToBadge(payment.status),
      statusLabel: formatBadgeLabel(mapPaymentStatusToBadge(payment.status)),
    };
  });
};

export const downloadInvoicePdf = async (
  invoiceId: string,
  contactId: string,
) => {
  const invoice = await prisma.customerInvoice.findFirst({
    where: { id: invoiceId, customerId: contactId },
    include: {
      company: true,
      customer: true,
      lines: { include: { product: true } },
    },
  });
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  const lines = invoice.lines.map((line) => {
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
      title: "Customer Invoice",
      companyName: invoice.company.name,
      docNo: invoice.invoiceNo,
      docDate: formatDate(invoice.invoiceDate) ?? "",
      contactLabel: "Customer",
      contactName: invoice.customer.displayName,
      statusLabel: formatBadgeLabel(
        mapDocStatusToBadge(invoice.status, invoice.paymentState),
      ),
      currency: invoice.currency,
      paymentStatus: invoice.paymentState,
    },
    lines,
    { subtotal, taxTotal, grandTotal },
  );

  return { buffer, filename: `${invoice.invoiceNo}.pdf` };
};

export const downloadBillPdf = async (billId: string, contactId: string) => {
  const bill = await prisma.vendorBill.findFirst({
    where: { id: billId, vendorId: contactId },
    include: {
      company: true,
      vendor: true,
      lines: { include: { product: true } },
    },
  });
  if (!bill) {
    throw new ApiError(404, "Bill not found");
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

  const subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
  const grandTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const taxTotal = grandTotal - subtotal;

  const buffer = await renderDocumentPdf(
    {
      title: "Vendor Bill",
      companyName: bill.company.name,
      docNo: bill.billNo,
      docDate: formatDate(bill.billDate) ?? "",
      contactLabel: "Vendor",
      contactName: bill.vendor.displayName,
      statusLabel: formatBadgeLabel(
        mapDocStatusToBadge(bill.status, bill.paymentState),
      ),
      currency: bill.currency,
      paymentStatus: bill.paymentState,
    },
    lines,
    { subtotal, taxTotal, grandTotal },
  );

  return { buffer, filename: `${bill.billNo}.pdf` };
};

export const makePortalPayment = async (payload: {
  companyId: string;
  contactId: string;
  paymentDate: string;
  method: "cash" | "bank" | "upi" | "card" | "online" | "other";
  reference?: string | null;
  amount: number;
  allocations: Array<{
    targetType: "customer_invoice" | "vendor_bill";
    targetId: string;
    amount: number;
  }>;
}) => {
  for (const allocation of payload.allocations) {
    if (allocation.targetType === "customer_invoice") {
      const invoice = await prisma.customerInvoice.findFirst({
        where: { id: allocation.targetId, customerId: payload.contactId },
      });
      if (!invoice) {
        throw new ApiError(403, "Invoice not accessible for this portal user");
      }
    } else {
      const bill = await prisma.vendorBill.findFirst({
        where: { id: allocation.targetId, vendorId: payload.contactId },
      });
      if (!bill) {
        throw new ApiError(403, "Vendor bill not accessible for this portal user");
      }
    }
  }

  return createPayment({
    companyId: payload.companyId,
    direction: "inbound",
    contactId: payload.contactId,
    paymentDate: payload.paymentDate,
    method: payload.method,
    reference: payload.reference ?? null,
    amount: payload.amount,
    status: "posted",
    allocations: payload.allocations,
  });
};
