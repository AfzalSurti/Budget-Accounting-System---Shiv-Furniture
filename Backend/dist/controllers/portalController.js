import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
import { createPayment } from "./paymentController.js";
export const listPortalInvoices = async (contactId) => {
    return prisma.customerInvoice.findMany({
        where: { customerId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalBills = async (contactId) => {
    return prisma.vendorBill.findMany({
        where: { vendorId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalSalesOrders = async (contactId) => {
    return prisma.salesOrder.findMany({
        where: { customerId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalPurchaseOrders = async (contactId) => {
    return prisma.purchaseOrder.findMany({
        where: { vendorId: contactId },
        include: { lines: true },
        orderBy: { createdAt: "desc" },
    });
};
export const listPortalPayments = async (contactId) => {
    return prisma.payment.findMany({
        where: { contactId },
        include: { allocations: true },
        orderBy: { createdAt: "desc" },
    });
};
export const downloadInvoicePdf = async (invoiceId, contactId) => {
    const invoice = await prisma.customerInvoice.findFirst({
        where: { id: invoiceId, customerId: contactId },
    });
    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }
    return { invoiceId, downloadUrl: `https://example.com/invoices/${invoiceId}.pdf` };
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