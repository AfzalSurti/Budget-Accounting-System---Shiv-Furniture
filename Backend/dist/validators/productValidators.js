import Joi from "joi";
const productBody = Joi.object({
    companyId: Joi.string().uuid().required(),
    name: Joi.string().required(),
    categoryId: Joi.string().uuid().allow(null),
    categoryName: Joi.string().allow(null, ""),
    sku: Joi.string().allow(null, ""),
    uom: Joi.string().default("unit"),
    salePrice: Joi.number().min(0).optional(),
    costPrice: Joi.number().min(0).optional(),
    isActive: Joi.boolean().optional(),
});
export const createProductSchema = Joi.object({
    body: productBody,
    params: Joi.object({}),
    query: Joi.object({}),
});
export const updateProductSchema = Joi.object({
    body: productBody.fork(["companyId", "name"], (schema) => schema.optional()),
    params: Joi.object({ id: Joi.string().uuid().required() }),
    query: Joi.object({}),
});
export const listProductSchema = Joi.object({
    body: Joi.object({}),
    params: Joi.object({}),
    query: Joi.object({ companyId: Joi.string().uuid().required() }),
});
//# sourceMappingURL=productValidators.js.map