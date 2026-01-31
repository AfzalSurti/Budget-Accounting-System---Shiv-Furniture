import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/apiError.js";
export const createBudget = async (data) => {
    return prisma.$transaction(async (tx) => {
        const budget = await tx.budget.create({
            data: {
                companyId: data.companyId,
                name: data.name,
                periodStart: new Date(data.periodStart),
                periodEnd: new Date(data.periodEnd),
                status: data.status,
                createdBy: data.createdBy ?? null,
            },
        });
        const revision = await tx.budgetRevision.create({
            data: {
                budgetId: budget.id,
                revisionNo: 1,
            },
        });
        if (data.lines.length > 0) {
            await tx.budgetLine.createMany({
                data: data.lines.map((line) => ({
                    budgetRevisionId: revision.id,
                    analyticAccountId: line.analyticAccountId,
                    glAccountId: line.glAccountId ?? null,
                    amount: line.amount,
                })),
            });
        }
        return { budget, revision };
    });
};
export const listBudgets = async (companyId) => {
    return prisma.budget.findMany({
        where: { companyId },
        include: { revisions: { include: { lines: true } } },
        orderBy: { createdAt: "desc" },
    });
};
export const getBudget = async (id) => {
    const budget = await prisma.budget.findUnique({
        where: { id },
        include: { revisions: { include: { lines: true } } },
    });
    if (!budget) {
        throw new ApiError(404, "Budget not found");
    }
    return budget;
};
export const updateBudget = async (id, data) => {
    return prisma.$transaction(async (tx) => {
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.periodStart !== undefined)
            updateData.periodStart = new Date(data.periodStart);
        if (data.periodEnd !== undefined)
            updateData.periodEnd = new Date(data.periodEnd);
        const budget = await tx.budget.update({
            where: { id },
            data: updateData,
        });
        const latestRevision = await tx.budgetRevision.findFirst({
            where: { budgetId: id },
            orderBy: { revisionNo: "desc" },
        });
        const nextRevisionNo = (latestRevision?.revisionNo ?? 0) + 1;
        const revision = await tx.budgetRevision.create({
            data: {
                budgetId: id,
                revisionNo: nextRevisionNo,
                revisionReason: data.revisionReason ?? null,
                createdBy: data.createdBy ?? null,
            },
        });
        if (data.lines && data.lines.length > 0) {
            await tx.budgetLine.createMany({
                data: data.lines.map((line) => ({
                    budgetRevisionId: revision.id,
                    analyticAccountId: line.analyticAccountId,
                    glAccountId: line.glAccountId ?? null,
                    amount: line.amount,
                })),
            });
        }
        return { budget, revision };
    });
};
export const archiveBudget = async (id) => {
    try {
        return await prisma.budget.update({ where: { id }, data: { status: "archived" } });
    }
    catch (error) {
        throw new ApiError(404, "Budget not found", error);
    }
};
//# sourceMappingURL=budgetController.js.map