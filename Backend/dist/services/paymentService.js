import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
export const calculatePaymentStatus = (totalPaid, totalAmount) => {
    if (totalPaid >= totalAmount) {
        return "Paid";
    }
    if (totalPaid > 0 && totalPaid < totalAmount) {
        return "Partially Paid";
    }
    return "Not Paid";
};
export const applyPaymentToInvoice = async (invoiceId, amount, client = prisma) => {
    const invoice = await client.customerInvoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) {
        throw new ApiError(404, "Invoice not found");
    }
    const totalPaid = Number(invoice.paidAmount) + amount;
    const status = calculatePaymentStatus(totalPaid, Number(invoice.totalAmount));
    return client.customerInvoice.update({
        where: { id: invoiceId },
        data: {
            paidAmount: totalPaid,
            paymentState: status,
        },
    });
};
export const applyPaymentToBill = async (billId, amount, client = prisma) => {
    const bill = await client.vendorBill.findUnique({ where: { id: billId } });
    if (!bill) {
        throw new ApiError(404, "Vendor bill not found");
    }
    const totalPaid = Number(bill.paidAmount) + amount;
    const status = calculatePaymentStatus(totalPaid, Number(bill.totalAmount));
    return client.vendorBill.update({
        where: { id: billId },
        data: {
            paidAmount: totalPaid,
            paymentState: status,
        },
    });
};
//# sourceMappingURL=paymentService.js.map