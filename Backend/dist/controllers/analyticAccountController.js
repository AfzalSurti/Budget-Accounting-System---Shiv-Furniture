import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/apiError.js";
const DEFAULT_COST_CENTERS = [
    { name: "Manufacturing", code: "CC-100" },
    { name: "Sales", code: "CC-200" },
    { name: "Admin", code: "CC-300" },
    { name: "Operations", code: "CC-400" },
    { name: "Capital", code: "CC-500" },
];
const DEPRECATED_COST_CENTERS = ["Deepawali", "Marriage Session", "Furniture Expo 2026"];
export const createAnalyticAccount = async (data) => {
    await prisma.company.upsert({
        where: { id: data.companyId },
        update: {},
        create: {
            id: data.companyId,
            name: "Shiv Furniture",
        },
    });
    const createData = {
        companyId: data.companyId,
        name: data.name,
    };
    if (data.code !== undefined)
        createData.code = data.code;
    if (data.parentId !== undefined)
        createData.parentId = data.parentId;
    if (data.isActive !== undefined)
        createData.isActive = data.isActive;
    return prisma.analyticAccount.create({ data: createData });
};
export const listAnalyticAccounts = async (companyId) => {
    await prisma.company.upsert({
        where: { id: companyId },
        update: {},
        create: {
            id: companyId,
            name: "Shiv Furniture",
        },
    });
    await Promise.all(DEFAULT_COST_CENTERS.map((center) => prisma.analyticAccount.upsert({
        where: { companyId_name: { companyId, name: center.name } },
        update: { code: center.code, isActive: true },
        create: {
            companyId,
            name: center.name,
            code: center.code,
            isActive: true,
        },
    })));
    await prisma.analyticAccount.updateMany({
        where: {
            companyId,
            name: { in: DEPRECATED_COST_CENTERS },
        },
        data: { isActive: false },
    });
    return prisma.analyticAccount.findMany({
        where: { companyId, isActive: true },
        orderBy: { name: "asc" },
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