import { prisma } from "../config/prisma.js";

type DocType = "vendor_bill" | "customer_invoice" | "purchase_order" | "sales_order";

export const resolveAnalyticAccountId = async (input: {
  companyId: string;
  docType: DocType;
  productId?: string | null;
  categoryId?: string | null;
  contactId?: string | null;
}) => {
  const models = await prisma.autoAnalyticModel.findMany({
    where: { companyId: input.companyId, isActive: true },
    include: {
      rules: {
        where: { isActive: true, docType: input.docType },
        orderBy: { rulePriority: "asc" },
      },
    },
    orderBy: { priority: "asc" },
  });

  for (const model of models) {
    for (const rule of model.rules) {
      const matchProduct = rule.matchProductId ? rule.matchProductId === input.productId : true;
      const matchCategory = rule.matchCategoryId ? rule.matchCategoryId === input.categoryId : true;
      const matchContact = rule.matchContactId ? rule.matchContactId === input.contactId : true;

      if (matchProduct && matchCategory && matchContact) {
        return rule.assignAnalyticAccountId;
      }
    }
  }

  return null;
};
