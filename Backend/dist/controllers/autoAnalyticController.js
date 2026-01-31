import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
export const createAutoAnalyticModel = async (data) => {
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
export const listAutoAnalyticModels = async (companyId) => {
    return prisma.autoAnalyticModel.findMany({
        where: { companyId },
        include: { rules: true },
        orderBy: { createdAt: "desc" },
    });
};
export const getAutoAnalyticModel = async (id) => {
    const model = await prisma.autoAnalyticModel.findUnique({
        where: { id },
        include: { rules: true },
    });
    if (!model) {
        throw new ApiError(404, "Auto analytical model not found");
    }
    return model;
};
export const updateAutoAnalyticModel = async (id, data) => {
    try {
        return await prisma.autoAnalyticModel.update({ where: { id }, data });
    }
    catch (error) {
        throw new ApiError(404, "Auto analytical model not found", error);
    }
};
export const archiveAutoAnalyticModel = async (id) => {
    try {
        return await prisma.autoAnalyticModel.update({ where: { id }, data: { isActive: false } });
    }
    catch (error) {
        throw new ApiError(404, "Auto analytical model not found", error);
    }
};
//# sourceMappingURL=autoAnalyticController.js.map