import Joi from "joi";

const ruleSchema = Joi.object({
  docType: Joi.string().valid("vendor_bill", "customer_invoice", "purchase_order", "sales_order").required(),
  matchProductId: Joi.string().uuid().allow(null),
  matchCategoryId: Joi.string().uuid().allow(null),
  matchContactId: Joi.string().uuid().allow(null),
  assignAnalyticAccountId: Joi.string().uuid().required(),
  rulePriority: Joi.number().default(100),
});

const modelBody = Joi.object({
  companyId: Joi.string().uuid().required(),
  name: Joi.string().required(),
  priority: Joi.number().default(100),
  rules: Joi.array().items(ruleSchema).default([]),
});

export const createAutoAnalyticSchema = Joi.object({
  body: modelBody,
  params: Joi.object({}),
  query: Joi.object({}),
});

export const updateAutoAnalyticSchema = Joi.object({
  body: modelBody.fork(["companyId", "name"], (schema) => schema.optional()),
  params: Joi.object({ id: Joi.string().uuid().required() }),
  query: Joi.object({}),
});

export const listAutoAnalyticSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({ companyId: Joi.string().uuid().required() }),
});
