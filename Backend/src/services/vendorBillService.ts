import { prisma } from "../config/prisma.js";
import { getContactTagIds, resolveAnalyticAccountId } from "./autoAnalyticService.js";
import { calculatePaymentStatus } from "./paymentService.js";

export const createVendorBill = async (data: any) => {
  return prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const contactTagIds = await getContactTagIds(data.vendorId);

    const bill = await tx.vendorBill.create({
      data: {
        companyId: data.companyId,
        vendorId: data.vendorId,
        billNo: data.billNo,
        billDate: new Date(data.billDate),
        status: data.status,
        paymentState: "not_paid",
      },
    });

    for (const line of data.lines) {
      let categoryId: string | null = null;
      if (line.productId) {
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        categoryId = product?.categoryId ?? null;
      }

      // Automatically resolve the Cost Center (Analytic Account)
      const autoMatch = await resolveAnalyticAccountId({
        companyId: data.companyId,
        docType: "vendor_bill",
        productId: line.productId,
        categoryId,
        contactId: data.vendorId,
        contactTagIds
      });

      const lineTotal = line.qty * line.unitPrice * (1 + (line.taxRate ?? 0) / 100);
      totalAmount += lineTotal;

      await tx.vendorBillLine.create({
        data: {
          vendorBillId: bill.id,
          productId: line.productId,
          analyticAccountId: line.analyticAccountId ?? autoMatch?.analyticAccountId ?? null,
          autoAnalyticModelId: autoMatch?.modelId ?? null,
          autoAnalyticRuleId: autoMatch?.ruleId ?? null,
          matchedFieldsCount: autoMatch?.matchedFieldsCount ?? null,
          qty: line.qty,
          unitPrice: line.unitPrice,
          lineTotal
        },
      });
    }

    return tx.vendorBill.update({
      where: { id: bill.id },
      data: { totalAmount, paymentState: calculatePaymentStatus(0, totalAmount) },
    });
  });
};