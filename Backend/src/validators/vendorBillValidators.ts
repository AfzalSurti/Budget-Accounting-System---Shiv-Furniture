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

const billBody = Joi.object({
  companyId: Joi.string().uuid().required(),
  vendorId: Joi.string().uuid().required(),
  billNo: Joi.string().required(),
  billDate: Joi.date().required(),
  dueDate: Joi.date().allow(null),
  status: Joi.string().valid("draft", "posted", "cancelled").required(),
  currency: Joi.string().default("INR"),
  poId: Joi.string().uuid().allow(null),
  lines: Joi.array().items(lineSchema).min(1).required(),
});

export const createVendorBillSchema = Joi.object({
  body: billBody,
  params: Joi.object({}),
  query: Joi.object({}),
});

export const updateVendorBillSchema = Joi.object({
  body: billBody.fork(["companyId", "vendorId", "billNo", "billDate", "status", "lines"], (schema) => schema.optional()),
  params: Joi.object({ id: Joi.string().uuid().required() }),
  query: Joi.object({}),
});

export const listVendorBillSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({ companyId: Joi.string().uuid().required() }),
});

export const convertVendorBillSchema = Joi.object({
  body: Joi.object({
    billNo: Joi.string().required(),
    billDate: Joi.date().required(),
  }),
  params: Joi.object({ poId: Joi.string().uuid().required() }),
  query: Joi.object({}),
});
