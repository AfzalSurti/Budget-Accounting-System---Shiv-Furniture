import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import {
  applyPaymentToBill,
  applyPaymentToInvoice,
} from "../services/paymentService.js";
import {
  formatBadgeLabel,
  formatCurrency,
  formatDate,
  formatPaymentMethod,
  mapPaymentStatusToBadge,
} from "../utils/formatters.js";

export const createPayment = async (data: {
  companyId: string;
  direction: "inbound" | "outbound";
  contactId: string;
  paymentDate: string;
  method: "cash" | "bank" | "upi" | "card" | "online" | "other";
  reference?: string | null;
  amount: number;
  status: "draft" | "posted" | "void";
  allocations: Array<{
    targetType: "customer_invoice" | "vendor_bill";
    targetId: string;
    amount: number;
  }>;
}) => {
  const totalAllocation = data.allocations.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  if (totalAllocation > data.amount) {
    throw new ApiError(400, "Allocated amount cannot exceed payment amount");
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        companyId: data.companyId,
        direction: data.direction,
        contactId: data.contactId,
        paymentDate: new Date(data.paymentDate),
        method: data.method,
        reference: data.reference ?? null,
        amount: data.amount,
        status: data.status,
      },
    });

    for (const allocation of data.allocations) {
      if (allocation.targetType === "customer_invoice") {
        const invoice = await tx.customerInvoice.findUnique({
          where: { id: allocation.targetId },
        });
        if (!invoice) {
          throw new ApiError(404, "Invoice not found");
        }
        if (invoice.status !== "posted") {
          throw new ApiError(400, "Invoice must be posted before applying payment");
        }
        const remaining =
          Number(invoice.totalAmount) - Number(invoice.paidAmount);
        if (allocation.amount > remaining) {
          throw new ApiError(
            400,
            "Payment allocation exceeds invoice remaining balance",
          );
        }
      } else {
        const bill = await tx.vendorBill.findUnique({
          where: { id: allocation.targetId },
        });
        if (!bill) {
          throw new ApiError(404, "Vendor bill not found");
        }
        if (bill.status !== "posted") {
          throw new ApiError(400, "Vendor bill must be posted before applying payment");
        }
        const remaining = Number(bill.totalAmount) - Number(bill.paidAmount);
        if (allocation.amount > remaining) {
          throw new ApiError(
            400,
            "Payment allocation exceeds bill remaining balance",
          );
        }
      }

      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          targetType: allocation.targetType,
          targetId: allocation.targetId,
          amount: allocation.amount,
        },
      });

      if (allocation.targetType === "customer_invoice") {
        await tx.customerInvoicePayment.create({
          data: {
            invoiceId: allocation.targetId,
            paymentId: payment.id,
            amount: allocation.amount,
          },
        });
        await applyPaymentToInvoice(allocation.targetId, allocation.amount, tx);
      } else {
        await tx.vendorBillPayment.create({
          data: {
            billId: allocation.targetId,
            paymentId: payment.id,
            amount: allocation.amount,
          },
        });
        await applyPaymentToBill(allocation.targetId, allocation.amount, tx);
      }
    }

    return payment;
  });
};

export const listPayments = async (companyId: string) => {
  return prisma.payment.findMany({
    where: { companyId },
    include: { allocations: true },
    orderBy: { createdAt: "desc" },
  });
};

export const listPaymentsTable = async (companyId: string) => {
  const payments = await prisma.payment.findMany({
    where: { companyId },
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

export const getPayment = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { allocations: true },
  });
  if (!payment) {
    throw new ApiError(404, "Payment not found");
  }
  return payment;
};
