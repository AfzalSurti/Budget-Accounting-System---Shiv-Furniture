import Joi from "joi";

const lineSchema = Joi.object({
  productId: Joi.string().uuid().allow(null),
  analyticAccountId: Joi.string().uuid().allow(null),
  glAccountId: Joi.string().uuid().allow(null),
  description: Joi.string().allow(null, ""),
  qty: Joi.number().required(),
  unitPrice: Joi.number().required(),
  taxRate: Joi.number().default(0),
});

const invoiceBody = Joi.object({
  companyId: Joi.string().uuid().required(),
  customerId: Joi.string().uuid().required(),
  invoiceNo: Joi.string().required(),
  invoiceDate: Joi.date().required(),
  dueDate: Joi.date().allow(null),
  status: Joi.string().valid("draft", "posted", "cancelled").required(),
  currency: Joi.string().default("INR"),
  soId: Joi.string().uuid().allow(null),
  lines: Joi.array().items(lineSchema).min(1).required(),
});

export const createInvoiceSchema = Joi.object({
  body: invoiceBody,
  params: Joi.object({}),
  query: Joi.object({}),
});

export const updateInvoiceSchema = Joi.object({
  body: invoiceBody.fork(["companyId", "customerId", "invoiceNo", "invoiceDate", "status", "lines"], (schema) => schema.optional()),
  params: Joi.object({ id: Joi.string().uuid().required() }),
  query: Joi.object({}),
});

export const listInvoiceSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({ companyId: Joi.string().uuid().required() }),
});

export const convertInvoiceSchema = Joi.object({
  body: Joi.object({
    invoiceNo: Joi.string().required(),
    invoiceDate: Joi.date().required(),
  }),
  params: Joi.object({ soId: Joi.string().uuid().required() }),
  query: Joi.object({}),
});
