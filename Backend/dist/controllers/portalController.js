import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { createPayment } from "./paymentController.js";
import { formatCurrency, formatDate, formatPaymentMethod, mapDocStatusToBadge, mapOrderStatusToBadge, mapPaymentStatusToBadge, } from "../utils/formatters.js";
export const listPortalInvoices = async (contactId) => {
    return prisma.customerInvoice.findMany({
        where: { customerId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalInvoicesTable = async (contactId) => {
    const invoices = await prisma.customerInvoice.findMany({
        where: { customerId: contactId },
        select: {
            id: true,
            invoiceNo: true,
            invoiceDate: true,
            dueDate: true,
            totalAmount: true,
            currency: true,
            status: true,
            paymentState: true,
        },
        orderBy: { createdAt: "desc" },
    });
    return invoices.map((invoice) => ({
        id: invoice.invoiceNo,
        recordId: invoice.id,
        amount: formatCurrency(Number(invoice.totalAmount), invoice.currency),
        dueDate: formatDate(invoice.dueDate),
        issueDate: formatDate(invoice.invoiceDate),
        status: mapDocStatusToBadge(invoice.status, invoice.paymentState),
    }));
};
export const listPortalBills = async (contactId) => {
    return prisma.vendorBill.findMany({
        where: { vendorId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalBillsTable = async (contactId) => {
    const bills = await prisma.vendorBill.findMany({
        where: { vendorId: contactId },
        select: {
            id: true,
            billNo: true,
            billDate: true,
            dueDate: true,
            totalAmount: true,
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
        amount: formatCurrency(Number(bill.totalAmount), bill.currency),
        dueDate: formatDate(bill.dueDate),
        issueDate: formatDate(bill.billDate),
        status: mapDocStatusToBadge(bill.status, bill.paymentState),
    }));
};
export const listPortalSalesOrders = async (contactId) => {
    return prisma.salesOrder.findMany({
        where: { customerId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalSalesOrdersTable = async (contactId) => {
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
        const totalAmount = order.lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
        return {
            id: order.soNo,
            recordId: order.id,
            customer: order.customer.displayName,
            amount: formatCurrency(totalAmount, order.currency),
            issueDate: formatDate(order.orderDate),
            deliveryDate: formatDate(order.deliveryDate),
            status: mapOrderStatusToBadge(order.status),
        };
    });
};
export const listPortalPurchaseOrders = async (contactId) => {
    return prisma.purchaseOrder.findMany({
        where: { vendorId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalPurchaseOrdersTable = async (contactId) => {
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
        const totalAmount = order.lines.reduce((sum, line) => sum + Number(line.lineTotal), 0);
        return {
            id: order.poNo,
            recordId: order.id,
            vendor: order.vendor.displayName,
            amount: formatCurrency(totalAmount, order.currency),
            issueDate: formatDate(order.orderDate),
            deliveryDate: formatDate(order.deliveryDate),
            status: mapOrderStatusToBadge(order.status),
        };
    });
};
export const listPortalPayments = async (contactId) => {
    return prisma.payment.findMany({
        where: { contactId },
        include: { allocations: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalPaymentsTable = async (contactId) => {
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
            date: formatDate(payment.paymentDate),
            method: formatPaymentMethod(payment.method),
            status: mapPaymentStatusToBadge(payment.status),
        };
    });
};
export const downloadInvoicePdf = async (invoiceId, contactId) => {
    const invoice = await prisma.customerInvoice.findFirst({
        where: { id: invoiceId, customerId: contactId },
    });
    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }
    return {
        invoiceId,
        downloadUrl: `https://example.com/invoices/${invoiceId}.pdf`,
    };
};
export const downloadBillPdf = async (billId, contactId) => {
    const bill = await prisma.vendorBill.findFirst({
        where: { id: billId, vendorId: contactId },
    });
    if (!bill) {
        throw new ApiError(404, "Bill not found");
    }
    return { billId, downloadUrl: `https://example.com/bills/${billId}.pdf` };
};
export const makePortalPayment = async (payload) => {
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
//# sourceMappingURL=portalController.js.map