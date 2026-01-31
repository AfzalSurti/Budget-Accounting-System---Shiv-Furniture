import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
export const calculatePaymentStatus = (totalPaid, totalAmount) => {
    if (totalPaid >= totalAmount) {
        return "paid";
    }
    if (totalPaid > 0 && totalPaid < totalAmount) {
        return "partially_paid";
    }
    return "not_paid";
};
const sumAmounts = (rows) => rows.reduce((sum, row) => sum + Number(row.amount), 0);
export const recomputeInvoicePaymentState = async (invoiceId, client = prisma) => {
    const invoice = await client.customerInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }
    const rows = await client.customerInvoicePayment.findMany({
        where: { invoiceId, payment: { status: "posted" } },
        select: { amount: true },
    });
    const totalPaid = sumAmounts(rows);
    const status = calculatePaymentStatus(totalPaid, Number(invoice.totalAmount));
    return client.customerInvoice.update({
        where: { id: invoiceId },
        data: { paidAmount: totalPaid, paymentState: status },
    });
};
export const recomputeBillPaymentState = async (billId, client = prisma) => {
    const bill = await client.vendorBill.findUnique({ where: { id: billId } });
    if (!bill) {
        throw new ApiError(404, "Vendor bill not found");
    }
    const rows = await client.vendorBillPayment.findMany({
        where: { billId, payment: { status: "posted" } },
        select: { amount: true },
    });
    const totalPaid = sumAmounts(rows);
    const status = calculatePaymentStatus(totalPaid, Number(bill.totalAmount));
    return client.vendorBill.update({
        where: { id: billId },
        data: { paidAmount: totalPaid, paymentState: status },
    });
};
export const applyPaymentToInvoice = async (invoiceId, _amount, client = prisma) => {
    return recomputeInvoicePaymentState(invoiceId, client);
};
export const applyPaymentToBill = async (billId, _amount, client = prisma) => {
    return recomputeBillPaymentState(billId, client);
};
//# sourceMappingURL=paymentService.js.map