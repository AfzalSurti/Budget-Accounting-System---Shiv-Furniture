import Joi from "joi";
const budgetLineSchema = Joi.object({
    analyticAccountId: Joi.string().uuid().required(),
    glAccountId: Joi.string().uuid().allow(null),
    amount: Joi.number().required(),
});
const budgetBody = Joi.object({
    companyId: Joi.string().uuid().required(),
    name: Joi.string().required(),
    periodStart: Joi.date().required(),
    periodEnd: Joi.date().required(),
    status: Joi.string().valid("draft", "approved", "archived").required(),
    createdBy: Joi.string().uuid().allow(null),
    lines: Joi.array().items(budgetLineSchema).default([]),
});
export const createBudgetSchema = Joi.object({
    body: budgetBody,
    params: Joi.object({}),
    query: Joi.object({}),
});
export const updateBudgetSchema = Joi.object({
    body: budgetBody.fork(["companyId", "name", "periodStart", "periodEnd", "status"], (schema) => schema.optional()).keys({
        revisionReason: Joi.string().allow(null, ""),
    }),
    params: Joi.object({ id: Joi.string().uuid().required() }),
    query: Joi.object({}),
});
export const listBudgetSchema = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: Joi.object({ companyId: Joi.string().uuid().required() }),
});
//# sourceMappingURL=budgetValidators.js.map