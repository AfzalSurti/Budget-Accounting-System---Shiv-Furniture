import { prisma } from "../config/prisma.js";
export const getContactTagIds = async (contactId) => {
    if (!contactId)
        return [];
    const tags = await prisma.contactTagAssignment.findMany({
        where: { contactId },
        select: { tagId: true },
    });
    return tags.map((tag) => tag.tagId);
};
export const resolveAnalyticAccountId = async (input) => {
    const contactTagIds = input.contactTagIds ?? (await getContactTagIds(input.contactId));
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
    const candidates = [];
    for (const model of models) {
        for (const rule of model.rules) {
            let matchedCount = 0;
            let hasAnyField = false;
            if (rule.matchProductId) {
                hasAnyField = true;
                if (rule.matchProductId === input.productId)
                    matchedCount += 1;
            }
            if (rule.matchCategoryId) {
                hasAnyField = true;
                if (rule.matchCategoryId === input.categoryId)
                    matchedCount += 1;
            }
            if (rule.matchContactId) {
                hasAnyField = true;
                if (rule.matchContactId === input.contactId)
                    matchedCount += 1;
            }
            if (rule.matchContactTagId) {
                hasAnyField = true;
                if (contactTagIds.includes(rule.matchContactTagId))
                    matchedCount += 1;
            }
            if (!hasAnyField || matchedCount === 0) {
                continue;
            }
            candidates.push({
                analyticAccountId: rule.assignAnalyticAccountId,
                modelId: model.id,
                ruleId: rule.id,
                matchedFieldsCount: matchedCount,
                modelPriority: model.priority,
                rulePriority: rule.rulePriority,
            });
        }
    }
    candidates.sort((a, b) => {
        if (b.matchedFieldsCount !== a.matchedFieldsCount) {
            return b.matchedFieldsCount - a.matchedFieldsCount;
        }
        if (a.modelPriority !== b.modelPriority) {
            return a.modelPriority - b.modelPriority;
        }
        return a.rulePriority - b.rulePriority;
    });
    const best = candidates[0];
    if (!best)
        return null;
    return {
        analyticAccountId: best.analyticAccountId,
        modelId: best.modelId,
        ruleId: best.ruleId,
        matchedFieldsCount: best.matchedFieldsCount,
    };
};
//# sourceMappingURL=autoAnalyticService.js.map