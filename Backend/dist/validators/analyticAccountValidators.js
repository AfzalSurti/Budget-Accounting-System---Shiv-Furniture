import Joi from "joi";
const analyticBody = Joi.object({
    companyId: Joi.string().uuid().required(),
    code: Joi.string().allow(null, ""),
    name: Joi.string().required(),
    parentId: Joi.string().uuid().allow(null),
    isActive: Joi.boolean().optional(),
});
export const createAnalyticAccountSchema = Joi.object({
    body: analyticBody,
    params: Joi.object({}),
    query: Joi.object({}),
});
export const updateAnalyticAccountSchema = Joi.object({
    body: analyticBody.fork(["companyId", "name"], (schema) => schema.optional()),
    params: Joi.object({ id: Joi.string().uuid().required() }),
    query: Joi.object({}),
});
export const listAnalyticAccountSchema = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: Joi.object({ companyId: Joi.string().uuid().required() }),
});
//# sourceMappingURL=analyticAccountValidators.js.map