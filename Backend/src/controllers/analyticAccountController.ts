import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";

export const createAnalyticAccount = async (data: {
  companyId: string;
  code?: string | null;
  name: string;
  parentId?: string | null;
  isActive?: boolean;
}) => {
  return prisma.analyticAccount.create({ data });
};

export const listAnalyticAccounts = async (companyId: string) => {
  return prisma.analyticAccount.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};

export const getAnalyticAccount = async (id: string) => {
  const account = await prisma.analyticAccount.findUnique({ where: { id } });
  if (!account) {
    throw new ApiError(404, "Analytical account not found");
  }
  return account;
};

export const updateAnalyticAccount = async (id: string, data: Partial<Record<string, unknown>>) => {
  try {
    return await prisma.analyticAccount.update({ where: { id }, data });
  } catch (error) {
    throw new ApiError(404, "Analytical account not found", error);
  }
};

export const archiveAnalyticAccount = async (id: string) => {
  try {
    return await prisma.analyticAccount.update({ where: { id }, data: { isActive: false } });
  } catch (error) {
    throw new ApiError(404, "Analytical account not found", error);
  }
};
