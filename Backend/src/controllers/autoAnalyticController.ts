import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";

export const createAutoAnalyticModel = async (data: {
  companyId: string;
  name: string;
  priority?: number;
  rules: Array<{
    docType: "vendor_bill" | "customer_invoice" | "purchase_order" | "sales_order";
    matchProductId?: string | null;
    matchCategoryId?: string | null;
    matchContactId?: string | null;
    assignAnalyticAccountId: string;
    rulePriority?: number;
  }>;
}) => {
  return prisma.$transaction(async (tx) => {
    const model = await tx.autoAnalyticModel.create({
      data: {
        companyId: data.companyId,
        name: data.name,
        priority: data.priority ?? 100,
      },
    });

    if (data.rules.length > 0) {
      await tx.autoAnalyticRule.createMany({
        data: data.rules.map((rule) => ({
          modelId: model.id,
          docType: rule.docType,
          matchProductId: rule.matchProductId ?? null,
          matchCategoryId: rule.matchCategoryId ?? null,
          matchContactId: rule.matchContactId ?? null,
          assignAnalyticAccountId: rule.assignAnalyticAccountId,
          rulePriority: rule.rulePriority ?? 100,
        })),
      });
    }

    return model;
  });
};

export const listAutoAnalyticModels = async (companyId: string) => {
  return prisma.autoAnalyticModel.findMany({
    where: { companyId },
    include: { rules: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getAutoAnalyticModel = async (id: string) => {
  const model = await prisma.autoAnalyticModel.findUnique({
    where: { id },
    include: { rules: true },
  });
  if (!model) {
    throw new ApiError(404, "Auto analytical model not found");
  }
  return model;
};

export const updateAutoAnalyticModel = async (id: string, data: Partial<Record<string, unknown>>) => {
  try {
    return await prisma.autoAnalyticModel.update({ where: { id }, data });
  } catch (error) {
    throw new ApiError(404, "Auto analytical model not found", error);
  }
};

export const archiveAutoAnalyticModel = async (id: string) => {
  try {
    return await prisma.autoAnalyticModel.update({ where: { id }, data: { isActive: false } });
  } catch (error) {
    throw new ApiError(404, "Auto analytical model not found", error);
  }
};
