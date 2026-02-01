import { prisma } from "../config/prisma.js";

export const listGlAccounts = async (companyId: string) => {
  return prisma.gLAccount.findMany({
    where: { companyId, isActive: true },
    orderBy: { code: "asc" },
    select: { id: true, code: true, name: true, accountType: true },
  });
};
