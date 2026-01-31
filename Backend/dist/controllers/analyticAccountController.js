import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
export const createAnalyticAccount = async (data) => {
    return prisma.analyticAccount.create({ data });
};
export const listAnalyticAccounts = async (companyId) => {
    return prisma.analyticAccount.findMany({
        where: { companyId },
        orderBy: { createdAt: "desc" },
    });
};
export const getAnalyticAccount = async (id) => {
    const account = await prisma.analyticAccount.findUnique({ where: { id } });
    if (!account) {
        throw new ApiError(404, "Analytical account not found");
    }
    return account;
};
export const updateAnalyticAccount = async (id, data) => {
    try {
        return await prisma.analyticAccount.update({ where: { id }, data });
    }
    catch (error) {
        throw new ApiError(404, "Analytical account not found", error);
    }
};
export const archiveAnalyticAccount = async (id) => {
    try {
        return await prisma.analyticAccount.update({ where: { id }, data: { isActive: false } });
    }
    catch (error) {
        throw new ApiError(404, "Analytical account not found", error);
    }
};
//# sourceMappingURL=analyticAccountController.js.map